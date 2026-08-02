import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const PALETTE = ['#133C65', '#1A9152', '#C47F0C', '#7B3FA0', '#00808C', '#C0392B', '#1565C0']

export function initialsOf(nombre) {
  const parts = (nombre || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0] || '?').slice(0, 2).toUpperCase()
}

export function colorFor(id) {
  const s = String(id || '')
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export const CATEGORIA_LABEL = { activo: 'Activo', honorario: 'Honorario', colaborador: 'Colaborador', especial: 'Especial' }
export const CATEGORIA_ENUM = { Activo: 'activo', Honorario: 'honorario', Colaborador: 'colaborador', Especial: 'especial' }
export const ESTADO_LABEL = { activo: { label: 'Activo', class: 'green' }, inactivo: { label: 'Inactivo', class: 'gray' }, pendiente: { label: 'Pendiente', class: 'yellow' }, suspendido: { label: 'Suspendido', class: 'red' } }
export const ESTADO_ENUM = { Activo: 'activo', Inactivo: 'inactivo', Pendiente: 'pendiente', Suspendido: 'suspendido' }
export const GENERO_LABEL = { masculino: 'Masculino', femenino: 'Femenino', no_binario: 'No binario', otro: 'No especificar' }
export const GENERO_ENUM = { Masculino: 'masculino', Femenino: 'femenino', 'No binario': 'no_binario', 'No especificar': 'otro' }
export const ESTADO_CIVIL_LABEL = { soltero: 'Soltero/a', casado: 'Casado/a', divorciado: 'Divorciado/a', viudo: 'Viudo/a', union_libre: 'Unión libre' }
export const ESTADO_CIVIL_ENUM = { 'Soltero/a': 'soltero', 'Casado/a': 'casado', 'Divorciado/a': 'divorciado', 'Viudo/a': 'viudo', 'Unión libre': 'union_libre' }

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

function mapAsociadoRow(row) {
  const aportes = row.asociado_aportes ?? []
  const capitalSocial = aportes.reduce((s, a) => s + Number(a.monto || 0), 0)
  const ultimoAporte = [...aportes].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0]
  const aporteBadge = ultimoAporte?.estado === 'atrasado' ? 'red' : 'green'
  const estadoInfo = ESTADO_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  return {
    id: row.id,
    name: row.nombre,
    initials: initialsOf(row.nombre),
    color: colorFor(row.id),
    cedula: row.cedula,
    numAsociado: row.num_asociado,
    categoria: CATEGORIA_LABEL[row.categoria] ?? row.categoria,
    capitalSocial,
    aporteMensual: Number(row.aporte_mensual || 0),
    aporteBadge,
    fechaIngreso: formatFecha(row.fecha_ingreso),
    fechaIngresoISO: row.fecha_ingreso,
    status: estadoInfo.class,
    statusLabel: estadoInfo.label,
    fechaNac: formatFecha(row.fecha_nacimiento),
    genero: GENERO_LABEL[row.genero] ?? '',
    estadoCivil: ESTADO_CIVIL_LABEL[row.estado_civil] ?? '',
    nacionalidad: row.nacionalidad,
    telPrincipal: row.telefono_principal,
    telSecundario: row.telefono_secundario,
    email: row.email,
    direccion: row.direccion,
    beneficiarios: (row.asociado_beneficiarios ?? []).map((b) => ({ id: b.id, nombre: b.nombre, relacion: b.parentesco, porcentaje: Number(b.porcentaje) })),
    aportes: aportes
      .slice()
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .map((a) => ({
        fecha: formatFecha(a.fecha), tipo: 'Ordinario', monto: Number(a.monto),
        estado: a.estado === 'al_dia' ? 'Pagado' : a.estado === 'atrasado' ? 'Atrasado' : 'Pendiente',
        estadoClass: a.estado === 'al_dia' ? 'green' : a.estado === 'atrasado' ? 'red' : 'yellow',
      })),
    comunicaciones: (row.asociado_comunicaciones ?? [])
      .slice()
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .map((c) => ({ tipo: c.tipo, asunto: c.asunto, fecha: formatFecha(c.fecha?.slice(0, 10)), leido: c.leido })),
    // Sin modelo de datos propio todavia: se muestran vacios en vez de datos de ejemplo.
    solicitudes: [],
    beneficiosHist: [],
    documentos: [],
    representados: [],
  }
}

export function useAsociados() {
  async function search(query) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const q = (query || '').trim()
    let req = supabase
      .from('asociados')
      .select('id, nombre, cedula, foto_url')
      .eq('estado', 'activo')
      .order('nombre')
      .limit(8)
    if (q) req = req.ilike('nombre', `%${q}%`)
    return req
  }

  async function getByProfileId(profileId) {
    if (!isSupabaseConfigured() || !profileId) return { data: null, error: null }
    return supabase.from('asociados').select('*').eq('profile_id', profileId).maybeSingle()
  }

  async function list() {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    const { data, error } = await supabase
      .from('asociados')
      .select('*, asociado_aportes(*), asociado_beneficiarios(*), asociado_comunicaciones(*)')
      .order('nombre')
    if (error) return { data: null, error }
    return { data: data.map(mapAsociadoRow), error: null }
  }

  async function getById(id) {
    const { data, error } = await supabase
      .from('asociados')
      .select('*, asociado_aportes(*), asociado_beneficiarios(*), asociado_comunicaciones(*)')
      .eq('id', id)
      .single()
    if (error) return { data: null, error }
    return { data: mapAsociadoRow(data), error: null }
  }

  async function create(cooperativaId, payload) {
    return supabase
      .from('asociados')
      .insert({
        cooperativa_id: cooperativaId,
        nombre: payload.nombre,
        cedula: payload.cedula,
        num_asociado: payload.numAsociado,
        fecha_nacimiento: payload.fechaNac || null,
        genero: GENERO_ENUM[payload.genero] ?? null,
        estado_civil: ESTADO_CIVIL_ENUM[payload.estadoCivil] ?? null,
        nacionalidad: payload.nacionalidad || 'Costarricense',
        telefono_principal: payload.telPrincipal,
        telefono_secundario: payload.telSecundario,
        email: payload.email,
        direccion: payload.direccion,
        categoria: CATEGORIA_ENUM[payload.categoria] ?? 'activo',
        fecha_ingreso: payload.fechaIngreso || new Date().toISOString().slice(0, 10),
        aporte_mensual: Number(payload.aporteMensual) || 0,
        estado: ESTADO_ENUM[payload.statusLabel] ?? 'pendiente',
      })
      .select()
      .single()
  }

  async function update(id, payload) {
    return supabase
      .from('asociados')
      .update({
        nombre: payload.nombre,
        cedula: payload.cedula,
        num_asociado: payload.numAsociado,
        fecha_nacimiento: payload.fechaNac || null,
        genero: GENERO_ENUM[payload.genero] ?? null,
        estado_civil: ESTADO_CIVIL_ENUM[payload.estadoCivil] ?? null,
        nacionalidad: payload.nacionalidad,
        telefono_principal: payload.telPrincipal,
        telefono_secundario: payload.telSecundario,
        email: payload.email,
        direccion: payload.direccion,
        categoria: CATEGORIA_ENUM[payload.categoria] ?? 'activo',
        fecha_ingreso: payload.fechaIngreso || null,
        aporte_mensual: Number(payload.aporteMensual) || 0,
        estado: ESTADO_ENUM[payload.statusLabel] ?? 'pendiente',
      })
      .eq('id', id)
      .select()
      .single()
  }

  // Reemplaza el set completo de beneficiarios (la UI edita la lista entera y guarda de una vez)
  async function setBeneficiarios(asociadoId, beneficiarios) {
    const { error: delErr } = await supabase.from('asociado_beneficiarios').delete().eq('asociado_id', asociadoId)
    if (delErr) return { error: delErr }
    const validos = beneficiarios.filter((b) => b.nombre?.trim())
    if (!validos.length) return { error: null }
    const rows = validos.map((b) => ({ asociado_id: asociadoId, nombre: b.nombre, parentesco: b.relacion || 'Otro', porcentaje: Number(b.porcentaje) || 0 }))
    const { error: insErr } = await supabase.from('asociado_beneficiarios').insert(rows)
    return { error: insErr }
  }

  // Participacion: se deriva de datos reales de Asambleas/Votaciones/Comites, no de un mock propio.
  async function getAsambleasAsistidas(asociadoId) {
    const { data: invitaciones, error } = await supabase
      .from('asamblea_invitados')
      .select('asistio, asambleas(id, nombre, tipo, fecha)')
      .eq('asociado_id', asociadoId)
      .eq('asistio', true)
    if (error || !invitaciones?.length) return { data: [], error }
    const { data: votos } = await supabase.from('votacion_votos').select('votacion_id').eq('asociado_id', asociadoId)
    const votacionIds = new Set((votos ?? []).map((v) => v.votacion_id))
    let votoPorAsamblea = new Set()
    if (votacionIds.size) {
      const { data: votaciones } = await supabase.from('votaciones').select('id, asamblea_id').in('id', [...votacionIds])
      votoPorAsamblea = new Set((votaciones ?? []).map((v) => v.asamblea_id))
    }
    return {
      data: invitaciones
        .filter((i) => i.asambleas)
        .map((i) => ({
          nombre: i.asambleas.nombre,
          tipo: i.asambleas.tipo === 'ordinaria' ? 'Ordinaria' : i.asambleas.tipo === 'extraordinaria' ? 'Extraordinaria' : 'Especial',
          fecha: formatFecha(i.asambleas.fecha),
          voto: votoPorAsamblea.has(i.asambleas.id),
        })),
      error: null,
    }
  }

  async function getComitesIntegrados(asociadoId) {
    const { data, error } = await supabase
      .from('comite_miembros')
      .select('rol, fecha_inicio, fecha_fin, es_activo, comites(nombre)')
      .eq('asociado_id', asociadoId)
    if (error) return { data: [], error }
    return {
      data: data.map((m) => ({
        comite: m.comites?.nombre ?? '—',
        rol: m.rol,
        desde: formatFecha(m.fecha_inicio),
        hasta: m.es_activo ? 'Presente' : formatFecha(m.fecha_fin),
      })),
      error: null,
    }
  }

  return {
    search, getByProfileId, list, getById, create, update,
    setBeneficiarios, getAsambleasAsistidas, getComitesIntegrados,
  }
}
