// Transcribe el audio de una asamblea, segmento por segmento, usando la API
// de transcripcion de OpenAI. Responde 202 de inmediato y procesa en
// background con EdgeRuntime.waitUntil, porque una asamblea de 3-4h implica
// 15-25 llamadas secuenciales a la API que exceden cualquier timeout de
// request/response razonable.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let asamblea_id: string
  try {
    ;({ asamblea_id } = await req.json())
    if (!asamblea_id) throw new Error('asamblea_id requerido')
  } catch {
    return new Response(JSON.stringify({ error: 'asamblea_id requerido' }), { status: 400, headers: corsHeaders })
  }

  // Cliente con el JWT del usuario: solo para verificar autorizacion (respeta la RLS de asamblea_grabacion)
  const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } },
  })
  const { data: grab, error: authErr } = await authClient
    .from('asamblea_grabacion')
    .select('id, audio_segments')
    .eq('asamblea_id', asamblea_id)
    .single()
  if (authErr || !grab) {
    return new Response(JSON.stringify({ error: 'No autorizado o no existe grabacion para esta asamblea' }), { status: 403, headers: corsHeaders })
  }
  if (!grab.audio_segments?.length) {
    return new Response(JSON.stringify({ error: 'No hay audio grabado para transcribir' }), { status: 400, headers: corsHeaders })
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  await admin
    .from('asamblea_grabacion')
    .update({ estado: 'transcribiendo', transcripcion_iniciada_at: new Date().toISOString(), error_detalle: null })
    .eq('asamblea_id', asamblea_id)

  // @ts-expect-error EdgeRuntime es un global del runtime de Supabase Edge Functions, no esta en los tipos estandar de Deno
  EdgeRuntime.waitUntil(procesarTranscripcion(admin, asamblea_id, grab.audio_segments))

  return new Response(JSON.stringify({ status: 'iniciado' }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})

async function procesarTranscripcion(admin: ReturnType<typeof createClient>, asambleaId: string, segments: Array<{ seq: number; path: string }>) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    await admin.from('asamblea_grabacion').update({ estado: 'error_transcripcion', error_detalle: 'OPENAI_API_KEY no configurada' }).eq('asamblea_id', asambleaId)
    return
  }

  const { data: current } = await admin.from('asamblea_grabacion').select('transcripcion_segmentos').eq('asamblea_id', asambleaId).single()
  const yaHechos = new Map<number, any>((current?.transcripcion_segmentos ?? []).map((s: any) => [s.seq, s]))
  const resultados = [...yaHechos.values()]

  const ordenados = [...segments].sort((a, b) => a.seq - b.seq)
  for (const seg of ordenados) {
    if (yaHechos.get(seg.seq)?.estado === 'ok') continue // reintento: no repetir lo ya OK

    try {
      const { data: blob, error: dlErr } = await admin.storage.from('asambleas-audio').download(seg.path)
      if (dlErr || !blob) throw new Error(dlErr?.message ?? 'no se pudo descargar el segmento')

      const form = new FormData()
      form.append('file', blob, `segment-${seg.seq}.webm`)
      form.append('model', 'gpt-4o-transcribe')
      form.append('language', 'es')

      const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      })
      if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`)
      const json = await resp.json()
      const existingIdx = resultados.findIndex((r) => r.seq === seg.seq)
      const entry = { seq: seg.seq, texto: json.text, estado: 'ok' }
      if (existingIdx >= 0) resultados[existingIdx] = entry
      else resultados.push(entry)
    } catch (e) {
      const existingIdx = resultados.findIndex((r) => r.seq === seg.seq)
      const entry = { seq: seg.seq, texto: null, estado: 'error', error: String(e) }
      if (existingIdx >= 0) resultados[existingIdx] = entry
      else resultados.push(entry)
    }
    await admin.from('asamblea_grabacion').update({ transcripcion_segmentos: resultados }).eq('asamblea_id', asambleaId)
  }

  const fallidos = resultados.filter((r) => r.estado !== 'ok')
  if (fallidos.length) {
    await admin
      .from('asamblea_grabacion')
      .update({ estado: 'error_transcripcion', error_detalle: `Fallaron segmentos: ${fallidos.map((f) => f.seq).join(', ')}` })
      .eq('asamblea_id', asambleaId)
    return
  }

  const textoCompleto = resultados.sort((a, b) => a.seq - b.seq).map((r) => r.texto).join('\n\n')
  await admin
    .from('asamblea_grabacion')
    .update({
      transcripcion_texto: textoCompleto,
      transcripcion_proveedor: 'openai:gpt-4o-transcribe',
      estado: 'transcrito',
      transcripcion_completada_at: new Date().toISOString(),
    })
    .eq('asamblea_id', asambleaId)
}
