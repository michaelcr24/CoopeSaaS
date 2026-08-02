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

  return { search, getByProfileId }
}
