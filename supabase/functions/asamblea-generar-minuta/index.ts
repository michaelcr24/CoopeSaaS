// Genera un borrador de minuta (acta) a partir de la transcripcion completa
// de la asamblea + el contexto estructurado ya registrado en el sistema
// (asistentes, puestos, postulaciones en terna, resultados de votacion).
// Responde 202 de inmediato y procesa en background (mismo patron que
// asamblea-transcribir), porque la transcripcion completa puede ser larga.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Eres un asistente experto en redaccion de actas de asamblea de cooperativas costarricenses, familiarizado con la Ley N.º 4179 de Asociaciones Cooperativas.

Se te entrega el CONTEXTO estructurado de una asamblea (ya registrado en el sistema) y la TRANSCRIPCION completa del audio de la sesion. Redacta un borrador de acta con esta estructura obligatoria:

1. Encabezado (nombre de la asamblea, tipo, fecha, lugar, modalidad, numero de acta)
2. Verificacion de quorum (asistentes vs. quorum requerido)
3. Desarrollo de la sesion, basado UNICAMENTE en lo que dice la transcripcion — no inventes datos ni completes vacios con suposiciones
4. Resultados de elecciones, si los hay en el contexto
5. Acuerdos adoptados, numerados como "SE ACUERDA: ..."
6. Cierre (hora de finalizacion)

Reglas:
- Es un BORRADOR sujeto a revision y edicion humana antes de ser el acta oficial. Indicalo al inicio.
- Si algo en la transcripcion es ambiguo o inaudible, marcalo como [VERIFICAR: ...] en vez de inventar.
- Redacta en espanol formal, tercera persona, tiempo pasado.
- No agregues comentarios tuyos fuera del texto del acta.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let asamblea_id: string
  try {
    ;({ asamblea_id } = await req.json())
    if (!asamblea_id) throw new Error('asamblea_id requerido')
  } catch {
    return new Response(JSON.stringify({ error: 'asamblea_id requerido' }), { status: 400, headers: corsHeaders })
  }

  const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } },
  })
  const { data: grab, error: authErr } = await authClient
    .from('asamblea_grabacion')
    .select('id, transcripcion_texto, estado')
    .eq('asamblea_id', asamblea_id)
    .single()
  if (authErr || !grab) {
    return new Response(JSON.stringify({ error: 'No autorizado o no existe grabacion para esta asamblea' }), { status: 403, headers: corsHeaders })
  }
  if (!grab.transcripcion_texto) {
    return new Response(JSON.stringify({ error: 'La asamblea aun no tiene una transcripcion lista' }), { status: 400, headers: corsHeaders })
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  await admin
    .from('asamblea_grabacion')
    .update({ estado: 'generando_minuta', error_detalle: null })
    .eq('asamblea_id', asamblea_id)

  // @ts-expect-error EdgeRuntime es un global del runtime de Supabase Edge Functions, no esta en los tipos estandar de Deno
  EdgeRuntime.waitUntil(procesarMinuta(admin, asamblea_id, grab.transcripcion_texto))

  return new Response(JSON.stringify({ status: 'iniciado' }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})

async function construirContexto(admin: ReturnType<typeof createClient>, asambleaId: string) {
  const { data: asamblea } = await admin
    .from('asambleas')
    .select(`
      nombre, tipo, fecha, hora, lugar, modalidad, quorum_requerido, numero_acta,
      hora_inicio_real, hora_cierre_real, acuerdos,
      asamblea_invitados(asistio),
      asamblea_puestos(organo_nombre, tipo, cantidad,
        asamblea_postulaciones(en_terna, asociados(nombre))),
      votaciones(titulo, tipo, estado, votacion_opciones(texto, votos, es_abstencion))
    `)
    .eq('id', asambleaId)
    .single()

  if (!asamblea) return {}
  const asistentes = (asamblea.asamblea_invitados ?? []).filter((i: any) => i.asistio).length

  return {
    nombre: asamblea.nombre,
    tipo: asamblea.tipo,
    fecha: asamblea.fecha,
    hora_programada: asamblea.hora,
    lugar: asamblea.lugar,
    modalidad: asamblea.modalidad,
    quorum_requerido: asamblea.quorum_requerido,
    numero_acta: asamblea.numero_acta,
    hora_inicio_real: asamblea.hora_inicio_real,
    hora_cierre_real: asamblea.hora_cierre_real,
    asistentes,
    acuerdos_ya_registrados: asamblea.acuerdos,
    puestos_en_eleccion: (asamblea.asamblea_puestos ?? []).map((p: any) => ({
      organo: p.organo_nombre,
      tipo: p.tipo,
      cantidad: p.cantidad,
      candidatos_en_terna: (p.asamblea_postulaciones ?? []).filter((c: any) => c.en_terna).map((c: any) => c.asociados?.nombre),
    })),
    resultados_votaciones: (asamblea.votaciones ?? []).map((v: any) => ({
      titulo: v.titulo,
      tipo: v.tipo,
      estado: v.estado,
      opciones: (v.votacion_opciones ?? []).filter((o: any) => !o.es_abstencion).map((o: any) => ({ texto: o.texto, votos: o.votos })),
    })),
  }
}

async function procesarMinuta(admin: ReturnType<typeof createClient>, asambleaId: string, transcripcion: string) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    await admin.from('asamblea_grabacion').update({ estado: 'error_minuta', error_detalle: 'ANTHROPIC_API_KEY no configurada' }).eq('asamblea_id', asambleaId)
    return
  }

  try {
    const contexto = await construirContexto(admin, asambleaId)
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 8000,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [
          { role: 'user', content: `CONTEXTO:\n${JSON.stringify(contexto, null, 2)}\n\nTRANSCRIPCION:\n${transcripcion}` },
        ],
      }),
    })
    if (!resp.ok) throw new Error(`Anthropic ${resp.status}: ${await resp.text()}`)
    const data = await resp.json()
    if (data.stop_reason === 'refusal') throw new Error('El modelo rechazo la solicitud')
    const texto = data.content?.find((b: any) => b.type === 'text')?.text ?? ''
    if (!texto) throw new Error('Respuesta vacia del modelo')

    await admin
      .from('asamblea_grabacion')
      .update({
        minuta_borrador: texto,
        minuta_proveedor: 'anthropic:claude-sonnet-5',
        estado: 'minuta_lista',
        minuta_generada_at: new Date().toISOString(),
      })
      .eq('asamblea_id', asambleaId)
  } catch (e) {
    await admin.from('asamblea_grabacion').update({ estado: 'error_minuta', error_detalle: String(e) }).eq('asamblea_id', asambleaId)
  }
}
