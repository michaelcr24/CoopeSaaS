import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const BUCKET = 'documentos-personal'

// Árbol fijo de Categoría → Subcategorías del repositorio institucional
// (distinto del expediente personal, que vive dentro de cada colaborador).
export const ESTRUCTURA_DOCUMENTAL = {
  'Recursos Humanos': ['Políticas', 'Reglamentos', 'Procedimientos', 'Plantillas'],
  'Administrativa': ['Manuales', 'Políticas', 'Procedimientos', 'Comunicados'],
  'Institucional': ['Reglamentos', 'Acuerdos', 'Documentos oficiales'],
}

function slug(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mapDocumentoRow(row) {
  return {
    id: row.id,
    categoria: row.categoria,
    subcategoria: row.subcategoria,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    storagePath: row.storage_path,
    subidoPor: row.subido_por_perfil?.full_name || '—',
    fecha: row.created_at,
  }
}

export function useDocumentosInstitucionales() {
  async function listDocumentosInstitucionales() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('documentos_institucionales')
      .select('*, subido_por_perfil:profiles!subido_por(full_name)')
      .order('created_at', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map(mapDocumentoRow), error: null }
  }

  async function subirDocumentoInstitucional(cooperativaId, userId, { categoria, subcategoria, nombre, descripcion }, file) {
    const path = `${cooperativaId}/institucional/${slug(categoria)}/${slug(subcategoria)}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
    if (upErr) return { data: null, error: upErr }

    const { data, error } = await supabase
      .from('documentos_institucionales')
      .insert({
        cooperativa_id: cooperativaId,
        categoria, subcategoria,
        nombre: nombre?.trim() || file.name,
        descripcion: descripcion?.trim() || null,
        storage_path: path,
        subido_por: userId,
      })
      .select('*, subido_por_perfil:profiles!subido_por(full_name)')
      .single()

    if (error) { await supabase.storage.from(BUCKET).remove([path]); return { data: null, error } }
    return { data: mapDocumentoRow(data), error: null }
  }

  async function eliminarDocumentoInstitucional(doc) {
    await supabase.storage.from(BUCKET).remove([doc.storagePath])
    return supabase.from('documentos_institucionales').delete().eq('id', doc.id)
  }

  async function getUrlDescargaInstitucional(path) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
    return { url: data?.signedUrl || null, error }
  }

  return { ESTRUCTURA_DOCUMENTAL, listDocumentosInstitucionales, subirDocumentoInstitucional, eliminarDocumentoInstitucional, getUrlDescargaInstitucional }
}
