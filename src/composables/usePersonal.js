import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { initialsOf, colorFor } from './useAsociados.js'

const BUCKET_DOCUMENTOS = 'documentos-personal'

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
const ESTADO_VACACION_LABEL = {
  pendiente: { label: 'Pendiente', class: 'yellow' },
  aprobada: { label: 'Aprobada', class: 'green' },
  rechazada: { label: 'Rechazada', class: 'red' },
  cancelada: { label: 'Cancelada', class: 'gray' },
}

function mapVacacionRow(row) {
  const estadoInfo = ESTADO_VACACION_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  const nombreCompleto = [row.empleados?.nombre, row.empleados?.primer_apellido, row.empleados?.segundo_apellido].filter(Boolean).join(' ')
  return {
    id: row.id,
    empleadoId: row.empleado_id,
    name: nombreCompleto || '—',
    initials: initialsOf(nombreCompleto),
    color: colorFor(row.empleado_id),
    numeroSolicitud: row.numero_solicitud,
    tipoVacacion: row.tipo?.nombre || '',
    tipoVacacionId: row.tipo_vacacion_id,
    fechaSolicitud: formatFecha(row.fecha_solicitud),
    inicio: formatFecha(row.fecha_inicio),
    fin: formatFecha(row.fecha_fin),
    fechaInicioISO: row.fecha_inicio,
    fechaFinISO: row.fecha_fin,
    dias: Number(row.dias_solicitados),
    diasHabiles: row.dias_habiles != null ? Number(row.dias_habiles) : null,
    observaciones: row.observaciones,
    estado: row.estado,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
    aprobadoPor: row.aprobador?.full_name || '',
    fechaAprobacion: row.fecha_aprobacion,
    comentarioAprobacion: row.comentario_aprobacion,
    motivoRechazo: row.motivo_rechazo,
    documentoPath: row.documento_path,
    documentoNombre: row.documento_nombre,
  }
}

const ESTADO_PERMISO_LABEL = {
  pendiente: { label: 'Pendiente', class: 'yellow' },
  aprobado: { label: 'Aprobado', class: 'green' },
  rechazado: { label: 'Rechazado', class: 'red' },
  cancelado: { label: 'Cancelado', class: 'gray' },
  finalizado: { label: 'Finalizado', class: 'blue' },
}

function mapPermisoSolicitudRow(row) {
  const estadoInfo = ESTADO_PERMISO_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  const nombreCompleto = [row.empleados?.nombre, row.empleados?.primer_apellido, row.empleados?.segundo_apellido].filter(Boolean).join(' ')
  return {
    id: row.id,
    empleadoId: row.empleado_id,
    name: nombreCompleto || '—',
    initials: initialsOf(nombreCompleto),
    color: colorFor(row.empleado_id),
    numeroSolicitud: row.numero_solicitud,
    tipoPermiso: row.tipo?.nombre || '',
    tipoPermisoId: row.tipo_permiso_id,
    fechaSolicitud: formatFecha(row.fecha_solicitud),
    inicio: formatFecha(row.fecha_inicio),
    fin: formatFecha(row.fecha_fin),
    fechaInicioISO: row.fecha_inicio,
    fechaFinISO: row.fecha_fin,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    dias: row.cantidad_dias != null ? Number(row.cantidad_dias) : null,
    horas: row.cantidad_horas != null ? Number(row.cantidad_horas) : null,
    motivo: row.motivo,
    observaciones: row.observaciones,
    estado: row.estado,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
    aprobadoPor: row.aprobador?.full_name || '',
    fechaAprobacion: row.fecha_aprobacion,
    comentarioAprobacion: row.comentario_aprobacion,
    motivoRechazo: row.motivo_rechazo,
    documentoPath: row.documento_path,
    documentoNombre: row.documento_nombre,
  }
}

const ESTADO_INCAPACIDAD_LABEL = {
  registrada: { label: 'Registrada', class: 'yellow' },
  activa: { label: 'Activa', class: 'blue' },
  finalizada: { label: 'Finalizada', class: 'green' },
  anulada: { label: 'Anulada', class: 'gray' },
}

function mapIncapacidadRow(row) {
  const estadoInfo = ESTADO_INCAPACIDAD_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  const nombreCompleto = [row.empleados?.nombre, row.empleados?.primer_apellido, row.empleados?.segundo_apellido].filter(Boolean).join(' ')
  return {
    id: row.id,
    empleadoId: row.empleado_id,
    name: nombreCompleto || '—',
    initials: initialsOf(nombreCompleto),
    color: colorFor(row.empleado_id),
    numeroRegistro: row.numero_registro,
    numeroReferencia: row.numero_referencia,
    tipoIncapacidad: row.tipo?.nombre || '',
    tipoIncapacidadId: row.tipo_incapacidad_id,
    institucionEmisora: row.institucion?.nombre || '',
    institucionEmisoraId: row.institucion_emisora_id,
    fechaEmision: formatFecha(row.fecha_emision),
    fechaEmisionISO: row.fecha_emision,
    inicio: formatFecha(row.fecha_inicio),
    fin: formatFecha(row.fecha_fin),
    fechaInicioISO: row.fecha_inicio,
    fechaFinISO: row.fecha_fin,
    dias: row.cantidad_dias != null ? Number(row.cantidad_dias) : null,
    reincorporacionPrevista: formatFecha(row.fecha_reincorporacion_prevista),
    reincorporacionPrevistaISO: row.fecha_reincorporacion_prevista,
    reincorporacionReal: formatFecha(row.fecha_reincorporacion_real),
    reincorporacionRealISO: row.fecha_reincorporacion_real,
    observaciones: row.observaciones,
    estado: row.estado,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
    motivoAnulacion: row.motivo_anulacion,
    documentoPath: row.documento_path,
    documentoNombre: row.documento_nombre,
  }
}

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
    fechaIngresoISO: row.fecha_ingreso,
    active: row.estado === 'activo',
    estado: row.estado,
    cargoId: row.cargo_id,
    departamentoId: row.departamento_id,
    identificacion: row.cedula,
    fechaNacimiento: row.fecha_nacimiento,
    genero: GENERO_LABEL[row.genero] ?? '',
    telefono: row.telefono,
    telefonoSecundario: row.telefono_secundario || '',
    correo: row.email,
    direccion: row.direccion,
    tipoContrato: row.tipo_contrato,
    salario: row.salario,
    // Expediente ampliado (Fase 2)
    tipoIdentificacion: row.tipo_identificacion || '',
    primerApellido: row.primer_apellido || '',
    segundoApellido: row.segundo_apellido || '',
    nacionalidad: row.nacionalidad || '',
    estadoCivil: row.estado_civil || '',
    correoPersonal: row.correo_personal || '',
    correoInstitucional: row.correo_institucional || '',
    provincia: row.provincia || '',
    canton: row.canton || '',
    distrito: row.distrito || '',
    direccionExacta: row.direccion_exacta || '',
    codigoInterno: row.codigo_interno || '',
    jefeInmediatoId: row.jefe_inmediato_id || '',
    sedeId: row.sede_id || '',
    jornadaId: row.jornada_id || '',
    horarioId: row.horario_id || '',
    moneda: row.moneda || 'CRC',
    formaPago: row.forma_pago || '',
    estadoDetalleId: row.estado_detalle_id || '',
    profileId: row.profile_id || '',
  }
}

// Helper generico para las sub-tablas del expediente que solo necesitan
// listar/crear/eliminar registros hijos de un empleado (contactos de
// emergencia, formacion academica, colegiaturas, certificaciones, cursos).
// El payload de "crear" ya viene en columnas reales (snake_case) desde
// la vista, para no duplicar un mapeo camelCase por cada tabla.
function makeExpedienteCrud(table, selectCols = '*', orderCol = 'created_at') {
  return {
    list: async (empleadoId) => {
      if (!isSupabaseConfigured()) return { data: [], error: null }
      return supabase.from(table).select(selectCols).eq('empleado_id', empleadoId).order(orderCol, { ascending: false })
    },
    crear: async (cooperativaId, empleadoId, payload) => {
      return supabase.from(table).insert({ cooperativa_id: cooperativaId, empleado_id: empleadoId, ...payload }).select(selectCols).single()
    },
    eliminar: async (id) => supabase.from(table).delete().eq('id', id),
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
    return supabase.from('departamentos').select('id, nombre, activo').eq('activo', true).order('nombre')
  }

  // Para el mantenimiento en Configuración: incluye los inactivos, para
  // poder reactivarlos.
  async function listDepartamentosTodos() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('departamentos').select('id, nombre, activo').order('nombre')
  }

  async function crearDepartamento(cooperativaId, nombre) {
    if (!nombre?.trim()) return { data: null, error: null }
    return supabase.from('departamentos').insert({ cooperativa_id: cooperativaId, nombre: nombre.trim() }).select().single()
  }

  async function toggleDepartamentoActivo(id, activo) {
    return supabase.from('departamentos').update({ activo }).eq('id', id).select().single()
  }

  async function listCargos() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('cargos').select('id, nombre, departamento_id, salario_base').order('nombre')
  }

  // El catalogo de cargos puede estar vacio en una cooperativa nueva; en vez
  // de bloquear el alta de un colaborador, se resuelve u origina sobre la
  // marcha a partir del nombre escrito. Departamento ya no usa este patron
  // (tiene su propio mantenimiento en Configuracion), pero se deja disponible
  // por si se necesita en otro flujo.
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

  function empleadoPayload(payload) {
    return {
      nombre: payload.nombre,
      cedula: payload.identificacion,
      // "email" ya no tiene campo propio en el formulario (se separó en
      // correo personal/institucional); se mantiene sincronizado con el
      // institucional para no dejarlo huérfano con un valor viejo.
      email: payload.correoInstitucional || payload.correoPersonal || payload.correo || null,
      telefono: payload.telefono,
      telefono_secundario: payload.telefonoSecundario || null,
      cargo_id: payload.cargoId || null,
      departamento_id: payload.departamentoId || null,
      fecha_nacimiento: payload.fechaNacimiento || null,
      genero: GENERO_ENUM[payload.genero] ?? null,
      direccion: payload.direccion,
      tipo_contrato: payload.tipoContrato,
      salario: Number(payload.salario) || 0,
      estado: payload.activo ? 'activo' : 'inactivo',
      tipo_identificacion: payload.tipoIdentificacion || null,
      primer_apellido: payload.primerApellido || null,
      segundo_apellido: payload.segundoApellido || null,
      nacionalidad: payload.nacionalidad || null,
      estado_civil: payload.estadoCivil || null,
      correo_personal: payload.correoPersonal || null,
      correo_institucional: payload.correoInstitucional || null,
      provincia: payload.provincia || null,
      canton: payload.canton || null,
      distrito: payload.distrito || null,
      direccion_exacta: payload.direccionExacta || null,
      codigo_interno: payload.codigoInterno || null,
      jefe_inmediato_id: payload.jefeInmediatoId || null,
      sede_id: payload.sedeId || null,
      jornada_id: payload.jornadaId || null,
      horario_id: payload.horarioId || null,
      moneda: payload.moneda || 'CRC',
      forma_pago: payload.formaPago || null,
      estado_detalle_id: payload.estadoDetalleId || null,
      profile_id: payload.profileId || null,
    }
  }

  // Lista los usuarios (profiles) de la cooperativa, para vincular un
  // colaborador con su cuenta de acceso y así poder marcar su propia
  // asistencia. Un mismo profile solo debería vincularse a un colaborador.
  async function listPerfilesCooperativa(cooperativaId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('cooperativa_members')
      .select('profiles(id, full_name, email)')
      .eq('cooperativa_id', cooperativaId)
    if (error) return { data: null, error }
    return { data: data.map((r) => r.profiles).filter(Boolean), error: null }
  }

  async function createEmpleado(cooperativaId, payload) {
    return supabase
      .from('empleados')
      .insert({
        cooperativa_id: cooperativaId,
        ...empleadoPayload(payload),
        fecha_ingreso: payload.fechaIngreso || new Date().toISOString().slice(0, 10),
      })
      .select()
      .single()
  }

  async function updateEmpleado(id, payload) {
    return supabase
      .from('empleados')
      .update({
        ...empleadoPayload(payload),
        fecha_ingreso: payload.fechaIngreso || null,
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function eliminarEmpleado(id) {
    return supabase.from('empleados').delete().eq('id', id)
  }

  // ── Contactos de emergencia ─────────────────────────
  const contactosEmergenciaCrud = makeExpedienteCrud('contactos_emergencia')
  const listContactosEmergencia = contactosEmergenciaCrud.list
  const crearContactoEmergencia = contactosEmergenciaCrud.crear
  const eliminarContactoEmergencia = contactosEmergenciaCrud.eliminar

  // ── Contratos laborales (historico) ─────────────────
  async function listContratos(empleadoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase
      .from('contratos_laborales')
      .select('*, cargos(nombre), departamentos(nombre)')
      .eq('empleado_id', empleadoId)
      .order('fecha_inicio', { ascending: false })
  }
  async function crearContrato(cooperativaId, empleadoId, payload) {
    return supabase.from('contratos_laborales').insert({ cooperativa_id: cooperativaId, empleado_id: empleadoId, ...payload }).select().single()
  }

  // ── Formacion academica / colegiaturas / certificaciones / cursos ──
  const formacionAcademicaCrud = makeExpedienteCrud('formacion_academica')
  const listFormacionAcademica = formacionAcademicaCrud.list
  const crearFormacionAcademica = formacionAcademicaCrud.crear
  const eliminarFormacionAcademica = formacionAcademicaCrud.eliminar

  const colegiaturasCrud = makeExpedienteCrud('colegiaturas_profesionales')
  const listColegiaturas = colegiaturasCrud.list
  const crearColegiatura = colegiaturasCrud.crear
  const eliminarColegiatura = colegiaturasCrud.eliminar

  const certificacionesCrud = makeExpedienteCrud('certificaciones_profesionales')
  const listCertificacionesProfesionales = certificacionesCrud.list
  const crearCertificacionProfesional = certificacionesCrud.crear
  const eliminarCertificacionProfesional = certificacionesCrud.eliminar

  const cursosColaboradorCrud = makeExpedienteCrud('cursos_colaborador')
  const listCursosColaborador = cursosColaboradorCrud.list
  const crearCursoColaborador = cursosColaboradorCrud.crear
  const eliminarCursoColaborador = cursosColaboradorCrud.eliminar

  // ── Historial laboral (append-only: solo insert + select, ver RLS) ──
  async function listMovimientos(empleadoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase
      .from('movimientos_laborales')
      .select('*, tipo:catalogos_personal!tipo_movimiento_id(nombre), puestoAnterior:cargos!puesto_anterior_id(nombre), puestoNuevo:cargos!puesto_nuevo_id(nombre), deptoAnterior:departamentos!departamento_anterior_id(nombre), deptoNuevo:departamentos!departamento_nuevo_id(nombre)')
      .eq('empleado_id', empleadoId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
  }
  async function crearMovimiento(cooperativaId, empleadoId, payload) {
    return supabase.from('movimientos_laborales').insert({ cooperativa_id: cooperativaId, empleado_id: empleadoId, ...payload }).select().single()
  }

  // ── Salida de la cooperativa ─────────────────────────
  async function listSalidas(empleadoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('salidas_colaborador').select('*').eq('empleado_id', empleadoId).order('fecha_salida', { ascending: false })
  }
  async function registrarSalida(cooperativaId, empleadoId, payload) {
    const { data, error } = await supabase.from('salidas_colaborador').insert({ cooperativa_id: cooperativaId, empleado_id: empleadoId, ...payload }).select().single()
    if (error) return { data, error }
    await supabase.from('empleados').update({ estado: 'inactivo', fecha_retiro: payload.fecha_salida }).eq('id', empleadoId)
    return { data, error: null }
  }

  // ── Auditoría (tabla generica audit_log, ya existente) ──
  async function listAuditoria(empleadoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase
      .from('audit_log')
      .select('*, profiles(full_name)')
      .eq('tabla', 'empleados')
      .eq('registro_id', empleadoId)
      .order('created_at', { ascending: false })
  }
  async function registrarAuditoria(cooperativaId, userId, accion, registroId, datosAnteriores, datosNuevos) {
    return supabase.from('audit_log').insert({
      cooperativa_id: cooperativaId, user_id: userId, tabla: 'empleados', accion,
      registro_id: registroId, datos_anteriores: datosAnteriores || null, datos_nuevos: datosNuevos || null,
    })
  }

  // ── Datos bancarios y administrativos (1:1, acceso restringido por RLS) ──
  async function getDatosBancarios(empleadoId) {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    return supabase.from('datos_bancarios_empleado').select('*').eq('empleado_id', empleadoId).maybeSingle()
  }
  async function guardarDatosBancarios(cooperativaId, empleadoId, payload) {
    return supabase
      .from('datos_bancarios_empleado')
      .upsert({ cooperativa_id: cooperativaId, empleado_id: empleadoId, ...payload }, { onConflict: 'empleado_id' })
      .select()
      .single()
  }

  // ── Vacaciones (solicitud + aprobación, tabla dedicada) ──
  async function listVacaciones() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('vacaciones_solicitudes')
      .select('*, empleados(nombre, primer_apellido, segundo_apellido), tipo:catalogos_personal!tipo_vacacion_id(nombre), aprobador:profiles!aprobado_por(full_name)')
      .order('fecha_solicitud', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map(mapVacacionRow), error: null }
  }

  async function crearSolicitudVacaciones(cooperativaId, empleadoId, payload) {
    return supabase
      .from('vacaciones_solicitudes')
      .insert({
        cooperativa_id: cooperativaId,
        empleado_id: empleadoId,
        tipo_vacacion_id: payload.tipoVacacionId || null,
        fecha_inicio: payload.fechaInicio,
        fecha_fin: payload.fechaFin,
        dias_solicitados: Number(payload.diasSolicitados) || 0,
        dias_habiles: payload.diasHabiles != null && payload.diasHabiles !== '' ? Number(payload.diasHabiles) : null,
        observaciones: payload.observaciones || null,
      })
      .select()
      .single()
  }

  async function actualizarSolicitudVacaciones(id, payload) {
    return supabase
      .from('vacaciones_solicitudes')
      .update({
        tipo_vacacion_id: payload.tipoVacacionId || null,
        fecha_inicio: payload.fechaInicio,
        fecha_fin: payload.fechaFin,
        dias_solicitados: Number(payload.diasSolicitados) || 0,
        dias_habiles: payload.diasHabiles != null && payload.diasHabiles !== '' ? Number(payload.diasHabiles) : null,
        observaciones: payload.observaciones || null,
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function resolverVacacionSolicitud(id, { aprobado, aprobadoPor, comentario, motivoRechazo }) {
    return supabase
      .from('vacaciones_solicitudes')
      .update({
        estado: aprobado ? 'aprobada' : 'rechazada',
        aprobado_por: aprobadoPor || null,
        fecha_aprobacion: new Date().toISOString(),
        comentario_aprobacion: aprobado ? (comentario || null) : null,
        motivo_rechazo: aprobado ? null : motivoRechazo,
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function eliminarVacacionSolicitud(id) {
    return supabase.from('vacaciones_solicitudes').delete().eq('id', id)
  }

  async function subirDocumentoVacacion(cooperativaId, empleadoId, solicitudId, file) {
    const path = `${cooperativaId}/${empleadoId}/vacaciones/${solicitudId}-${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(BUCKET_DOCUMENTOS).upload(path, file)
    if (upErr) return { data: null, error: upErr }
    const { data, error } = await supabase
      .from('vacaciones_solicitudes')
      .update({ documento_path: path, documento_nombre: file.name })
      .eq('id', solicitudId)
      .select()
      .single()
    if (error) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return { data, error }
  }

  async function eliminarDocumentoVacacion(solicitudId, path) {
    if (path) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return supabase
      .from('vacaciones_solicitudes')
      .update({ documento_path: null, documento_nombre: null })
      .eq('id', solicitudId)
      .select()
      .single()
  }

  async function listVacacionesPorEmpleado(empleadoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('vacaciones_solicitudes')
      .select('*, tipo:catalogos_personal!tipo_vacacion_id(nombre)')
      .eq('empleado_id', empleadoId)
      .neq('estado', 'cancelada')
      .order('fecha_inicio', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map(mapVacacionRow), error: null }
  }

  // ── Permisos (solicitud + aprobación, tabla dedicada) ──
  async function listPermisosSolicitudes() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('permisos_solicitudes')
      .select('*, empleados(nombre, primer_apellido, segundo_apellido), tipo:catalogos_personal!tipo_permiso_id(nombre), aprobador:profiles!aprobado_por(full_name)')
      .order('fecha_solicitud', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map(mapPermisoSolicitudRow), error: null }
  }

  async function crearPermisoSolicitud(cooperativaId, empleadoId, payload) {
    return supabase
      .from('permisos_solicitudes')
      .insert({
        cooperativa_id: cooperativaId,
        empleado_id: empleadoId,
        tipo_permiso_id: payload.tipoPermisoId || null,
        fecha_inicio: payload.fechaInicio,
        fecha_fin: payload.fechaFin,
        hora_inicio: payload.horaInicio || null,
        hora_fin: payload.horaFin || null,
        cantidad_dias: payload.cantidadDias != null && payload.cantidadDias !== '' ? Number(payload.cantidadDias) : null,
        cantidad_horas: payload.cantidadHoras != null && payload.cantidadHoras !== '' ? Number(payload.cantidadHoras) : null,
        motivo: payload.motivo || null,
        observaciones: payload.observaciones || null,
      })
      .select()
      .single()
  }

  async function actualizarPermisoSolicitud(id, payload) {
    return supabase
      .from('permisos_solicitudes')
      .update({
        tipo_permiso_id: payload.tipoPermisoId || null,
        fecha_inicio: payload.fechaInicio,
        fecha_fin: payload.fechaFin,
        hora_inicio: payload.horaInicio || null,
        hora_fin: payload.horaFin || null,
        cantidad_dias: payload.cantidadDias != null && payload.cantidadDias !== '' ? Number(payload.cantidadDias) : null,
        cantidad_horas: payload.cantidadHoras != null && payload.cantidadHoras !== '' ? Number(payload.cantidadHoras) : null,
        motivo: payload.motivo || null,
        observaciones: payload.observaciones || null,
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function resolverPermisoSolicitud(id, { aprobado, aprobadoPor, comentario, motivoRechazo }) {
    return supabase
      .from('permisos_solicitudes')
      .update({
        estado: aprobado ? 'aprobado' : 'rechazado',
        aprobado_por: aprobadoPor || null,
        fecha_aprobacion: new Date().toISOString(),
        comentario_aprobacion: aprobado ? (comentario || null) : null,
        motivo_rechazo: aprobado ? null : motivoRechazo,
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function eliminarPermisoSolicitud(id) {
    return supabase.from('permisos_solicitudes').delete().eq('id', id)
  }

  async function subirDocumentoPermiso(cooperativaId, empleadoId, solicitudId, file) {
    const path = `${cooperativaId}/${empleadoId}/permisos/${solicitudId}-${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(BUCKET_DOCUMENTOS).upload(path, file)
    if (upErr) return { data: null, error: upErr }
    const { data, error } = await supabase
      .from('permisos_solicitudes')
      .update({ documento_path: path, documento_nombre: file.name })
      .eq('id', solicitudId)
      .select()
      .single()
    if (error) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return { data, error }
  }

  async function eliminarDocumentoPermiso(solicitudId, path) {
    if (path) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return supabase
      .from('permisos_solicitudes')
      .update({ documento_path: null, documento_nombre: null })
      .eq('id', solicitudId)
      .select()
      .single()
  }

  // ── Incapacidades (registro + reincorporación, tabla dedicada) ──
  function calcularEstadoInicial(fechaInicio, fechaFin) {
    const hoy = new Date().toISOString().slice(0, 10)
    if (hoy < fechaInicio) return 'registrada'
    if (hoy <= fechaFin) return 'activa'
    return 'finalizada'
  }

  async function listIncapacidades() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('incapacidades')
      .select('*, empleados(nombre, primer_apellido, segundo_apellido), tipo:catalogos_personal!tipo_incapacidad_id(nombre), institucion:catalogos_personal!institucion_emisora_id(nombre)')
      .order('fecha_inicio', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map(mapIncapacidadRow), error: null }
  }

  async function crearIncapacidad(cooperativaId, empleadoId, payload) {
    return supabase
      .from('incapacidades')
      .insert({
        cooperativa_id: cooperativaId,
        empleado_id: empleadoId,
        tipo_incapacidad_id: payload.tipoIncapacidadId || null,
        institucion_emisora_id: payload.institucionEmisoraId || null,
        numero_referencia: payload.numeroReferencia || null,
        fecha_emision: payload.fechaEmision || null,
        fecha_inicio: payload.fechaInicio,
        fecha_fin: payload.fechaFin,
        cantidad_dias: payload.cantidadDias != null && payload.cantidadDias !== '' ? Number(payload.cantidadDias) : null,
        fecha_reincorporacion_prevista: payload.fechaReincorporacionPrevista || null,
        observaciones: payload.observaciones || null,
        estado: calcularEstadoInicial(payload.fechaInicio, payload.fechaFin),
      })
      .select()
      .single()
  }

  async function actualizarIncapacidad(id, payload) {
    return supabase
      .from('incapacidades')
      .update({
        tipo_incapacidad_id: payload.tipoIncapacidadId || null,
        institucion_emisora_id: payload.institucionEmisoraId || null,
        numero_referencia: payload.numeroReferencia || null,
        fecha_emision: payload.fechaEmision || null,
        fecha_inicio: payload.fechaInicio,
        fecha_fin: payload.fechaFin,
        cantidad_dias: payload.cantidadDias != null && payload.cantidadDias !== '' ? Number(payload.cantidadDias) : null,
        fecha_reincorporacion_prevista: payload.fechaReincorporacionPrevista || null,
        observaciones: payload.observaciones || null,
        estado: calcularEstadoInicial(payload.fechaInicio, payload.fechaFin),
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function registrarReincorporacion(id, { fechaReal, observaciones }) {
    const patch = { fecha_reincorporacion_real: fechaReal, estado: 'finalizada' }
    if (observaciones != null && observaciones !== '') patch.observaciones = observaciones
    return supabase.from('incapacidades').update(patch).eq('id', id).select().single()
  }

  async function anularIncapacidad(id, motivo) {
    return supabase
      .from('incapacidades')
      .update({ estado: 'anulada', motivo_anulacion: motivo })
      .eq('id', id)
      .select()
      .single()
  }

  async function eliminarIncapacidad(id) {
    return supabase.from('incapacidades').delete().eq('id', id)
  }

  async function subirDocumentoIncapacidad(cooperativaId, empleadoId, incapacidadId, file) {
    const path = `${cooperativaId}/${empleadoId}/incapacidades/${incapacidadId}-${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(BUCKET_DOCUMENTOS).upload(path, file)
    if (upErr) return { data: null, error: upErr }
    const { data, error } = await supabase
      .from('incapacidades')
      .update({ documento_path: path, documento_nombre: file.name })
      .eq('id', incapacidadId)
      .select()
      .single()
    if (error) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return { data, error }
  }

  async function eliminarDocumentoIncapacidad(incapacidadId, path) {
    if (path) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return supabase
      .from('incapacidades')
      .update({ documento_path: null, documento_nombre: null })
      .eq('id', incapacidadId)
      .select()
      .single()
  }

  // ── Asistencia (configuración, marcaciones, carga masiva) ──
  async function getConfiguracionAsistencia(cooperativaId) {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    return supabase.from('configuracion_asistencia').select('*').eq('cooperativa_id', cooperativaId).maybeSingle()
  }

  async function guardarConfiguracionAsistencia(cooperativaId, payload) {
    return supabase
      .from('configuracion_asistencia')
      .upsert({
        cooperativa_id: cooperativaId,
        modalidad: payload.modalidad,
        hora_entrada_estandar: payload.horaEntradaEstandar,
        hora_salida_estandar: payload.horaSalidaEstandar,
        tolerancia_minutos: Number(payload.toleranciaMinutos) || 15,
      }, { onConflict: 'cooperativa_id' })
      .select()
      .single()
  }

  // Compara una hora de entrada (HH:MM) contra la hora estándar + tolerancia
  // configuradas; devuelve los minutos de tardanza (0 si llegó a tiempo).
  function calcularTardanza(horaEntrada, config) {
    if (!horaEntrada || !config?.hora_entrada_estandar) return 0
    const [h1, m1] = horaEntrada.split(':').map(Number)
    const [h2, m2] = config.hora_entrada_estandar.split(':').map(Number)
    const diff = (h1 * 60 + m1) - (h2 * 60 + m2)
    const tolerancia = config.tolerancia_minutos ?? 15
    return diff > tolerancia ? diff : 0
  }

  async function getMiEmpleado(profileId) {
    if (!isSupabaseConfigured() || !profileId) return { data: null, error: null }
    const { data, error } = await supabase
      .from('empleados')
      .select('*, cargos(nombre), departamentos(nombre)')
      .eq('profile_id', profileId)
      .maybeSingle()
    if (error || !data) return { data: null, error }
    return { data: mapEmpleadoRow(data), error: null }
  }

  async function getMarcacionDeHoy(empleadoId) {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    const hoy = new Date().toISOString().slice(0, 10)
    return supabase.from('asistencia_marcaciones').select('*').eq('empleado_id', empleadoId).eq('fecha', hoy).maybeSingle()
  }

  async function marcarEntrada(cooperativaId, empleadoId, { horaEntrada, minutosTardanza }) {
    const hoy = new Date().toISOString().slice(0, 10)
    return supabase
      .from('asistencia_marcaciones')
      .upsert({
        cooperativa_id: cooperativaId,
        empleado_id: empleadoId,
        fecha: hoy,
        hora_entrada: horaEntrada,
        minutos_tardanza: minutosTardanza,
        origen: 'manual',
      }, { onConflict: 'empleado_id,fecha' })
      .select()
      .single()
  }

  async function marcarSalida(id, horaSalida) {
    return supabase.from('asistencia_marcaciones').update({ hora_salida: horaSalida }).eq('id', id).select().single()
  }

  function mapMarcacionRow(row) {
    const nombreCompleto = [row.empleados?.nombre, row.empleados?.primer_apellido, row.empleados?.segundo_apellido].filter(Boolean).join(' ')
    return {
      id: row.id,
      empleadoId: row.empleado_id,
      name: nombreCompleto || '—',
      initials: initialsOf(nombreCompleto),
      color: colorFor(row.empleado_id),
      fecha: row.fecha,
      fechaFmt: formatFecha(row.fecha),
      horaEntrada: row.hora_entrada ? row.hora_entrada.slice(0, 5) : null,
      horaSalida: row.hora_salida ? row.hora_salida.slice(0, 5) : null,
      minutosTardanza: row.minutos_tardanza,
      observacion: row.observacion,
      origen: row.origen,
    }
  }

  async function listMarcaciones({ desde, hasta } = {}) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    let req = supabase.from('asistencia_marcaciones').select('*, empleados(nombre, primer_apellido, segundo_apellido)').order('fecha', { ascending: false })
    if (desde) req = req.gte('fecha', desde)
    if (hasta) req = req.lte('fecha', hasta)
    const { data, error } = await req
    if (error) return { data: null, error }
    return { data: data.map(mapMarcacionRow), error: null }
  }

  // Valida las filas del archivo de carga masiva contra los colaboradores
  // reales (por cédula) y contra marcaciones ya existentes para esa fecha,
  // sin escribir nada todavia — el resultado se muestra al usuario antes de
  // confirmar (paso de validación descrito en el md de Asistencia).
  async function importarMarcacionesMasivo(cooperativaId, filas) {
    if (!isSupabaseConfigured()) return { validos: [], advertencias: [], errores: [] }
    const { data: empleadosData } = await supabase.from('empleados').select('id, cedula').eq('cooperativa_id', cooperativaId)
    const porCedula = new Map((empleadosData || []).map((e) => [String(e.cedula || '').trim(), e.id]))

    const candidatos = []
    const errores = []
    filas.forEach((fila, i) => {
      const numFila = i + 2
      const empleadoId = porCedula.get(String(fila.identificacion || '').trim())
      if (!empleadoId) { errores.push({ fila: numFila, identificacion: fila.identificacion, mensaje: 'Colaborador no encontrado.' }); return }
      if (!fila.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fila.fecha)) { errores.push({ fila: numFila, identificacion: fila.identificacion, mensaje: 'Fecha inválida (use AAAA-MM-DD).' }); return }
      if (!fila.horaEntrada || !/^\d{2}:\d{2}$/.test(fila.horaEntrada)) { errores.push({ fila: numFila, identificacion: fila.identificacion, mensaje: 'Hora de entrada obligatoria o con formato inválido (use HH:MM).' }); return }
      if (fila.horaSalida && !/^\d{2}:\d{2}$/.test(fila.horaSalida)) { errores.push({ fila: numFila, identificacion: fila.identificacion, mensaje: 'Formato de hora de salida inválido (use HH:MM).' }); return }
      candidatos.push({ ...fila, empleadoId, fila: numFila })
    })

    const empleadoIds = [...new Set(candidatos.map((c) => c.empleadoId))]
    const { data: existentes } = empleadoIds.length
      ? await supabase.from('asistencia_marcaciones').select('empleado_id, fecha').in('empleado_id', empleadoIds)
      : { data: [] }
    const existentesSet = new Set((existentes || []).map((e) => `${e.empleado_id}|${e.fecha}`))

    const validos = []
    const advertencias = []
    candidatos.forEach((c) => {
      if (existentesSet.has(`${c.empleadoId}|${c.fecha}`)) {
        advertencias.push({ fila: c.fila, identificacion: c.identificacion, mensaje: 'Ya existe una marcación para esa fecha; se sobrescribirá.' })
      }
      validos.push(c)
    })

    return { validos, advertencias, errores }
  }

  async function confirmarImportacionMasiva(cooperativaId, filasValidas, config) {
    const rows = filasValidas.map((f) => ({
      cooperativa_id: cooperativaId,
      empleado_id: f.empleadoId,
      fecha: f.fecha,
      hora_entrada: f.horaEntrada || null,
      hora_salida: f.horaSalida || null,
      minutos_tardanza: calcularTardanza(f.horaEntrada, config),
      observacion: f.observacion || null,
      origen: 'carga_masiva',
    }))
    return supabase.from('asistencia_marcaciones').upsert(rows, { onConflict: 'empleado_id,fecha' }).select()
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
    listDepartamentos, listDepartamentosTodos, crearDepartamento, toggleDepartamentoActivo,
    listCargos, listEmpleados, createEmpleado, updateEmpleado, eliminarEmpleado,
    findOrCreateDepartamento, findOrCreateCargo, listPerfilesCooperativa,
    listPermisos, crearPermiso, resolverPermiso, listCapacitaciones, crearCapacitacion,
    listPermisosSolicitudes, crearPermisoSolicitud, actualizarPermisoSolicitud, resolverPermisoSolicitud, eliminarPermisoSolicitud,
    subirDocumentoPermiso, eliminarDocumentoPermiso,
    listIncapacidades, crearIncapacidad, actualizarIncapacidad, registrarReincorporacion, anularIncapacidad, eliminarIncapacidad,
    subirDocumentoIncapacidad, eliminarDocumentoIncapacidad,
    getConfiguracionAsistencia, guardarConfiguracionAsistencia, calcularTardanza,
    getMiEmpleado, getMarcacionDeHoy, marcarEntrada, marcarSalida,
    listMarcaciones, importarMarcacionesMasivo, confirmarImportacionMasiva,
    listVacaciones, crearSolicitudVacaciones, actualizarSolicitudVacaciones, resolverVacacionSolicitud, eliminarVacacionSolicitud, listVacacionesPorEmpleado,
    subirDocumentoVacacion, eliminarDocumentoVacacion,
    listContactosEmergencia, crearContactoEmergencia, eliminarContactoEmergencia,
    listContratos, crearContrato,
    listFormacionAcademica, crearFormacionAcademica, eliminarFormacionAcademica,
    listColegiaturas, crearColegiatura, eliminarColegiatura,
    listCertificacionesProfesionales, crearCertificacionProfesional, eliminarCertificacionProfesional,
    listCursosColaborador, crearCursoColaborador, eliminarCursoColaborador,
    getDatosBancarios, guardarDatosBancarios,
    listMovimientos, crearMovimiento,
    listSalidas, registrarSalida,
    listAuditoria, registrarAuditoria,
  }
}
