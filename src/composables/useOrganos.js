import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { initialsOf, colorFor } from './useAsociados.js'

const loading = ref(false)
const error = ref(null)

const BUCKET = 'documentos-personal'

export const SESION_ESTADO_LABEL = {
  programada: { label: 'Programada', class: 'yellow' },
  realizada: { label: 'Realizada', class: 'green' },
  cancelada: { label: 'Cancelada', class: 'red' },
}

export const ACUERDO_ESTADO_LABEL = {
  pendiente: { label: 'Pendiente', class: 'yellow' },
  en_proceso: { label: 'En proceso', class: 'blue' },
  completado: { label: 'Completado', class: 'green' },
}

const ACUERDO_PROGRESO = { pendiente: 0, en_proceso: 50, completado: 100 }

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

function mapMiembroRow(m) {
  const asociado = m.asociados
  return {
    id: m.id,
    role: m.cargo,
    desde: formatFecha(m.fecha_inicio),
    asociado: asociado
      ? { id: asociado.id, name: asociado.nombre, cedula: asociado.cedula, initials: initialsOf(asociado.nombre), color: colorFor(asociado.id) }
      : null,
  }
}

function mapOrganoRow(row) {
  const miembros = (row.organo_miembros ?? []).filter((m) => m.es_activo)
  return {
    id: row.id,
    name: row.nombre,
    period: row.periodo || '',
    descripcion: row.descripcion || '',
    esActivo: row.es_activo,
    members: miembros.map(mapMiembroRow),
  }
}

function mapSesionRow(row) {
  const estadoInfo = SESION_ESTADO_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  return {
    id: row.id,
    organoId: row.organo_id,
    tema: row.tema,
    tipo: row.tipo,
    fecha: formatFecha(row.fecha),
    fechaISO: row.fecha,
    hora: row.hora || '',
    lugar: row.lugar || '',
    estado: estadoInfo.label,
    estadoRaw: row.estado,
    estadoClass: estadoInfo.class,
    actaPath: row.acta_url,
    hasActa: !!row.acta_url,
    acuerdosCount: (row.sesion_acuerdos ?? []).length,
  }
}

function mapAcuerdoRow(row) {
  const hoy = new Date().toISOString().slice(0, 10)
  const vencido = row.estado !== 'completado' && !!row.fecha_limite && row.fecha_limite < hoy
  const estadoInfo = vencido
    ? { label: 'Vencido', class: 'red' }
    : (ACUERDO_ESTADO_LABEL[row.estado] ?? { label: row.estado, class: 'gray' })
  return {
    id: row.id,
    sesionId: row.sesion_id,
    texto: row.texto,
    responsableId: row.responsable_id,
    responsableNombre: row.profiles?.full_name || 'Sin asignar',
    fechaLimite: formatFecha(row.fecha_limite),
    fechaLimiteISO: row.fecha_limite,
    estadoRaw: row.estado,
    estado: estadoInfo.label,
    estadoClass: estadoInfo.class,
    vencido,
    progreso: ACUERDO_PROGRESO[row.estado] ?? 0,
    sesionTema: row.organo_sesiones?.tema,
    sesionFecha: formatFecha(row.organo_sesiones?.fecha),
  }
}

const ORGANO_SELECT = '*, organo_miembros(id, cargo, fecha_inicio, fecha_fin, es_activo, asociados(id, nombre, cedula, foto_url))'
const ACUERDO_SELECT = '*, profiles(id, full_name), organo_sesiones(id, tema, fecha, organo_id)'

function ordenarPorFechaLimite(rows) {
  return rows.slice().sort((a, b) => {
    if (!a.fecha_limite && !b.fecha_limite) return 0
    if (!a.fecha_limite) return 1
    if (!b.fecha_limite) return -1
    return a.fecha_limite < b.fecha_limite ? -1 : 1
  })
}

export function useOrganos() {
  // Órganos
  async function listOrganos(cooperativaId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    loading.value = true
    const { data, error: err } = await supabase
      .from('organos')
      .select(ORGANO_SELECT)
      .eq('cooperativa_id', cooperativaId)
      .order('nombre')
    loading.value = false
    if (err) { error.value = err; return { data: null, error: err } }
    return { data: data.map(mapOrganoRow), error: null }
  }

  async function getOrgano(id) {
    const { data, error: err } = await supabase.from('organos').select(ORGANO_SELECT).eq('id', id).single()
    if (err) return { data: null, error: err }
    return { data: mapOrganoRow(data), error: null }
  }

  async function createOrgano(cooperativaId, payload) {
    const { data, error: err } = await supabase
      .from('organos')
      .insert({ cooperativa_id: cooperativaId, nombre: payload.nombre, periodo: payload.periodo || null, descripcion: payload.descripcion || null })
      .select(ORGANO_SELECT)
      .single()
    if (err) return { data: null, error: err }
    return { data: mapOrganoRow(data), error: null }
  }

  async function updateOrgano(id, payload) {
    const { data, error: err } = await supabase
      .from('organos')
      .update({ nombre: payload.nombre, periodo: payload.periodo || null, descripcion: payload.descripcion || null })
      .eq('id', id)
      .select(ORGANO_SELECT)
      .single()
    if (err) return { data: null, error: err }
    return { data: mapOrganoRow(data), error: null }
  }

  // Miembros — diff no destructivo: los puestos quitados se desactivan
  // (es_activo:false, fecha_fin:hoy) en vez de borrarse, para conservar el
  // historial y no violar el NOT NULL de asociado_id con un update a null.
  async function saveMiembros(organoId, slots) {
    const hoy = new Date().toISOString().slice(0, 10)

    for (const slot of slots) {
      if (slot._delete) {
        if (slot.dbId) {
          const { error: err } = await supabase.from('organo_miembros').update({ es_activo: false, fecha_fin: hoy }).eq('id', slot.dbId)
          if (err) return { data: null, error: err }
        }
        continue
      }
      if (!slot.asociado || !slot.role?.trim()) continue

      if (slot.dbId) {
        const { error: err } = await supabase
          .from('organo_miembros')
          .update({ cargo: slot.role.trim(), asociado_id: slot.asociado.id })
          .eq('id', slot.dbId)
        if (err) return { data: null, error: err }
      } else {
        const { error: err } = await supabase
          .from('organo_miembros')
          .insert({ organo_id: organoId, asociado_id: slot.asociado.id, cargo: slot.role.trim(), fecha_inicio: hoy })
        if (err) return { data: null, error: err }
      }
    }
    return { data: true, error: null }
  }

  // Sesiones / actas
  async function listSesiones(organoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error: err } = await supabase
      .from('organo_sesiones')
      .select('*, sesion_acuerdos(id)')
      .eq('organo_id', organoId)
      .order('fecha', { ascending: false })
    if (err) return { data: null, error: err }
    return { data: data.map(mapSesionRow), error: null }
  }

  async function createSesion(organoId, payload) {
    const { data, error: err } = await supabase
      .from('organo_sesiones')
      .insert({
        organo_id: organoId, tema: payload.tema, tipo: payload.tipo || 'ordinaria',
        fecha: payload.fecha, hora: payload.hora || null, lugar: payload.lugar || null,
        estado: payload.estado || 'programada',
      })
      .select('*, sesion_acuerdos(id)')
      .single()
    if (err) return { data: null, error: err }
    return { data: mapSesionRow(data), error: null }
  }

  async function updateSesion(id, payload) {
    const { data, error: err } = await supabase
      .from('organo_sesiones')
      .update({ tema: payload.tema, tipo: payload.tipo, fecha: payload.fecha, hora: payload.hora || null, lugar: payload.lugar || null, estado: payload.estado })
      .eq('id', id)
      .select('*, sesion_acuerdos(id)')
      .single()
    if (err) return { data: null, error: err }
    return { data: mapSesionRow(data), error: null }
  }

  async function deleteSesion(id, actaPath) {
    if (actaPath) await supabase.storage.from(BUCKET).remove([actaPath])
    return supabase.from('organo_sesiones').delete().eq('id', id)
  }

  // Acta (archivo adjunto de la sesion)
  async function subirActa(cooperativaId, organoId, sesionId, file) {
    const path = `${cooperativaId}/organos/${organoId}/sesiones/${sesionId}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
    if (upErr) return { data: null, error: upErr }

    const { data, error: err } = await supabase
      .from('organo_sesiones')
      .update({ acta_url: path })
      .eq('id', sesionId)
      .select('*, sesion_acuerdos(id)')
      .single()

    if (err) { await supabase.storage.from(BUCKET).remove([path]); return { data: null, error: err } }
    return { data: mapSesionRow(data), error: null }
  }

  async function reemplazarActa(cooperativaId, organoId, sesionId, file, pathAnterior) {
    const { data, error: err } = await subirActa(cooperativaId, organoId, sesionId, file)
    if (!err && pathAnterior) await supabase.storage.from(BUCKET).remove([pathAnterior])
    return { data, error: err }
  }

  async function eliminarActa(sesionId, path) {
    if (path) await supabase.storage.from(BUCKET).remove([path])
    const { data, error: err } = await supabase
      .from('organo_sesiones')
      .update({ acta_url: null })
      .eq('id', sesionId)
      .select('*, sesion_acuerdos(id)')
      .single()
    if (err) return { data: null, error: err }
    return { data: mapSesionRow(data), error: null }
  }

  async function getUrlActa(path) {
    const { data, error: err } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
    return { url: data?.signedUrl || null, error: err }
  }

  // Limpieza de archivos huerfanos en Storage al borrar un organo completo
  // (el cascade de la base borra las filas, pero no los objetos de Storage).
  async function eliminarArchivosDelOrgano(organoId) {
    const { data } = await supabase.from('organo_sesiones').select('acta_url').eq('organo_id', organoId)
    const paths = (data || []).map((s) => s.acta_url).filter(Boolean)
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
  }

  // Acuerdos
  async function listAcuerdosByOrgano(organoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    // Se consulta desde organo_sesiones (no desde sesion_acuerdos filtrando por
    // la tabla embebida) para reutilizar el mismo patron de embeds anidados que
    // ya usa el resto del codebase, en vez de un filtro sobre una relacion embebida.
    const { data, error: err } = await supabase
      .from('organo_sesiones')
      .select('id, tema, fecha, sesion_acuerdos(*, profiles(id, full_name))')
      .eq('organo_id', organoId)
    if (err) return { data: null, error: err }
    const rows = data.flatMap((sesion) =>
      (sesion.sesion_acuerdos || []).map((a) => ({ ...a, organo_sesiones: { id: sesion.id, tema: sesion.tema, fecha: sesion.fecha } }))
    )
    return { data: ordenarPorFechaLimite(rows).map(mapAcuerdoRow), error: null }
  }

  async function createAcuerdo(sesionId, payload) {
    const { data, error: err } = await supabase
      .from('sesion_acuerdos')
      .insert({
        sesion_id: sesionId, texto: payload.texto,
        responsable_id: payload.responsableId || null,
        fecha_limite: payload.fechaLimite || null,
        estado: payload.estado || 'pendiente',
      })
      .select(ACUERDO_SELECT)
      .single()
    if (err) return { data: null, error: err }
    return { data: mapAcuerdoRow(data), error: null }
  }

  async function updateAcuerdo(id, payload) {
    const { data, error: err } = await supabase
      .from('sesion_acuerdos')
      .update({
        texto: payload.texto, responsable_id: payload.responsableId || null,
        fecha_limite: payload.fechaLimite || null, estado: payload.estado,
      })
      .eq('id', id)
      .select(ACUERDO_SELECT)
      .single()
    if (err) return { data: null, error: err }
    return { data: mapAcuerdoRow(data), error: null }
  }

  async function deleteAcuerdo(id) {
    return supabase.from('sesion_acuerdos').delete().eq('id', id)
  }

  // Responsables disponibles (usuarios del sistema de esta cooperativa)
  async function listResponsablesDisponibles(cooperativaId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error: err } = await supabase
      .from('cooperativa_members')
      .select('profile_id, role, profiles(id, full_name)')
      .eq('cooperativa_id', cooperativaId)
      .eq('is_active', true)
    if (err) return { data: [], error: err }
    return {
      data: (data || []).filter((m) => m.profiles).map((m) => ({ id: m.profiles.id, name: m.profiles.full_name, role: m.role })),
      error: null,
    }
  }

  return {
    loading,
    error,
    listOrganos,
    getOrgano,
    createOrgano,
    updateOrgano,
    saveMiembros,
    listSesiones,
    createSesion,
    updateSesion,
    deleteSesion,
    subirActa,
    reemplazarActa,
    eliminarActa,
    getUrlActa,
    eliminarArchivosDelOrgano,
    listAcuerdosByOrgano,
    createAcuerdo,
    updateAcuerdo,
    deleteAcuerdo,
    listResponsablesDisponibles,
  }
}
