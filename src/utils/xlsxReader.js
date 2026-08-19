// Lector de archivos .xlsx sin dependencias externas: evita traer una
// librería completa de parseo de Excel (con historial de CVEs, como
// "xlsx"/SheetJS) solo para leer un archivo de carga masiva. Un .xlsx es un
// ZIP con XML adentro, así que esto localiza las entradas que necesitamos
// (hoja + cadenas compartidas) directamente en el ZIP, las descomprime con
// la API nativa del navegador (DecompressionStream) y extrae las filas con
// el mismo parseo por expresiones regulares ya usado para leer el catálogo
// de provincias/cantones/distritos.

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Tu navegador no soporta leer archivos .xlsx aquí. Actualízalo o usa el formato CSV.')
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  const buf = await new Response(stream).arrayBuffer()
  return new Uint8Array(buf)
}

function u16(view, offset) { return view.getUint16(offset, true) }
function u32(view, offset) { return view.getUint32(offset, true) }

async function extractZipEntry(buffer, entryName) {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const EOCD_SIG = 0x06054b50
  let eocdOffset = -1
  const searchStart = Math.max(0, buffer.byteLength - 66000)
  for (let i = buffer.byteLength - 22; i >= searchStart; i--) {
    if (u32(view, i) === EOCD_SIG) { eocdOffset = i; break }
  }
  if (eocdOffset === -1) throw new Error('Archivo .xlsx inválido: no se encontró el índice del ZIP.')

  const totalEntries = u16(view, eocdOffset + 10)
  const centralDirOffset = u32(view, eocdOffset + 16)

  let offset = centralDirOffset
  for (let i = 0; i < totalEntries; i++) {
    if (u32(view, offset) !== 0x02014b50) break
    const compMethod = u16(view, offset + 10)
    const compSize = u32(view, offset + 20)
    const nameLen = u16(view, offset + 28)
    const extraLen = u16(view, offset + 30)
    const commentLen = u16(view, offset + 32)
    const localHeaderOffset = u32(view, offset + 42)
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLen))

    if (name === entryName) {
      const lNameLen = u16(view, localHeaderOffset + 26)
      const lExtraLen = u16(view, localHeaderOffset + 28)
      const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen
      const compData = bytes.slice(dataStart, dataStart + compSize)
      if (compMethod === 0) return compData
      if (compMethod === 8) return await inflateRaw(compData)
      throw new Error('El archivo .xlsx usa un método de compresión no soportado.')
    }
    offset += 46 + nameLen + extraLen + commentLen
  }
  return null
}

function decodeXmlEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
}

function parseSharedStrings(xml) {
  const strings = []
  const siRegex = /<si>([\s\S]*?)<\/si>/g
  let m
  while ((m = siRegex.exec(xml))) {
    const tRegex = /<t[^>]*>([\s\S]*?)<\/t>/g
    let tm, text = ''
    while ((tm = tRegex.exec(m[1]))) text += tm[1]
    strings.push(decodeXmlEntities(text))
  }
  return strings
}

function colToIndex(col) {
  let idx = 0
  for (let i = 0; i < col.length; i++) idx = idx * 26 + (col.charCodeAt(i) - 64)
  return idx - 1
}

function parseSheetRows(xml, sharedStrings) {
  const rows = []
  const rowRegex = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g
  let rm
  while ((rm = rowRegex.exec(xml))) {
    const rowNum = parseInt(rm[1], 10)
    const cellRegex = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g
    let cm
    const row = []
    while ((cm = cellRegex.exec(rm[2]))) {
      const attrs = cm[1]
      const inner = cm[2] || ''
      const rAttr = attrs.match(/\br="([A-Z]+)(\d+)"/)
      if (!rAttr) continue
      const colIdx = colToIndex(rAttr[1])
      const tAttr = attrs.match(/\bt="([^"]*)"/)
      const type = tAttr ? tAttr[1] : null
      const vMatch = inner.match(/<v>([\s\S]*?)<\/v>/)
      const raw = vMatch ? vMatch[1] : ''
      let value = ''
      if (type === 's') value = sharedStrings[parseInt(raw, 10)] || ''
      else if (type === 'str') value = decodeXmlEntities(raw)
      else if (type === 'inlineStr') {
        const isMatch = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/)
        value = isMatch ? decodeXmlEntities(isMatch[1]) : ''
      } else value = raw
      row[colIdx] = value
    }
    rows[rowNum] = row
  }
  const out = []
  for (let i = 1; i < rows.length; i++) out.push(rows[i] || [])
  return out
}

/**
 * Lee un archivo .xlsx (primera hoja) y devuelve sus filas como arreglos de
 * celdas en texto, incluyendo la fila de encabezado en la posición 0.
 * @param {File} file
 * @returns {Promise<string[][]>}
 */
export async function readXlsxRows(file) {
  const buffer = await file.arrayBuffer()
  const decoder = new TextDecoder('utf-8')

  const sheetBytes = await extractZipEntry(buffer, 'xl/worksheets/sheet1.xml')
  if (!sheetBytes) throw new Error('No se encontró la hoja de datos dentro del archivo .xlsx.')

  let sharedStrings = []
  const sharedBytes = await extractZipEntry(buffer, 'xl/sharedStrings.xml')
  if (sharedBytes) sharedStrings = parseSharedStrings(decoder.decode(sharedBytes))

  return parseSheetRows(decoder.decode(sheetBytes), sharedStrings)
}
