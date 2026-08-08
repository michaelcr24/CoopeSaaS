import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const loading = ref(false)
const error = ref(null)

export const TIPO_LABEL = { ordinaria: 'Ordinaria', extraordinaria: 'Extraordinaria', especial: 'Especial' }
export const TIPO_ENUM = { Ordinaria: 'ordinaria', Extraordinaria: 'extraordinaria', Especial: 'especial' }
export const MODALIDAD_LABEL = { presencial: 'Presencial', virtual: 'Virtual', hibrida: 'Mixta' }
export const MODALIDAD_ENUM = { Presencial: 'presencial', Virtual: 'virtual', Mixta: 'hibrida' }

const ESTADO_LABEL = {
  programada: { status: 'Programada', statusClass: 'blue' },
  convocatoria: { status: 'Convocatoria', statusClass: 'yellow' },
  en_curso: { status: 'En proceso', statusClass: 'blue' },
  finalizada: { status: 'Celebrada', statusClass: 'green' },
  cancelada: { status: 'Cancelada', statusClass: 'red' },
}

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

// Traduce una fila real de `asambleas` (+ conteo de asistencia) a la misma
// forma que usaba el mock, para no tener que tocar el template.
function mapAsambleaRow(row) {
  const invitados = row.asamblea_invitados ?? []
  const asistentes = invitados.filter((i) => i.asistio).length
  const quorumPct = row.quorum_requerido
    ? Math.round((asistentes / row.quorum_requerido) * 100 * 10) / 10
    : null
  const estadoInfo = ESTADO_LABEL[row.estado] ?? { status: row.estado, statusClass: 'blue' }
  const [y, m, d] = (row.fecha || '').split('-')
  return {
    id: row.id,
    name: row.nombre,
    type: TIPO_LABEL[row.tipo] ?? row.tipo,
    date: formatFecha(row.fecha),
    day: d,
    month: m ? `${MESES[Number(m) - 1]} ${y}` : '',
    hora: row.hora,
    lugar: row.lugar,
    modalidad: MODALIDAD_LABEL[row.modalidad] ?? row.modalidad,
    quorum: quorumPct,
    step: row.paso_wizard,
    status: estadoInfo.status,
    statusClass: estadoInfo.statusClass,
    asistentes,
  }
}

export function useAsambleas() {
  async function listAsambleas() {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    loading.value = true
    const { data, error: err } = await supabase
      .from('asambleas')
      .select('*, asamblea_invitados(asistio)')
      .order('fecha', { ascending: false })
    loading.value = false
    if (err) { error.value = err; return { data: null, error: err } }
    return { data: data.map(mapAsambleaRow), error: null }
  }

  async function getAsamblea(id) {
    return supabase
      .from('asambleas')
      .select(`
        *,
        asamblea_puestos(*),
        asamblea_postulaciones(*, asociados(id, nombre, cedula, foto_url)),
        asamblea_invitados(*, asociados(id, nombre, cedula))
      `)
      .eq('id', id)
      .single()
  }

  async function createDraft(cooperativaId) {
    return supabase
      .from('asambleas')
      .insert({
        cooperativa_id: cooperativaId,
        nombre: 'Nueva asamblea',
        tipo: 'ordinaria',
        modalidad: 'presencial',
        fecha: new Date().toISOString().slice(0, 10),
        estado: 'programada',
        paso_wizard: 1,
      })
      .select('*, asamblea_puestos(*), asamblea_postulaciones(*, asociados(id, nombre, cedula, foto_url)), asamblea_invitados(*, asociados(id, nombre, cedula))')
      .single()
  }

  // Paso 1: Datos generales. `avanzar: false` guarda el borrador (autoguardado
  // mientras se escribe) sin marcar el paso como completado; `avanzar: true`
  // (default, usado por "Siguiente paso") ademas mueve paso_wizard a 2.
  async function saveStep1(id, payload, { avanzar = true } = {}) {
    const update = {
      nombre: payload.nombre,
      tipo: TIPO_ENUM[payload.tipo] ?? payload.tipo,
      modalidad: MODALIDAD_ENUM[payload.modalidad] ?? payload.modalidad,
      fecha: payload.fecha,
      hora: payload.hora || null,
      lugar: payload.lugar,
      quorum_requerido: payload.quorumReq || null,
      dias_convocatoria: payload.diasConvocatoria || null,
      descripcion: payload.agenda,
    }
    if (avanzar) update.paso_wizard = 2
    return supabase.from('asambleas').update(update).eq('id', id).select().single()
  }

  // Paso 2: Puestos vacantes — diff no destructivo: solo borra los puestos que
  // ya no estan seleccionados e inserta los nuevos, sin tocar los existentes
  // (un delete+reinsert ciego arrastraria en cascada las postulaciones ya
  // registradas contra un puesto si el admin retrocede y vuelve a avanzar).
  async function savePuestos(asambleaId, puestos, { avanzar = true } = {}) {
    const { data: existentes, error: exErr } = await supabase
      .from('asamblea_puestos')
      .select('*')
      .eq('asamblea_id', asambleaId)
    if (exErr) return { data: null, error: exErr }

    const seleccionadosIds = new Set(puestos.filter((p) => p.dbId).map((p) => p.dbId))
    const aEliminar = existentes.filter((e) => !seleccionadosIds.has(e.id))
    if (aEliminar.length) {
      const { error: delErr } = await supabase.from('asamblea_puestos').delete().in('id', aEliminar.map((e) => e.id))
      if (delErr) return { data: null, error: delErr }
    }

    const nuevos = puestos.filter((p) => !p.dbId)
    if (nuevos.length) {
      const rows = nuevos.map((p) => ({
        asamblea_id: asambleaId,
        organo_nombre: p.consejoName,
        tipo: p.tipo,
        cantidad: p.cantidad,
        duracion: p.duracion,
        orden: puestos.indexOf(p),
      }))
      const { error: insErr } = await supabase.from('asamblea_puestos').insert(rows)
      if (insErr) return { data: null, error: insErr }
    }

    const { data: puestosCreados, error: selErr } = await supabase
      .from('asamblea_puestos')
      .select('*')
      .eq('asamblea_id', asambleaId)
      .order('orden')
    if (selErr) return { data: null, error: selErr }

    if (avanzar) {
      const { error: stepErr } = await supabase.from('asambleas').update({ paso_wizard: 3 }).eq('id', asambleaId)
      if (stepErr) return { data: null, error: stepErr }
    }

    return { data: puestosCreados, error: null }
  }

  // Paso 3: Convocatoria
  async function saveConvocatoria(id, payload) {
    return supabase
      .from('asambleas')
      .update({
        fecha_convocatoria: payload.fechaConvocatoria || null,
        fecha_limite_postulacion: payload.fechaLimitePostulacion || null,
        mensaje_convocatoria: payload.mensajeConvocatoria,
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function enviarConvocatoria(id) {
    return supabase
      .from('asambleas')
      .update({ convocatoria_enviada_at: new Date().toISOString(), estado: 'convocatoria' })
      .eq('id', id)
      .select()
      .single()
  }

  async function avanzarPaso(asambleaId, paso) {
    return supabase.from('asambleas').update({ paso_wizard: paso }).eq('id', asambleaId).select().single()
  }

  // Paso 4: Postulaciones
  async function addPostulante(puestoId, asociadoId) {
    return supabase
      .from('asamblea_postulaciones')
      .insert({ puesto_id: puestoId, asociado_id: asociadoId, estado: 'pendiente' })
      .select('*, asociados(id, nombre, cedula, foto_url)')
      .single()
  }

  async function removePostulante(postulacionId) {
    return supabase.from('asamblea_postulaciones').delete().eq('id', postulacionId)
  }

  // Paso 5: Aprobación
  async function setEstadoPostulacion(postulacionId, estado) {
    return supabase.from('asamblea_postulaciones').update({ estado }).eq('id', postulacionId).select().single()
  }

  // Paso 6: Ternas
  async function toggleTerna(postulacionId, enTerna) {
    return supabase.from('asamblea_postulaciones').update({ en_terna: enTerna }).eq('id', postulacionId).select().single()
  }

  // Paso 8: Acta
  async function saveActa(asambleaId, payload) {
    return supabase
      .from('asambleas')
      .update({
        hora_inicio_real: payload.horaInicio || null,
        hora_cierre_real: payload.horaCierre || null,
        numero_acta: payload.numActa,
        acuerdos: payload.acuerdos,
        observaciones: payload.observaciones,
      })
      .eq('id', asambleaId)
      .select()
      .single()
  }

  async function finalizarAsamblea(asambleaId) {
    return supabase.from('asambleas').update({ estado: 'finalizada' }).eq('id', asambleaId).select().single()
  }

  // Postulaciones propias de un asociado (rol asociado)
  async function misPostulaciones(asociadoId) {
    return supabase
      .from('asamblea_postulaciones')
      .select('*, asamblea_puestos(tipo, organo_nombre, asambleas(id, nombre))')
      .eq('asociado_id', asociadoId)
  }

  return {
    loading,
    error,
    listAsambleas,
    getAsamblea,
    createDraft,
    saveStep1,
    savePuestos,
    saveConvocatoria,
    enviarConvocatoria,
    avanzarPaso,
    addPostulante,
    removePostulante,
    setEstadoPostulacion,
    toggleTerna,
    saveActa,
    finalizarAsamblea,
    misPostulaciones,
  }
}
