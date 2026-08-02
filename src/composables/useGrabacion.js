import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const BUCKET = 'asambleas-audio'

export function useGrabacion() {
  async function getGrabacion(asambleaId) {
    if (!isSupabaseConfigured()) return { data: null, error: null }
    return supabase.from('asamblea_grabacion').select('*').eq('asamblea_id', asambleaId).maybeSingle()
  }

  async function subirSegmento(cooperativaId, asambleaId, seq, blob) {
    const path = `${cooperativaId}/${asambleaId}/segment-${String(seq).padStart(4, '0')}.webm`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'audio/webm' })
    if (upErr) return { error: upErr }
    const { error: rpcErr } = await supabase.rpc('rpc_append_audio_segment', {
      p_asamblea_id: asambleaId,
      p_segment: { seq, path, size_bytes: blob.size, uploaded_at: new Date().toISOString() },
    })
    return { error: rpcErr }
  }

  async function finalizarGrabacion(asambleaId) {
    return supabase
      .from('asamblea_grabacion')
      .update({ estado: 'audio_subido', grabacion_finalizada_at: new Date().toISOString() })
      .eq('asamblea_id', asambleaId)
      .eq('estado', 'grabando')
  }

  async function iniciarTranscripcion(asambleaId) {
    const { data, error } = await supabase.functions.invoke('asamblea-transcribir', { body: { asamblea_id: asambleaId } })
    if (error) return { error }
    if (data?.error) return { error: { message: data.error } }
    return { error: null }
  }

  async function generarMinuta(asambleaId) {
    const { data, error } = await supabase.functions.invoke('asamblea-generar-minuta', { body: { asamblea_id: asambleaId } })
    if (error) return { error }
    if (data?.error) return { error: { message: data.error } }
    return { error: null }
  }

  async function guardarMinutaEditada(asambleaId, texto) {
    return supabase.from('asamblea_grabacion').update({ minuta_borrador: texto }).eq('asamblea_id', asambleaId)
  }

  function subscribeGrabacion(asambleaId, onChange) {
    const channel = supabase
      .channel(`grabacion-${asambleaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asamblea_grabacion', filter: `asamblea_id=eq.${asambleaId}` }, onChange)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  return {
    getGrabacion,
    subirSegmento,
    finalizarGrabacion,
    iniciarTranscripcion,
    generarMinuta,
    guardarMinutaEditada,
    subscribeGrabacion,
  }
}
