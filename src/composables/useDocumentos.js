import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const BUCKET = 'documentos-personal'

export function estadoVencimiento(fechaVencimiento) {
  if (!fechaVencimiento) return { label: 'No aplica', color: 'gray' }
  const dias = (new Date(fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24)
  if (dias < 0) return { label: 'Vencido', color: 'red' }
  if (dias < 30) return { label: 'Vence en menos de 30 días', color: 'orange' }
  if (dias < 60) return { label: 'Vence en menos de 60 días', color: 'yellow' }
  return { label: 'Vigente', color: 'green' }
}

export function useDocumentos() {
  async function listDocumentos(empleadoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase
      .from('documentos_empleado')
      .select('*, catalogos_personal(nombre)')
      .eq('empleado_id', empleadoId)
      .order('created_at', { ascending: false })
  }

  async function subirDocumento(cooperativaId, empleadoId, file, payload) {
    const path = `${cooperativaId}/${empleadoId}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
    if (upErr) return { data: null, error: upErr }

    const { data: userData } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('documentos_empleado')
      .insert({
        cooperativa_id: cooperativaId,
        empleado_id: empleadoId,
        tipo_documento_id: payload.tipoDocumentoId || null,
        nombre: payload.nombre || file.name,
        fecha_emision: payload.fechaEmision || null,
        fecha_vencimiento: payload.fechaVencimiento || null,
        estado: payload.fechaVencimiento ? estadoVencimiento(payload.fechaVencimiento).label.split(' ')[0] : 'vigente',
        storage_path: path,
        observaciones: payload.observaciones || null,
        subido_por: userData?.user?.id || null,
      })
      .select()
      .single()

    if (error) await supabase.storage.from(BUCKET).remove([path])
    return { data, error }
  }

  async function eliminarDocumento(doc) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path])
    return supabase.from('documentos_empleado').delete().eq('id', doc.id)
  }

  // Al eliminar un colaborador, los registros de documentos_empleado se
  // borran en cascada desde la base de datos, pero los archivos en Storage
  // no — hay que limpiarlos aparte para no dejar huérfanos.
  async function eliminarArchivosDelEmpleado(empleadoId) {
    if (!isSupabaseConfigured()) return
    const { data } = await supabase.from('documentos_empleado').select('storage_path').eq('empleado_id', empleadoId)
    const paths = (data || []).map((d) => d.storage_path).filter(Boolean)
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
  }

  async function getUrlDescarga(path) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
    return { url: data?.signedUrl || null, error }
  }

  // A diferencia de getUrlDescarga (URL firmada para abrir en el navegador),
  // esto trae el archivo como Blob — lo necesita, por ejemplo, el export
  // masivo de certificados para empaquetarlo dentro de un .zip.
  async function descargarArchivo(path) {
    const { data, error } = await supabase.storage.from(BUCKET).download(path)
    return { blob: data || null, error }
  }

  return { listDocumentos, subirDocumento, eliminarDocumento, getUrlDescarga, descargarArchivo, eliminarArchivosDelEmpleado }
}
