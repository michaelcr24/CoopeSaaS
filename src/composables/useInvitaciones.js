import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const ESTADO_INVITACION_LABEL = {
  pendiente: { label: 'Pendiente', class: 'yellow' },
  aceptada: { label: 'Aceptada', class: 'green' },
  expirada: { label: 'Expirada', class: 'gray' },
  revocada: { label: 'Revocada', class: 'red' },
}

function generarCodigo() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

function mapInvitacionRow(row) {
  const estadoInfo = ESTADO_INVITACION_LABEL[row.estado] ?? { label: row.estado, class: 'gray' }
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name || '',
    role: row.role,
    codigo: row.codigo,
    estado: row.estado,
    status: estadoInfo.label,
    statusClass: estadoInfo.class,
    empleadoId: row.empleado_id,
    empleadoNombre: row.empleados?.nombre || null,
    createdAt: row.created_at,
    expiraAt: row.expira_at,
    aceptadaAt: row.aceptada_at,
  }
}

export function useInvitaciones() {
  async function crearInvitacion(cooperativaId, creadoPor, payload) {
    const codigo = generarCodigo()
    const { data, error } = await supabase
      .from('invitaciones_usuario')
      .insert({
        cooperativa_id: cooperativaId,
        empleado_id: payload.empleadoId || null,
        email: payload.email.trim().toLowerCase(),
        full_name: payload.fullName || null,
        role: payload.role || 'operador',
        codigo,
        creado_por: creadoPor,
      })
      .select()
      .single()
    return { data, error }
  }

  async function listInvitaciones(cooperativaId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('invitaciones_usuario')
      .select('*, empleados(nombre)')
      .eq('cooperativa_id', cooperativaId)
      .order('created_at', { ascending: false })
    if (error) return { data: null, error }
    return { data: data.map(mapInvitacionRow), error: null }
  }

  async function revocarInvitacion(id) {
    return supabase.from('invitaciones_usuario').update({ estado: 'revocada' }).eq('id', id).select().single()
  }

  async function listMiembrosCooperativa(cooperativaId) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    const { data, error } = await supabase
      .from('cooperativa_members')
      .select('id, role, is_active, joined_at, profiles(id, full_name, email)')
      .eq('cooperativa_id', cooperativaId)
      .order('joined_at')
    if (error) return { data: null, error }
    return {
      data: data.map((m) => ({
        id: m.id,
        profileId: m.profiles?.id,
        nombre: m.profiles?.full_name || m.profiles?.email || '—',
        email: m.profiles?.email || '',
        role: m.role,
        activo: m.is_active,
      })),
      error: null,
    }
  }

  // Consulta pública (vía función SECURITY DEFINER) para mostrar el detalle
  // de una invitación antes de que la persona inicie sesión.
  async function obtenerInvitacionPublica(codigo) {
    const { data, error } = await supabase.rpc('obtener_invitacion', { p_codigo: codigo })
    if (error) return { data: null, error }
    return { data: data?.[0] || null, error: null }
  }

  // Debe llamarse ya autenticado (después de signUp o de iniciar sesión):
  // valida la invitación contra el correo del usuario y realiza la
  // vinculación con la cooperativa (y el colaborador, si aplica).
  async function aceptarInvitacionRpc(codigo) {
    const { data, error } = await supabase.rpc('aceptar_invitacion', { p_codigo: codigo })
    if (error) return { data: null, error }
    return { data: data?.[0] || null, error: null }
  }

  return {
    crearInvitacion, listInvitaciones, revocarInvitacion, listMiembrosCooperativa,
    obtenerInvitacionPublica, aceptarInvitacionRpc,
  }
}
