import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { initialsOf, colorFor } from './useAsociados.js'

const BUCKET_DOCUMENTOS = 'documentos-personal'

export const TIPOS_PREGUNTA = [
  { key: 'escala_numerica', label: 'Escala numérica' },
  { key: 'escala_personalizada', label: 'Escala personalizada' },
  { key: 'texto_libre', label: 'Texto libre' },
  { key: 'seleccion_unica', label: 'Selección única' },
  { key: 'seleccion_multiple', label: 'Selección múltiple' },
  { key: 'porcentaje', label: 'Porcentaje' },
  { key: 'kpi', label: 'KPI' },
]
const TIPOS_ESCALA = new Set(['escala_numerica', 'escala_personalizada'])
const TIPOS_PUNTUABLES = new Set(['escala_numerica', 'escala_personalizada', 'porcentaje', 'kpi'])

export const TIPOS_EVALUADOR = [
  { key: 'autoevaluacion', label: 'Autoevaluación' },
  { key: 'jefe', label: 'Jefe directo' },
  { key: 'companero', label: 'Compañero' },
  { key: 'subordinado', label: 'Subordinado' },
  { key: 'adicional', label: 'Evaluador adicional' },
]

export const ESTADO_EVALUACION_LABEL = {
  borrador: { label: 'Borrador', class: 'gray' },
  activa: { label: 'Activa', class: 'blue' },
  finalizada: { label: 'Finalizada', class: 'green' },
  cancelada: { label: 'Cancelada', class: 'red' },
}

export const ESTADO_ASIGNACION_LABEL = {
  en_proceso: { label: 'En proceso', class: 'yellow' },
  completada: { label: 'Completada', class: 'blue' },
  en_aprobacion: { label: 'En aprobación', class: 'yellow' },
  aprobada: { label: 'Aprobada', class: 'green' },
  rechazada: { label: 'Rechazada', class: 'red' },
  cerrada: { label: 'Cerrada', class: 'green' },
  cancelada: { label: 'Cancelada', class: 'red' },
}

export const ESTADO_PARTICIPANTE_LABEL = {
  pendiente: { label: 'Pendiente', class: 'gray' },
  en_proceso: { label: 'En proceso', class: 'yellow' },
  completado: { label: 'Completado', class: 'green' },
}

function mapEvaluacionRow(row) {
  const estadoInfo = ESTADO_EVALUACION_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    periodo: row.periodo || '',
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    estado: row.estado,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
    formulaCalculo: row.formula_calculo,
    flujoAprobacion: row.flujo_aprobacion,
    createdAt: row.created_at,
  }
}

function mapSeccionRow(row) {
  return { id: row.id, evaluacionId: row.evaluacion_id, nombre: row.nombre, descripcion: row.descripcion || '', peso: Number(row.peso) || 0, orden: row.orden }
}

function mapEscalaRow(row) {
  return {
    id: row.id,
    evaluacionId: row.evaluacion_id,
    nombre: row.nombre,
    orden: row.orden,
    valores: (row.evaluaciones_escala_valores || []).map((v) => ({ id: v.id, valor: Number(v.valor), etiqueta: v.etiqueta, orden: v.orden })).sort((a, b) => a.orden - b.orden),
  }
}

function mapPreguntaRow(row) {
  return {
    id: row.id,
    seccionId: row.seccion_id,
    texto: row.texto,
    descripcion: row.descripcion || '',
    tipo: row.tipo,
    escalaId: row.escala_id,
    opciones: row.opciones || [],
    metaKpi: row.meta_kpi != null ? Number(row.meta_kpi) : null,
    peso: Number(row.peso) || 1,
    obligatoria: row.obligatoria,
    orden: row.orden,
    activa: row.activa,
  }
}

function mapRangoRow(row) {
  return { id: row.id, evaluacionId: row.evaluacion_id, etiqueta: row.etiqueta, puntajeMin: Number(row.puntaje_min), puntajeMax: Number(row.puntaje_max), orden: row.orden }
}

function mapAsignacionRow(row) {
  const estadoInfo = ESTADO_ASIGNACION_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  const nombreCompleto = [row.empleados?.nombre, row.empleados?.primer_apellido, row.empleados?.segundo_apellido].filter(Boolean).join(' ')
  return {
    id: row.id,
    evaluacionId: row.evaluacion_id,
    empleadoId: row.empleado_id,
    name: nombreCompleto || '—',
    initials: initialsOf(nombreCompleto),
    color: colorFor(row.empleado_id),
    dept: row.empleados?.departamentos?.nombre || '—',
    puesto: row.empleados?.cargos?.nombre || '—',
    numero: row.numero,
    estado: row.estado,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
    puntajeTotal: row.puntaje_total != null ? Number(row.puntaje_total) : null,
    resultadoEtiqueta: row.resultado_etiqueta || '',
    fechaCompletada: row.fecha_completada,
    documentoPath: row.documento_path,
    documentoNombre: row.documento_nombre,
    createdAt: row.created_at,
  }
}

function mapParticipanteRow(row) {
  const estadoInfo = ESTADO_PARTICIPANTE_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  const tipoInfo = TIPOS_EVALUADOR.find((t) => t.key === row.tipo_evaluador)
  return {
    id: row.id,
    asignacionId: row.asignacion_id,
    evaluadorProfileId: row.evaluador_profile_id,
    nombreEvaluador: row.evaluador?.full_name || row.evaluador?.email || row.nombre_evaluador || '—',
    tipoEvaluador: row.tipo_evaluador,
    tipoEvaluadorLabel: tipoInfo?.label || row.tipo_evaluador,
    estado: row.estado,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
    puntajeTotal: row.puntaje_total != null ? Number(row.puntaje_total) : null,
    comentario: row.comentario || '',
    completadoAt: row.completado_at,
  }
}

function mapPasoRow(row) {
  return {
    id: row.id,
    asignacionId: row.asignacion_id,
    pasoNombre: row.paso_nombre,
    orden: row.orden,
    estado: row.estado,
    aprobadorProfileId: row.aprobador_profile_id,
    aprobadorNombre: row.aprobador?.full_name || row.aprobador?.email || '',
    fechaResolucion: row.fecha_resolucion,
    comentario: row.comentario || '',
  }
}

function mapAccionMejoraRow(row) {
  return {
    id: row.id,
    asignacionId: row.asignacion_id,
    accion: row.accion,
    responsable: row.responsable || '',
    fechaCompromiso: row.fecha_compromiso,
    fechaSeguimiento: row.fecha_seguimiento,
    estado: row.estado,
  }
}

const ASIGNACION_SELECT = '*, empleados(nombre, primer_apellido, segundo_apellido, departamentos(nombre), cargos(nombre))'
const PARTICIPANTE_SELECT = '*, evaluador:profiles!evaluador_profile_id(full_name, email)'
const PASO_SELECT = '*, aprobador:profiles!aprobador_profile_id(full_name, email)'

export function useEvaluaciones() {
  // ── Evaluaciones (plantilla) ──
  async function listEvaluaciones() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones').select('*').order('created_at', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map(mapEvaluacionRow), error: null }
  }

  async function crearEvaluacion(cooperativaId, creadoPor, payload) {
    return supabase
      .from('evaluaciones')
      .insert({
        cooperativa_id: cooperativaId,
        creado_por: creadoPor,
        nombre: payload.nombre,
        descripcion: payload.descripcion || null,
        periodo: payload.periodo || null,
        fecha_inicio: payload.fechaInicio || null,
        fecha_fin: payload.fechaFin || null,
        formula_calculo: payload.formulaCalculo || 'promedio_ponderado',
        flujo_aprobacion: payload.flujoAprobacion || 'basico',
      })
      .select()
      .single()
  }

  async function actualizarEvaluacion(id, payload) {
    return supabase
      .from('evaluaciones')
      .update({
        nombre: payload.nombre,
        descripcion: payload.descripcion || null,
        periodo: payload.periodo || null,
        fecha_inicio: payload.fechaInicio || null,
        fecha_fin: payload.fechaFin || null,
        formula_calculo: payload.formulaCalculo || 'promedio_ponderado',
        flujo_aprobacion: payload.flujoAprobacion || 'basico',
      })
      .eq('id', id)
      .select()
      .single()
  }

  async function cambiarEstadoEvaluacion(id, estado) {
    return supabase.from('evaluaciones').update({ estado }).eq('id', id).select().single()
  }

  async function eliminarEvaluacion(id) {
    return supabase.from('evaluaciones').delete().eq('id', id)
  }

  // ── Secciones ──
  async function listSecciones(evaluacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_secciones').select('*').eq('evaluacion_id', evaluacionId).order('orden')
    if (error) return { data: null, error }
    return { data: data.map(mapSeccionRow), error: null }
  }

  async function crearSeccion(evaluacionId, payload) {
    return supabase
      .from('evaluaciones_secciones')
      .insert({ evaluacion_id: evaluacionId, nombre: payload.nombre, descripcion: payload.descripcion || null, peso: Number(payload.peso) || 0, orden: payload.orden ?? 0 })
      .select()
      .single()
  }

  async function eliminarSeccion(id) {
    return supabase.from('evaluaciones_secciones').delete().eq('id', id)
  }

  // ── Escalas ──
  async function listEscalas(evaluacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_escalas').select('*, evaluaciones_escala_valores(*)').eq('evaluacion_id', evaluacionId).order('orden')
    if (error) return { data: null, error }
    return { data: data.map(mapEscalaRow), error: null }
  }

  async function crearEscala(evaluacionId, nombre, orden = 0) {
    return supabase.from('evaluaciones_escalas').insert({ evaluacion_id: evaluacionId, nombre, orden }).select().single()
  }

  async function eliminarEscala(id) {
    return supabase.from('evaluaciones_escalas').delete().eq('id', id)
  }

  async function crearValorEscala(escalaId, payload) {
    return supabase
      .from('evaluaciones_escala_valores')
      .insert({ escala_id: escalaId, valor: Number(payload.valor), etiqueta: payload.etiqueta, orden: payload.orden ?? 0 })
      .select()
      .single()
  }

  async function eliminarValorEscala(id) {
    return supabase.from('evaluaciones_escala_valores').delete().eq('id', id)
  }

  async function crearEscalaEstandar1a5(evaluacionId) {
    const { data: escala, error } = await crearEscala(evaluacionId, 'Escala 1-5', 0)
    if (error) return { data: null, error }
    const valores = [
      { valor: 1, etiqueta: 'Muy deficiente' },
      { valor: 2, etiqueta: 'Deficiente' },
      { valor: 3, etiqueta: 'Aceptable' },
      { valor: 4, etiqueta: 'Bueno' },
      { valor: 5, etiqueta: 'Excelente' },
    ]
    await Promise.all(valores.map((v, i) => crearValorEscala(escala.id, { ...v, orden: i })))
    return { data: escala, error: null }
  }

  // ── Preguntas ──
  async function listPreguntas(seccionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_preguntas').select('*').eq('seccion_id', seccionId).order('orden')
    if (error) return { data: null, error }
    return { data: data.map(mapPreguntaRow), error: null }
  }

  // Todas las preguntas de la evaluación (a través de sus secciones), usadas
  // para el cálculo agregado y la vista previa/formulario de respuesta.
  async function listPreguntasPorEvaluacion(evaluacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data: secciones } = await supabase.from('evaluaciones_secciones').select('id').eq('evaluacion_id', evaluacionId)
    const seccionIds = (secciones || []).map((s) => s.id)
    if (!seccionIds.length) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_preguntas').select('*').in('seccion_id', seccionIds).order('orden')
    if (error) return { data: null, error }
    return { data: data.map(mapPreguntaRow), error: null }
  }

  async function crearPregunta(seccionId, payload) {
    return supabase
      .from('evaluaciones_preguntas')
      .insert({
        seccion_id: seccionId,
        texto: payload.texto,
        descripcion: payload.descripcion || null,
        tipo: payload.tipo || 'escala_numerica',
        escala_id: payload.escalaId || null,
        opciones: payload.opciones?.length ? payload.opciones : null,
        meta_kpi: payload.metaKpi != null && payload.metaKpi !== '' ? Number(payload.metaKpi) : null,
        peso: Number(payload.peso) || 1,
        obligatoria: payload.obligatoria !== false,
        orden: payload.orden ?? 0,
      })
      .select()
      .single()
  }

  async function eliminarPregunta(id) {
    return supabase.from('evaluaciones_preguntas').delete().eq('id', id)
  }

  // ── Rangos de resultado ──
  async function listRangos(evaluacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_rangos').select('*').eq('evaluacion_id', evaluacionId).order('orden')
    if (error) return { data: null, error }
    return { data: data.map(mapRangoRow), error: null }
  }

  async function crearRango(evaluacionId, payload) {
    return supabase
      .from('evaluaciones_rangos')
      .insert({ evaluacion_id: evaluacionId, etiqueta: payload.etiqueta, puntaje_min: Number(payload.puntajeMin) || 0, puntaje_max: Number(payload.puntajeMax) || 0, orden: payload.orden ?? 0 })
      .select()
      .single()
  }

  async function eliminarRango(id) {
    return supabase.from('evaluaciones_rangos').delete().eq('id', id)
  }

  function resolverResultado(puntajeTotal, rangos) {
    const encontrado = rangos.find((r) => puntajeTotal >= r.puntajeMin && puntajeTotal <= r.puntajeMax)
    return encontrado?.etiqueta || ''
  }

  // ── Cálculo ──
  // Normaliza la respuesta de una pregunta puntuable a una escala 0-100,
  // según su tipo (escala/porcentaje/KPI), para poder combinarlas entre sí
  // sin importar la escala original de cada una.
  function normalizarRespuesta(pregunta, respuesta, escalasPorId) {
    if (!respuesta) return null
    if (TIPOS_ESCALA.has(pregunta.tipo)) {
      const escala = escalasPorId.get(pregunta.escalaId)
      if (!escala || respuesta.valor_numerico == null || !escala.valores.length) return null
      const valores = escala.valores.map((v) => v.valor)
      const min = Math.min(...valores)
      const max = Math.max(...valores)
      if (max === min) return null
      return ((Number(respuesta.valor_numerico) - min) / (max - min)) * 100
    }
    if (pregunta.tipo === 'porcentaje') {
      return respuesta.valor_numerico != null ? Math.min(100, Math.max(0, Number(respuesta.valor_numerico))) : null
    }
    if (pregunta.tipo === 'kpi') {
      if (respuesta.valor_numerico == null || !pregunta.metaKpi) return null
      return Math.min(100, (Number(respuesta.valor_numerico) / pregunta.metaKpi) * 100)
    }
    return null
  }

  // Calcula el puntaje (0-100) de un participante a partir de sus
  // respuestas, agrupando por sección y aplicando el método de cálculo
  // configurado en la evaluación (promedio simple o ponderado por sección).
  function calcularPuntajeParticipante({ formulaCalculo, secciones, preguntas, respuestas, escalas }) {
    const escalasPorId = new Map(escalas.map((e) => [e.id, e]))
    const respuestasPorPregunta = new Map(respuestas.map((r) => [r.pregunta_id, r]))

    const seccionScores = secciones.map((seccion) => {
      const preguntasSeccion = preguntas.filter((p) => p.seccionId === seccion.id && TIPOS_PUNTUABLES.has(p.tipo))
      let sumaPeso = 0
      let sumaPonderada = 0
      preguntasSeccion.forEach((p) => {
        const normalizado = normalizarRespuesta(p, respuestasPorPregunta.get(p.id), escalasPorId)
        if (normalizado == null) return
        sumaPeso += p.peso
        sumaPonderada += normalizado * p.peso
      })
      return { seccion, score: sumaPeso > 0 ? sumaPonderada / sumaPeso : null }
    }).filter((s) => s.score != null)

    if (!seccionScores.length) return null

    if (formulaCalculo === 'promedio_simple') {
      return seccionScores.reduce((sum, s) => sum + s.score, 0) / seccionScores.length
    }
    // 'promedio_ponderado' y 'personalizada' usan el peso configurado en cada sección.
    const sumaPesoSecciones = seccionScores.reduce((sum, s) => sum + s.seccion.peso, 0)
    if (sumaPesoSecciones <= 0) return seccionScores.reduce((sum, s) => sum + s.score, 0) / seccionScores.length
    return seccionScores.reduce((sum, s) => sum + s.score * s.seccion.peso, 0) / sumaPesoSecciones
  }

  // ── Asignaciones (colaborador evaluado) ──
  async function listAsignaciones(evaluacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_asignaciones').select(ASIGNACION_SELECT).eq('evaluacion_id', evaluacionId).order('created_at')
    if (error) return { data: null, error }
    return { data: data.map(mapAsignacionRow), error: null }
  }

  async function listAsignacionesPorEmpleado(empleadoId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('evaluaciones_asignaciones')
      .select(`${ASIGNACION_SELECT}, evaluaciones(nombre, periodo)`)
      .eq('empleado_id', empleadoId)
      .order('created_at', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map((row) => ({ ...mapAsignacionRow(row), evaluacionNombre: row.evaluaciones?.nombre || '', evaluacionPeriodo: row.evaluaciones?.periodo || '' })), error: null }
  }

  async function crearAsignacionesMasivo(cooperativaId, evaluacionId, empleadoIds) {
    const rows = empleadoIds.map((empleadoId) => ({ cooperativa_id: cooperativaId, evaluacion_id: evaluacionId, empleado_id: empleadoId }))
    return supabase.from('evaluaciones_asignaciones').upsert(rows, { onConflict: 'evaluacion_id,empleado_id', ignoreDuplicates: true }).select()
  }

  async function eliminarAsignacion(id) {
    return supabase.from('evaluaciones_asignaciones').delete().eq('id', id)
  }

  async function getAsignacion(id) {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    const { data, error } = await supabase.from('evaluaciones_asignaciones').select(ASIGNACION_SELECT).eq('id', id).single()
    if (error) return { data: null, error }
    return { data: mapAsignacionRow(data), error: null }
  }

  async function actualizarAsignacion(id, patch) {
    return supabase.from('evaluaciones_asignaciones').update(patch).eq('id', id).select().single()
  }

  // ── Participantes (evaluadores 360°) ──
  async function listParticipantes(asignacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_participantes').select(PARTICIPANTE_SELECT).eq('asignacion_id', asignacionId).order('created_at')
    if (error) return { data: null, error }
    return { data: data.map(mapParticipanteRow), error: null }
  }

  async function agregarParticipante(cooperativaId, asignacionId, payload) {
    return supabase
      .from('evaluaciones_participantes')
      .insert({
        cooperativa_id: cooperativaId,
        asignacion_id: asignacionId,
        evaluador_profile_id: payload.evaluadorProfileId || null,
        nombre_evaluador: payload.nombreEvaluador || null,
        tipo_evaluador: payload.tipoEvaluador || 'adicional',
      })
      .select(PARTICIPANTE_SELECT)
      .single()
  }

  async function eliminarParticipante(id) {
    return supabase.from('evaluaciones_participantes').delete().eq('id', id)
  }

  async function actualizarParticipante(id, patch) {
    return supabase.from('evaluaciones_participantes').update(patch).eq('id', id).select(PARTICIPANTE_SELECT).single()
  }

  async function getParticipante(id) {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    const { data, error } = await supabase.from('evaluaciones_participantes').select(PARTICIPANTE_SELECT).eq('id', id).single()
    if (error) return { data: null, error }
    return { data: mapParticipanteRow(data), error: null }
  }

  // ── Respuestas ──
  async function listRespuestas(participanteId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_respuestas').select('*').eq('participante_id', participanteId)
    if (error) return { data: null, error }
    return { data, error: null }
  }

  async function guardarRespuesta(cooperativaId, participanteId, preguntaId, payload) {
    return supabase
      .from('evaluaciones_respuestas')
      .upsert({
        cooperativa_id: cooperativaId,
        participante_id: participanteId,
        pregunta_id: preguntaId,
        valor_numerico: payload.valorNumerico != null && payload.valorNumerico !== '' ? Number(payload.valorNumerico) : null,
        valor_texto: payload.valorTexto || null,
        valor_opciones: payload.valorOpciones?.length ? payload.valorOpciones : null,
        comentario: payload.comentario || null,
      }, { onConflict: 'participante_id,pregunta_id' })
      .select()
      .single()
  }

  // Marca un participante como completado y calcula su puntaje. Si con esto
  // se completan todos los participantes de la asignación, un trigger de
  // base de datos (evaluaciones_verificar_completitud, SECURITY DEFINER)
  // se encarga de promediar el resultado y arrancar el flujo de aprobación
  // — un evaluador que no sea admin no tiene permiso para escribir en la
  // asignación ni en los pasos de aprobación, así que esa parte no puede
  // resolverse desde el cliente.
  async function completarParticipante(participanteId, { comentario, evaluacion, secciones, preguntas, escalas, respuestas }) {
    const puntajeTotal = calcularPuntajeParticipante({ formulaCalculo: evaluacion.formulaCalculo, secciones, preguntas, respuestas, escalas })
    return supabase
      .from('evaluaciones_participantes')
      .update({ estado: 'completado', puntaje_total: puntajeTotal, comentario: comentario || null, completado_at: new Date().toISOString() })
      .eq('id', participanteId)
      .select()
      .single()
  }

  // ── Flujo de aprobación ──
  async function listPasosAprobacion(asignacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_aprobacion_pasos').select(PASO_SELECT).eq('asignacion_id', asignacionId).order('orden')
    if (error) return { data: null, error }
    return { data: data.map(mapPasoRow), error: null }
  }

  // Resuelve el siguiente paso pendiente de una asignación (aprobar/rechazar).
  // Si es el último paso y se aprueba, cierra la asignación; si se rechaza,
  // la marca como rechazada y detiene la cadena.
  async function resolverPasoAprobacion(id, { aprobado, aprobadorProfileId, comentario }) {
    const { data: paso, error } = await supabase
      .from('evaluaciones_aprobacion_pasos')
      .update({ estado: aprobado ? 'aprobado' : 'rechazado', aprobador_profile_id: aprobadorProfileId || null, fecha_resolucion: new Date().toISOString(), comentario: comentario || null })
      .eq('id', id)
      .select()
      .single()
    if (error) return { data: null, error }

    if (!aprobado) {
      await actualizarAsignacion(paso.asignacion_id, { estado: 'rechazada' })
      return { data: paso, error: null }
    }

    const { data: pasos } = await supabase.from('evaluaciones_aprobacion_pasos').select('estado').eq('asignacion_id', paso.asignacion_id)
    const todosAprobados = (pasos || []).every((p) => p.estado === 'aprobado')
    if (todosAprobados) await actualizarAsignacion(paso.asignacion_id, { estado: 'cerrada' })
    return { data: paso, error: null }
  }

  // ── Plan de mejora ──
  async function listPlanMejora(asignacionId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase.from('evaluaciones_plan_mejora').select('*').eq('asignacion_id', asignacionId).order('created_at')
    if (error) return { data: null, error }
    return { data: data.map(mapAccionMejoraRow), error: null }
  }

  async function crearAccionMejora(cooperativaId, asignacionId, payload) {
    return supabase
      .from('evaluaciones_plan_mejora')
      .insert({
        cooperativa_id: cooperativaId,
        asignacion_id: asignacionId,
        accion: payload.accion,
        responsable: payload.responsable || null,
        fecha_compromiso: payload.fechaCompromiso || null,
        fecha_seguimiento: payload.fechaSeguimiento || null,
      })
      .select()
      .single()
  }

  async function actualizarEstadoAccionMejora(id, estado) {
    return supabase.from('evaluaciones_plan_mejora').update({ estado }).eq('id', id).select().single()
  }

  async function eliminarAccionMejora(id) {
    return supabase.from('evaluaciones_plan_mejora').delete().eq('id', id)
  }

  // ── Documento firmado ──
  async function subirDocumentoFirmado(cooperativaId, empleadoId, asignacionId, file) {
    const path = `${cooperativaId}/${empleadoId}/evaluaciones/${asignacionId}-${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(BUCKET_DOCUMENTOS).upload(path, file)
    if (upErr) return { data: null, error: upErr }
    const { data, error } = await supabase.from('evaluaciones_asignaciones').update({ documento_path: path, documento_nombre: file.name }).eq('id', asignacionId).select().single()
    if (error) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return { data, error }
  }

  async function eliminarDocumentoFirmado(asignacionId, path) {
    if (path) await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
    return supabase.from('evaluaciones_asignaciones').update({ documento_path: null, documento_nombre: null }).eq('id', asignacionId).select().single()
  }

  return {
    listEvaluaciones, crearEvaluacion, actualizarEvaluacion, cambiarEstadoEvaluacion, eliminarEvaluacion,
    listSecciones, crearSeccion, eliminarSeccion,
    listEscalas, crearEscala, eliminarEscala, crearValorEscala, eliminarValorEscala, crearEscalaEstandar1a5,
    listPreguntas, listPreguntasPorEvaluacion, crearPregunta, eliminarPregunta,
    listRangos, crearRango, eliminarRango, resolverResultado, calcularPuntajeParticipante,
    listAsignaciones, listAsignacionesPorEmpleado, crearAsignacionesMasivo, eliminarAsignacion, getAsignacion, actualizarAsignacion,
    listParticipantes, agregarParticipante, eliminarParticipante, getParticipante, actualizarParticipante,
    listRespuestas, guardarRespuesta, completarParticipante,
    listPasosAprobacion, resolverPasoAprobacion,
    listPlanMejora, crearAccionMejora, actualizarEstadoAccionMejora, eliminarAccionMejora,
    subirDocumentoFirmado, eliminarDocumentoFirmado,
  }
}
