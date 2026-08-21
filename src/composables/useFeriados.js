import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

export function useFeriados() {
  async function listFeriados() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('feriados').select('*').order('fecha')
  }

  async function crearFeriado(cooperativaId, payload) {
    return supabase
      .from('feriados')
      .insert({
        cooperativa_id: cooperativaId,
        nombre: payload.nombre,
        fecha: payload.fecha,
        recurrente: !!payload.recurrente,
      })
      .select()
      .single()
  }

  async function toggleFeriadoActivo(id, activo) {
    return supabase.from('feriados').update({ activo }).eq('id', id).select().single()
  }

  async function eliminarFeriado(id) {
    return supabase.from('feriados').delete().eq('id', id)
  }

  return { listFeriados, crearFeriado, toggleFeriadoActivo, eliminarFeriado }
}
