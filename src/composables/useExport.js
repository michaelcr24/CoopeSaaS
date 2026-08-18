import writeXlsxFile from 'write-excel-file/browser'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from './useAuth.js'

const CONTACT_EMAIL = 'info@prisma360.co.cr'
const LOGO_URL = '/logo.png'

let _logoInfo = null
async function getLogoInfo() {
  if (_logoInfo) return _logoInfo
  try {
    const res = await fetch(LOGO_URL)
    const blob = await res.blob()
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const { width, height } = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = dataUrl
    })
    _logoInfo = { dataUrl, ratio: height / width }
  } catch {
    _logoInfo = null // sin logo si no se pudo cargar; el resto del documento se genera igual
  }
  return _logoInfo
}

function sanitizeFilename(name) {
  return (name || 'reporte').toString().trim().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '_') || 'reporte'
}

function normalizeCols(rows, headers) {
  return headers ?? Object.keys(rows[0]).map((k) => ({ key: k, label: k }))
}

/**
 * Exporta un array de objetos como archivo Excel (.xlsx) real.
 * @param {Array}  rows     - Datos a exportar
 * @param {Array}  headers  - [{ key, label }] columnas a incluir (en orden)
 * @param {string} filename - Nombre del archivo sin extensión
 */
export async function exportExcel(rows, headers, filename = 'reporte') {
  if (!rows?.length) return
  const cols = normalizeCols(rows, headers)
  const columns = cols.map((c) => ({
    header: c.label,
    cell: (row) => (row[c.key] ?? '').toString(),
  }))
  await writeXlsxFile(rows, { columns }).toFile(`${sanitizeFilename(filename)}.xlsx`)
}

// Encabezado (logo + cooperativa + titulo + fecha) y pie de pagina (contacto +
// logo + numero de pagina) compartidos por todos los PDF de la plantilla.
function makeHeaderFooter(doc, { title, cooperativaNombre, logo, pageWidth, pageHeight, fecha }) {
  function drawHeader() {
    if (logo) {
      const w = 22
      doc.addImage(logo.dataUrl, 'PNG', 14, 9, w, w * logo.ratio)
    }
    doc.setFontSize(13)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(19, 60, 101)
    doc.text(cooperativaNombre || 'CoopeSaaS', 42, 17)
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0)
    doc.text(title, 42, 24)
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(fecha, pageWidth - 14, 17, { align: 'right' })
    doc.setTextColor(0)
    doc.setDrawColor(210)
    doc.line(14, 33, pageWidth - 14, 33)
  }

  function drawFooter(pageNumber, pageCount) {
    const y = pageHeight - 12
    if (logo) {
      const h = 8
      doc.addImage(logo.dataUrl, 'PNG', 14, y - h + 2, h / logo.ratio, h)
    }
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(CONTACT_EMAIL, pageWidth / 2, y, { align: 'center' })
    doc.text(`Página ${pageNumber} de ${pageCount}`, pageWidth - 14, y, { align: 'right' })
    doc.setTextColor(0)
  }

  return { drawHeader, drawFooter }
}

function drawAllFooters(doc, drawFooter) {
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    drawFooter(i, pageCount)
  }
}

/**
 * Exporta un listado a PDF con la plantilla institucional: encabezado con
 * logo + nombre de la cooperativa + título del listado + fecha, tabla de
 * registros, y pie de página con contacto, logo y número de página.
 * @param {Array}  rows    - Datos a exportar
 * @param {Array}  headers - [{ key, label }] columnas a incluir (en orden)
 * @param {string} title   - Título del listado (se usa también como nombre de archivo)
 */
export async function exportPDF(rows, headers, title = 'Reporte') {
  if (!rows?.length) return

  const { cooperativaNombre } = useAuth()
  const cols = normalizeCols(rows, headers)
  const body = rows.map((row) => cols.map((c) => (row[c.key] ?? '').toString()))
  const logo = await getLogoInfo()

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const fecha = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })
  const { drawHeader, drawFooter } = makeHeaderFooter(doc, { title, cooperativaNombre: cooperativaNombre.value, logo, pageWidth, pageHeight, fecha })

  autoTable(doc, {
    head: [cols.map((c) => c.label)],
    body,
    startY: 38,
    margin: { top: 38, bottom: 22 },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [19, 60, 101] },
    didDrawPage: drawHeader,
  })

  drawAllFooters(doc, drawFooter)
  doc.save(`${sanitizeFilename(title)}.pdf`)
}

// Dibuja los pares etiqueta/valor de una boleta en dos columnas, con el
// encabezado/pie institucional y una zona de firmas al final.
function drawBoleta({ title, rows, observacionesLabel, observaciones, resolucion }) {
  return async function build() {
    const { cooperativaNombre } = useAuth()
    const logo = await getLogoInfo()
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const fecha = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })
    const { drawHeader, drawFooter } = makeHeaderFooter(doc, { title, cooperativaNombre: cooperativaNombre.value, logo, pageWidth, pageHeight, fecha })
    drawHeader()

    let y = 45
    const colWidth = (pageWidth - 28) / 2
    function field(label, value, x) {
      doc.setFontSize(7.5); doc.setTextColor(120); doc.text(label, x, y)
      doc.setFontSize(9.5); doc.setTextColor(20); doc.text(String(value ?? '—') || '—', x, y + 5)
    }
    rows.forEach(([l1, v1, l2, v2]) => {
      field(l1, v1, 14)
      field(l2, v2, 14 + colWidth)
      y += 13
    })

    y += 2
    doc.setFontSize(7.5); doc.setTextColor(120); doc.text(observacionesLabel, 14, y)
    doc.setFontSize(9.5); doc.setTextColor(20)
    doc.text(doc.splitTextToSize(observaciones || '—', pageWidth - 28), 14, y + 5)
    y += 20

    if (resolucion) {
      doc.setDrawColor(230); doc.line(14, y, pageWidth - 14, y); y += 8
      field('Resuelto por', resolucion.resueltoPor, 14)
      field('Fecha de resolución', resolucion.fecha, 14 + colWidth)
      y += 13
      if (resolucion.comentario) {
        doc.setFontSize(7.5); doc.setTextColor(120); doc.text(resolucion.comentarioLabel, 14, y)
        doc.setFontSize(9.5); doc.setTextColor(20)
        doc.text(doc.splitTextToSize(resolucion.comentario, pageWidth - 28), 14, y + 5)
        y += 20
      }
    }

    const sigY = pageHeight - 45
    doc.setDrawColor(150)
    doc.line(20, sigY, 90, sigY)
    doc.line(pageWidth - 90, sigY, pageWidth - 20, sigY)
    doc.setFontSize(8.5); doc.setTextColor(80)
    doc.text('Firma del colaborador', 55, sigY + 5, { align: 'center' })
    doc.text('Firma de jefatura / RR.HH.', pageWidth - 55, sigY + 5, { align: 'center' })

    drawAllFooters(doc, drawFooter)
    doc.save(`${sanitizeFilename(title)}.pdf`)
  }
}

/**
 * Genera y descarga la boleta de una solicitud de vacaciones en PDF.
 * @param {Object} vacacion     - objeto mapeado (mapVacacionRow)
 * @param {Object} empleadoInfo - { name, codigo, departamento, puesto } (opcional)
 */
export async function exportBoletaVacacion(vacacion, empleadoInfo = {}) {
  if (!vacacion) return
  const title = `Boleta de vacaciones ${vacacion.numeroSolicitud || ''}`.trim()
  const resolucion = vacacion.estado !== 'pendiente'
    ? {
        resueltoPor: vacacion.aprobadoPor,
        fecha: vacacion.fechaAprobacion ? new Date(vacacion.fechaAprobacion).toLocaleString('es-CR') : '—',
        comentarioLabel: vacacion.estado === 'rechazada' ? 'Motivo de rechazo' : 'Comentario',
        comentario: vacacion.estado === 'rechazada' ? vacacion.motivoRechazo : vacacion.comentarioAprobacion,
      }
    : null

  await drawBoleta({
    title,
    rows: [
      ['N° de solicitud', vacacion.numeroSolicitud, 'Estado', vacacion.status],
      ['Colaborador', empleadoInfo.name || vacacion.name, 'Código', empleadoInfo.codigo || '—'],
      ['Departamento', empleadoInfo.departamento || '—', 'Puesto', empleadoInfo.puesto || '—'],
      ['Tipo de vacación', vacacion.tipoVacacion || '—', 'Fecha de solicitud', vacacion.fechaSolicitud],
      ['Fecha de inicio', vacacion.inicio, 'Fecha de fin', vacacion.fin],
      ['Días solicitados', vacacion.dias, 'Días hábiles', vacacion.diasHabiles ?? '—'],
    ],
    observacionesLabel: 'Observaciones',
    observaciones: vacacion.observaciones,
    resolucion,
  })()
}

/**
 * Genera y descarga la boleta de una solicitud de permiso en PDF.
 * @param {Object} permiso      - objeto mapeado (mapPermisoSolicitudRow)
 * @param {Object} empleadoInfo - { name, codigo, departamento, puesto } (opcional)
 */
export async function exportBoletaPermiso(permiso, empleadoInfo = {}) {
  if (!permiso) return
  const title = `Boleta de permiso ${permiso.numeroSolicitud || ''}`.trim()
  const duracion = permiso.horas != null ? `${permiso.horas} h` : (permiso.dias != null ? `${permiso.dias} día(s)` : '—')
  const resolucion = permiso.estado !== 'pendiente'
    ? {
        resueltoPor: permiso.aprobadoPor,
        fecha: permiso.fechaAprobacion ? new Date(permiso.fechaAprobacion).toLocaleString('es-CR') : '—',
        comentarioLabel: permiso.estado === 'rechazado' ? 'Motivo de rechazo' : 'Comentario',
        comentario: permiso.estado === 'rechazado' ? permiso.motivoRechazo : permiso.comentarioAprobacion,
      }
    : null

  await drawBoleta({
    title,
    rows: [
      ['N° de solicitud', permiso.numeroSolicitud, 'Estado', permiso.status],
      ['Colaborador', empleadoInfo.name || permiso.name, 'Código', empleadoInfo.codigo || '—'],
      ['Departamento', empleadoInfo.departamento || '—', 'Puesto', empleadoInfo.puesto || '—'],
      ['Tipo de permiso', permiso.tipoPermiso || '—', 'Fecha de solicitud', permiso.fechaSolicitud],
      ['Fecha de inicio', permiso.inicio, 'Fecha de fin', permiso.fin],
      ['Hora inicio', permiso.horaInicio || '—', 'Hora fin', permiso.horaFin || '—'],
      ['Duración', duracion, 'Motivo', permiso.motivo || '—'],
    ],
    observacionesLabel: 'Observaciones',
    observaciones: permiso.observaciones,
    resolucion,
  })()
}

/**
 * Genera y descarga la boleta de un registro de incapacidad en PDF.
 * @param {Object} incapacidad  - objeto mapeado (mapIncapacidadRow)
 * @param {Object} empleadoInfo - { name, codigo, departamento, puesto } (opcional)
 */
export async function exportBoletaIncapacidad(incapacidad, empleadoInfo = {}) {
  if (!incapacidad) return
  const title = `Boleta de incapacidad ${incapacidad.numeroRegistro || ''}`.trim()
  let resolucion = null
  if (incapacidad.estado === 'finalizada' && incapacidad.reincorporacionRealISO) {
    resolucion = { resueltoPor: 'Reincorporación registrada', fecha: incapacidad.reincorporacionReal, comentarioLabel: '', comentario: null }
  } else if (incapacidad.estado === 'anulada') {
    resolucion = { resueltoPor: 'Anulada', fecha: '—', comentarioLabel: 'Motivo de anulación', comentario: incapacidad.motivoAnulacion }
  }

  await drawBoleta({
    title,
    rows: [
      ['N° de registro', incapacidad.numeroRegistro, 'N° de referencia', incapacidad.numeroReferencia || '—'],
      ['Colaborador', empleadoInfo.name || incapacidad.name, 'Código', empleadoInfo.codigo || '—'],
      ['Departamento', empleadoInfo.departamento || '—', 'Puesto', empleadoInfo.puesto || '—'],
      ['Tipo de incapacidad', incapacidad.tipoIncapacidad || '—', 'Institución emisora', incapacidad.institucionEmisora || '—'],
      ['Fecha de emisión', incapacidad.fechaEmision, 'Estado', incapacidad.status],
      ['Fecha de inicio', incapacidad.inicio, 'Fecha de fin', incapacidad.fin],
      ['Cantidad de días', incapacidad.dias, 'Reincorporación prevista', incapacidad.reincorporacionPrevista],
    ],
    observacionesLabel: 'Observaciones',
    observaciones: incapacidad.observaciones,
    resolucion,
  })()
}

/**
 * Exporta el expediente completo de un colaborador a PDF: informacion
 * personal y laboral en formato de ficha, mas una tabla por cada seccion
 * del formulario que tenga registros (contactos, contratos, formacion
 * academica, colegiaturas, certificaciones, cursos, datos bancarios).
 * Usa el mismo encabezado/pie de pagina institucional que el resto de
 * exportaciones.
 * @param {Object} empleado - objeto mapeado del colaborador (mapEmpleadoRow)
 * @param {Object} data     - { contactos, contratos, formacionAcademica, colegiaturas, certificaciones, cursos, bancarios }
 */
export async function exportExpedientePDF(empleado, data = {}) {
  if (!empleado) return

  const { cooperativaNombre } = useAuth()
  const logo = await getLogoInfo()
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const fecha = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })
  const title = `Expediente — ${empleado.name}`
  const { drawHeader, drawFooter } = makeHeaderFooter(doc, { title, cooperativaNombre: cooperativaNombre.value, logo, pageWidth, pageHeight, fecha })

  const MARGIN_TOP = 38
  const MARGIN_BOTTOM = 22
  let y = MARGIN_TOP
  drawHeader()

  function ensureSpace(needed) {
    if (y + needed > pageHeight - MARGIN_BOTTOM) {
      doc.addPage()
      drawHeader()
      y = MARGIN_TOP
    }
  }

  function drawSectionTitle(text) {
    ensureSpace(12)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(19, 60, 101)
    doc.text(text, 14, y)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0)
    y += 7
    doc.setDrawColor(230)
    doc.line(14, y - 3, pageWidth - 14, y - 3)
  }

  function drawFieldGrid(fields) {
    const colWidth = (pageWidth - 28) / 2
    for (let i = 0; i < fields.length; i += 2) {
      ensureSpace(13)
      fields.slice(i, i + 2).forEach((f, idx) => {
        const x = 14 + idx * colWidth
        doc.setFontSize(7.5)
        doc.setTextColor(120)
        doc.text(f.label, x, y)
        doc.setFontSize(9.5)
        doc.setTextColor(20)
        doc.text(String(f.value ?? '—') || '—', x, y + 5)
      })
      y += 13
    }
    y += 4
  }

  function drawTableSection(title2, columns, rows) {
    if (!rows?.length) return
    drawSectionTitle(title2)
    autoTable(doc, {
      head: [columns.map((c) => c.label)],
      body: rows.map((r) => columns.map((c) => (r[c.key] ?? '—').toString())),
      startY: y,
      margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM },
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [19, 60, 101] },
      didDrawPage: drawHeader,
    })
    y = doc.lastAutoTable.finalY + 10
  }

  drawSectionTitle('Información personal')
  drawFieldGrid([
    { label: 'Nombre completo', value: [empleado.name, empleado.primerApellido, empleado.segundoApellido].filter(Boolean).join(' ') },
    { label: 'Identificación', value: empleado.identificacion },
    { label: 'Fecha de nacimiento', value: empleado.fechaNacimiento },
    { label: 'Nacionalidad', value: empleado.nacionalidad },
    { label: 'Sexo', value: empleado.genero },
    { label: 'Estado civil', value: empleado.estadoCivil },
    { label: 'Teléfono', value: empleado.telefono },
    { label: 'Correo personal', value: empleado.correoPersonal },
    { label: 'Correo institucional', value: empleado.correoInstitucional },
    { label: 'Dirección', value: [empleado.provincia, empleado.canton, empleado.distrito, empleado.direccionExacta].filter(Boolean).join(', ') },
  ])

  drawSectionTitle('Información laboral')
  drawFieldGrid([
    { label: 'Código interno', value: empleado.codigoInterno },
    { label: 'Fecha de ingreso', value: empleado.date },
    { label: 'Departamento', value: empleado.dept },
    { label: 'Puesto', value: empleado.role },
    { label: 'Tipo de contratación', value: empleado.tipoContrato },
    { label: 'Estado', value: empleado.active ? 'Activo' : 'Inactivo' },
    { label: 'Salario base', value: empleado.salario ? `${empleado.moneda || 'CRC'} ${Number(empleado.salario).toLocaleString('es-CR')}` : '' },
    { label: 'Forma de pago', value: empleado.formaPago },
  ])

  drawTableSection('Contactos de emergencia',
    [{ key: 'nombre_completo', label: 'Nombre' }, { key: 'parentesco', label: 'Parentesco' }, { key: 'telefono_principal', label: 'Teléfono' }],
    data.contactos)

  drawTableSection('Contratos',
    [{ key: 'numero_contrato', label: 'N° contrato' }, { key: 'fecha_inicio', label: 'Inicio' }, { key: 'fecha_fin', label: 'Fin' }, { key: 'estado_contrato', label: 'Estado' }],
    data.contratos)

  drawTableSection('Formación académica',
    [{ key: 'nivel_academico', label: 'Nivel' }, { key: 'profesion', label: 'Profesión' }, { key: 'titulo_obtenido', label: 'Título' }, { key: 'fecha_graduacion', label: 'Graduación' }],
    data.formacionAcademica)

  drawTableSection('Colegiatura profesional',
    [{ key: 'numero_colegiado', label: 'N° colegiado' }, { key: 'estado', label: 'Estado' }, { key: 'fecha_vencimiento', label: 'Vence' }],
    data.colegiaturas)

  drawTableSection('Certificaciones',
    [{ key: 'nombre', label: 'Nombre' }, { key: 'institucion_certificadora', label: 'Institución' }, { key: 'estado', label: 'Estado' }, { key: 'fecha_vencimiento', label: 'Vence' }],
    data.certificaciones)

  drawTableSection('Cursos y capacitaciones externas',
    [{ key: 'nombre_curso', label: 'Curso' }, { key: 'institucion', label: 'Institución' }, { key: 'modalidad', label: 'Modalidad' }],
    data.cursos)

  if (data.bancarios) {
    drawSectionTitle('Información bancaria')
    drawFieldGrid([
      { label: 'Banco', value: data.bancarios.banco },
      { label: 'Tipo de cuenta', value: data.bancarios.tipo_cuenta },
      { label: 'Número de cuenta', value: data.bancarios.numero_cuenta },
      { label: 'IBAN', value: data.bancarios.iban },
    ])
  }

  drawAllFooters(doc, drawFooter)
  doc.save(`${sanitizeFilename(title)}.pdf`)
}
