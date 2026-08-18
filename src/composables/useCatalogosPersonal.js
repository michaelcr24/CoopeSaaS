import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

export const TIPOS_CATALOGO = [
  { key: 'sede', label: 'Sedes' },
  { key: 'tipo_contratacion', label: 'Tipos de contratación' },
  { key: 'jornada', label: 'Jornadas laborales' },
  { key: 'horario', label: 'Horarios' },
  { key: 'tipo_documento', label: 'Tipos de documento' },
  { key: 'tipo_movimiento', label: 'Tipos de movimiento' },
  { key: 'tipo_salida', label: 'Tipos de salida' },
  { key: 'institucion_educativa', label: 'Instituciones educativas' },
  { key: 'colegio_profesional', label: 'Colegios profesionales' },
  { key: 'estado_laboral', label: 'Estados laborales' },
]

export function useCatalogosPersonal() {
  async function listByTipo(tipo) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase
      .from('catalogos_personal')
      .select('id, nombre, activo, orden')
      .eq('tipo', tipo)
      .order('orden')
      .order('nombre')
  }

  async function crear(cooperativaId, tipo, nombre) {
    return supabase
      .from('catalogos_personal')
      .insert({ cooperativa_id: cooperativaId, tipo, nombre })
      .select()
      .single()
  }

  async function toggleActivo(id, activo) {
    return supabase.from('catalogos_personal').update({ activo }).eq('id', id).select().single()
  }

  async function eliminar(id) {
    return supabase.from('catalogos_personal').delete().eq('id', id)
  }

  // Igual que findOrCreateDepartamento/findOrCreateCargo: permite campos de
  // texto libre en el formulario mientras sigue normalizando a un catalogo.
  async function findOrCreate(cooperativaId, tipo, nombre) {
    if (!nombre?.trim()) return { data: null, error: null }
    const { data: existente } = await supabase
      .from('catalogos_personal').select('id').eq('cooperativa_id', cooperativaId).eq('tipo', tipo).eq('nombre', nombre).maybeSingle()
    if (existente) return { data: existente, error: null }
    return supabase.from('catalogos_personal').insert({ cooperativa_id: cooperativaId, tipo, nombre }).select('id').single()
  }

  return { TIPOS_CATALOGO, listByTipo, crear, toggleActivo, eliminar, findOrCreate }
}
