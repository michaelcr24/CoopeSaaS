import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { initialsOf, colorFor } from './useAsociados.js'

// Convención de estado de `votaciones` (el enum voto_estado solo tiene
// abierta/cerrada/anulada, sin un valor "en cola"):
//   'cerrada' + fecha_fin IS NULL      -> en cola, aun no inicia ("waiting")
//   'abierta'                          -> activa, recibiendo votos
//   'cerrada' + fecha_fin IS NOT NULL  -> finalizada
function estadoToState(v) {
  if (v.estado === 'abierta') return 'active'
  if (v.estado === 'cerrada' && v.fecha_fin) return 'finished'
  return 'waiting'
}

const SPECIAL_OPCIONES = {
  'A Favor': { color: '#1A9152', icon: '✓' },
  'En Contra': { color: '#C0392B', icon: '✗' },
}

function mapOpcion(o) {
  if (o.es_abstencion) return { id: o.id, name: 'Abstención', color: '#7A90A0', icon: '—', votos: o.votos }
  const special = SPECIAL_OPCIONES[o.texto]
  if (special) return { id: o.id, name: o.texto, color: special.color, icon: special.icon, votos: o.votos }
  const initials = o.asociados ? initialsOf(o.asociados.nombre) : initialsOf(o.texto)
  return {
    id: o.id,
    name: o.texto,
    photo: o.asociados?.foto_url || null,
    // Fallback cuando no hay foto: el template pinta cand.icon dentro de un
    // circulo de color, igual que hace con los avatares de iniciales del resto de la app.
    icon: initials,
    initials,
    color: colorFor(o.asociado_id || o.id),
    votos: o.votos,
    asociadoId: o.asociado_id,
  }
}

function mapVotacion(v) {
  return {
    id: v.id,
    title: v.titulo,
    type: v.tipo,
    state: estadoToState(v),
    winnersCount: v.asamblea_puestos?.cantidad ?? 1,
    candidates: (v.votacion_opciones ?? [])
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map(mapOpcion),
  }
}

function tituloPuesto(puesto) {
  const esPlural = puesto.cantidad > 1
  const rol = puesto.tipo === 'SUPLENTE' ? (esPlural ? 'Suplentes' : 'Suplente') : (esPlural ? 'Propietarios' : 'Propietario')
  return `${puesto.cantidad} ${rol} ${puesto.organo_nombre}`
}

export function useVotaciones() {
  async function loadAsamblea(asambleaId) {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    const { data, error } = await supabase
      .from('asambleas')
      .select('id, nombre, fecha, lugar, descripcion, hora_inicio_real, hora_cierre_real, numero_acta, acuerdos, asamblea_invitados(id)')
      .eq('id', asambleaId)
      .single()
    if (error) return { data: null, error }
    return {
      data: {
        name: data.nombre,
        fecha: data.fecha,
        lugar: data.lugar,
        totalSocios: data.asamblea_invitados?.length ?? 0,
        horaInicioReal: data.hora_inicio_real,
        horaCierreReal: data.hora_cierre_real,
        numeroActa: data.numero_acta,
        acuerdos: data.acuerdos,
      },
      error: null,
    }
  }

  async function loadAsistencia(asambleaId) {
    const { data, error } = await supabase
      .from('asamblea_invitados')
      .select('id, asistio, asociados(id, nombre, num_asociado)')
      .eq('asamblea_id', asambleaId)
      .order('nombre', { foreignTable: 'asociados' })
    if (error) return { data: null, error }
    return {
      data: data.map((i) => ({
        id: i.id,
        asociadoId: i.asociados?.id ?? null,
        name: i.asociados?.nombre ?? '—',
        initials: initialsOf(i.asociados?.nombre),
        color: colorFor(i.asociados?.id),
        num: i.asociados?.num_asociado ?? '—',
        present: i.asistio,
      })),
      error: null,
    }
  }

  async function toggleAsistencia(invitadoId, present) {
    return supabase.from('asamblea_invitados').update({ asistio: present }).eq('id', invitadoId)
  }

  async function markAllAsistencia(asambleaId, present) {
    return supabase.from('asamblea_invitados').update({ asistio: present }).eq('asamblea_id', asambleaId)
  }

  // Crea las votaciones/opciones que aun no existan a partir de los puestos
  // con terna definida (paso 6) y del referendum de agenda de la asamblea.
  // Idempotente: no duplica lo que ya fue creado.
  async function ensureVotaciones(asambleaId) {
    const { data: existentes, error: exErr } = await supabase
      .from('votaciones')
      .select('id, puesto_id, tipo')
      .eq('asamblea_id', asambleaId)
    if (exErr) return { error: exErr }
    const puestoIdsConVotacion = new Set(existentes.filter((v) => v.puesto_id).map((v) => v.puesto_id))
    const tieneAgenda = existentes.some((v) => v.tipo === 'referendum')

    if (!tieneAgenda) {
      const { data: votAgenda, error: aErr } = await supabase
        .from('votaciones')
        .insert({ asamblea_id: asambleaId, titulo: '¿Se somete a votación la agenda?', tipo: 'referendum', estado: 'cerrada' })
        .select()
        .single()
      if (aErr) return { error: aErr }
      const { error: oErr } = await supabase.from('votacion_opciones').insert([
        { votacion_id: votAgenda.id, texto: 'A Favor', orden: 0, es_abstencion: false },
        { votacion_id: votAgenda.id, texto: 'En Contra', orden: 1, es_abstencion: false },
        { votacion_id: votAgenda.id, texto: 'Abstención', orden: 2, es_abstencion: true },
      ])
      if (oErr) return { error: oErr }
    }

    const { data: puestos, error: pErr } = await supabase
      .from('asamblea_puestos')
      .select('*, asamblea_postulaciones(id, asociado_id, en_terna, asociados(id, nombre, foto_url))')
      .eq('asamblea_id', asambleaId)
      .order('orden')
    if (pErr) return { error: pErr }

    for (const puesto of puestos) {
      if (puestoIdsConVotacion.has(puesto.id)) continue
      const ternaCandidatos = (puesto.asamblea_postulaciones ?? []).filter((p) => p.en_terna)
      const { data: votPuesto, error: vErr } = await supabase
        .from('votaciones')
        .insert({ asamblea_id: asambleaId, puesto_id: puesto.id, titulo: tituloPuesto(puesto), tipo: 'eleccion', estado: 'cerrada' })
        .select()
        .single()
      if (vErr) return { error: vErr }
      const rows = ternaCandidatos.map((c, i) => ({
        votacion_id: votPuesto.id,
        texto: c.asociados?.nombre ?? 'Candidato',
        asociado_id: c.asociado_id,
        orden: i,
        es_abstencion: false,
      }))
      rows.push({ votacion_id: votPuesto.id, texto: 'Abstención', orden: rows.length, es_abstencion: true })
      const { error: ocErr } = await supabase.from('votacion_opciones').insert(rows)
      if (ocErr) return { error: ocErr }
    }

    return { error: null }
  }

  async function loadElecciones(asambleaId) {
    const { data, error } = await supabase
      .from('votaciones')
      .select('*, asamblea_puestos(cantidad), votacion_opciones(*, asociados(id, nombre, foto_url))')
      .eq('asamblea_id', asambleaId)
      .order('created_at')
    if (error) return { data: null, error }
    return { data: data.map(mapVotacion), error: null }
  }

  async function startElection(votacionId) {
    return supabase.from('votaciones').update({ estado: 'abierta', fecha_inicio: new Date().toISOString() }).eq('id', votacionId).select().single()
  }

  async function finalizarVotacion(votacionId) {
    return supabase.from('votaciones').update({ estado: 'cerrada', fecha_fin: new Date().toISOString() }).eq('id', votacionId).select().single()
  }

  async function addOpcion(votacionId, texto, orden) {
    // Inserta antes de la opción "Abstención" para que quede siempre al final
    return supabase.from('votacion_opciones').insert({ votacion_id: votacionId, texto, orden }).select().single()
  }

  async function submitVote(votacionId, opcionId, asociadoId) {
    const { error } = await supabase.from('votacion_votos').insert({ votacion_id: votacionId, opcion_id: opcionId, asociado_id: asociadoId })
    if (error?.code === '23505') return { error: { message: 'Ya registraste tu voto en esta votación.' } }
    return { error }
  }

  function subscribeResultados(votacionId, onChange) {
    const channel = supabase
      .channel(`votacion-${votacionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votacion_opciones', filter: `votacion_id=eq.${votacionId}` }, onChange)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  return {
    loadAsamblea,
    loadAsistencia,
    toggleAsistencia,
    markAllAsistencia,
    ensureVotaciones,
    loadElecciones,
    startElection,
    finalizarVotacion,
    addOpcion,
    submitVote,
    subscribeResultados,
  }
}
