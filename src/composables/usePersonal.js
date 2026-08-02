import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { initialsOf, colorFor } from './useAsociados.js'

export const ESTADO_LABEL = { activo: true, inactivo: false, licencia: false, retirado: false }
export const GENERO_LABEL = { masculino: 'Masculino', femenino: 'Femenino', no_binario: 'No binario', otro: 'Otro' }
export const GENERO_ENUM = { Masculino: 'masculino', Femenino: 'femenino', Otro: 'otro' }

const PERMISO_TIPO_LABEL = {
  con_goce_salarial: 'Con goce salarial', sin_goce_salarial: 'Sin goce salarial',
  cita_medica: 'Cita médica', maternidad: 'Maternidad', paternidad: 'Paternidad',
  fallecimiento_familiar: 'Fallecimiento familiar', estudio: 'Estudio', otro: 'Otro', vacaciones: 'Vacaciones',
}
const PERMISO_TIPO_ENUM = Object.fromEntries(Object.entries(PERMISO_TIPO_LABEL).map(([k, v]) => [v, k]))

const ESTADO_SOLICITUD_LABEL = { pendiente: { label: 'Pendiente', class: 'yellow' }, aprobado: { label: 'Aprobado', class: 'green' }, rechazado: { label: 'Rechazado', class: 'red' } }

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

function mapEmpleadoRow(row) {
  return {
    id: row.id,
    name: row.nombre,
    initials: initialsOf(row.nombre),
    color: colorFor(row.id),
    role: row.cargos?.nombre || '—',
    dept: row.departamentos?.nombre || '—',
    date: formatFecha(row.fecha_ingreso),
    active: row.estado === 'activo',
    estado: row.estado,
    cargoId: row.cargo_id,
    departamentoId: row.departamento_id,
    identificacion: row.cedula,
    fechaNacimiento: row.fecha_nacimiento,
    genero: GENERO_LABEL[row.genero] ?? '',
    telefono: row.telefono,
    correo: row.email,
    direccion: row.direccion,
    tipoContrato: row.tipo_contrato,
    salario: row.salario,
  }
}

function mapPermisoRow(row) {
  const estadoInfo = ESTADO_SOLICITUD_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  return {
    id: row.id,
    empleadoId: row.empleado_id,
    name: row.empleados?.nombre || '—',
    initials: initialsOf(row.empleados?.nombre),
    color: colorFor(row.empleado_id),
    tipo: PERMISO_TIPO_LABEL[row.tipo] ?? row.tipo,
    fecha: formatFecha(row.fecha),
    horas: Number(row.horas),
    motivo: row.motivo,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
  }
}

export function usePersonal() {
  async function listDepartamentos() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('departamentos').select('id, nombre').order('nombre')
  }

  async function listCargos() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('cargos').select('id, nombre, departamento_id, salario_base').order('nombre')
  }

  // Los catalogos de departamentos/cargos pueden estar vacios en una coopertiva
  // nueva; en vez de bloquear el alta de un colaborador, se resuelven u
  // originan sobre la marcha a partir del nombre escrito/seleccionado.
  async function findOrCreateDepartamento(cooperativaId, nombre) {
    if (!nombre?.trim()) return { data: null, error: null }
    const { data: existente } = await supabase.from('departamentos').select('id').eq('cooperativa_id', cooperativaId).eq('nombre', nombre).maybeSingle()
    if (existente) return { data: existente, error: null }
    return supabase.from('departamentos').insert({ cooperativa_id: cooperativaId, nombre }).select('id').single()
  }

  async function findOrCreateCargo(cooperativaId, nombre, departamentoId) {
    if (!nombre?.trim()) return { data: null, error: null }
    const { data: existente } = await supabase.from('cargos').select('id').eq('cooperativa_id', cooperativaId).eq('nombre', nombre).maybeSingle()
    if (existente) return { data: existente, error: null }
    return supabase.from('cargos').insert({ cooperativa_id: cooperativaId, nombre, departamento_id: departamentoId || null }).select('id').single()
  }

  async function listEmpleados() {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    const { data, error } = await supabase
      .from('empleados')
      .select('*, cargos(nombre), departamentos(nombre)')
      .order('nombre')
    if (error) return { data: null, error }
    return { data: data.map(mapEmpleadoRow), error: null }
  }

  async function createEmpleado(cooperativaId, payload) {
    return supabase
      .from('empleados')
      .insert({
        cooperativa_id: cooperativaId,
        nombre: payload.nombre,
        cedula: payload.identificacion,
        email: payload.correo,
        telefono: payload.telefono,
        cargo_id: payload.cargoId || null,
        departamento_id: payload.departamentoId || null,
        fecha_nacimiento: payload.fechaNacimiento || null,
        genero: GENERO_ENUM[payload.genero] ?? null,
        direccion: payload.direccion,
        tipo_contrato: payload.tipoContrato,
        fecha_ingreso: payload.fechaIngreso || new Date().toISOString().slice(0, 10),
        salario: Number(payload.salario) || 0,
        estado: payload.activo ? 'activo' : 'inactivo',
      })
      .select()
      .single()
  }

  async function updateEmpleado(id, payload) {
    return supabase
      .from('empleados')
      .update({
        nombre: payload.nombre,
        cedula: payload.identificacion,
        email: payload.correo,
        telefono: payload.telefono,
        cargo_id: payload.cargoId || null,
        departamento_id: payload.departamentoId || null,
        fecha_nacimiento: payload.fechaNacimiento || null,
        genero: GENERO_ENUM[payload.genero] ?? null,
        direccion: payload.direccion,
        tipo_contrato: payload.tipoContrato,
        fecha_ingreso: payload.fechaIngreso || null,
        salario: Number(payload.salario) || 0,
        estado: payload.activo ? 'activo' : 'inactivo',
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function listPermisos({ vacaciones = false } = {}) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    let req = supabase.from('permisos_empleado').select('*, empleados(nombre)').order('fecha', { ascending: false })
    req = vacaciones ? req.eq('tipo', 'vacaciones') : req.neq('tipo', 'vacaciones')
    const { data, error } = await req
    if (error) return { data: null, error }
    return { data: data.map(mapPermisoRow), error: null }
  }

  async function crearPermiso(cooperativaId, payload) {
    return supabase
      .from('permisos_empleado')
      .insert({
        cooperativa_id: cooperativaId,
        empleado_id: payload.empleadoId,
        tipo: PERMISO_TIPO_ENUM[payload.tipo] ?? 'otro',
        fecha: payload.fecha,
        horas: Number(payload.horas) || 8,
        motivo: payload.motivo,
      })
      .select('*, empleados(nombre)')
      .single()
  }

  async function resolverPermiso(id, aprobado) {
    return supabase.from('permisos_empleado').update({ estado: aprobado ? 'aprobado' : 'rechazado' }).eq('id', id).select().single()
  }

  async function listCapacitaciones() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('capacitaciones')
      .select('*, capacitacion_empleados(empleado_id, asistio)')
      .order('fecha_inicio', { ascending: false })
    if (error) return { data: null, error }
    return {
      data: data.map((c) => ({
        id: c.id, nombre: c.titulo, depto: c.categoria || 'Todos', categoria: c.categoria || '',
        modalidad: c.modalidad || '', modalidadClass: (c.modalidad || '').toLowerCase(),
        fecha: formatFecha(c.fecha_inicio),
        horas: Number(c.duracion_horas || 0), instructor: c.instructor || '—',
        asistentes: (c.capacitacion_empleados || []).filter((p) => p.asistio).length,
        status: c.estado === 'programada' ? 'Programada' : c.estado === 'finalizada' ? 'Finalizada' : c.estado,
        statusClass: c.estado === 'programada' ? 'blue' : c.estado === 'finalizada' ? 'green' : 'gray',
      })),
      error: null,
    }
  }

  async function crearCapacitacion(cooperativaId, payload) {
    return supabase
      .from('capacitaciones')
      .insert({
        cooperativa_id: cooperativaId,
        titulo: payload.nombre,
        categoria: payload.categoria,
        modalidad: payload.modalidad,
        instructor: payload.instructor,
        fecha_inicio: payload.fecha,
        duracion_horas: Number(payload.horas) || null,
        estado: (payload.estado || 'programada').toLowerCase(),
      })
      .select()
      .single()
  }

  return {
    listDepartamentos, listCargos, listEmpleados, createEmpleado, updateEmpleado,
    findOrCreateDepartamento, findOrCreateCargo,
    listPermisos, crearPermiso, resolverPermiso, listCapacitaciones, crearCapacitacion,
  }
}
