import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

export const ROLES = [
  { key: 'admin', name: 'Administrador', color: '#133C65', desc: 'Acceso total al sistema y a la configuración.' },
  { key: 'consejo', name: 'Consejo', color: '#7B3FA0', desc: 'Miembro del consejo de administración.' },
  { key: 'operador', name: 'Operador', color: '#C47F0C', desc: 'Personal de planta de la cooperativa.' },
  { key: 'asociado', name: 'Asociado', color: '#1A6B42', desc: 'Socio de la cooperativa.' },
  { key: 'guest', name: 'Invitado', color: '#5A7490', desc: 'Solo lectura limitada.' },
]

export const MODULES = [
  { key: 'personal', name: 'Personal' },
  { key: 'asociados', name: 'Asociados' },
  { key: 'organos', name: 'Órganos Sociales' },
  { key: 'comites', name: 'Comités' },
  { key: 'asambleas', name: 'Asambleas' },
  { key: 'votaciones', name: 'Votaciones' },
  { key: 'finanzas', name: 'Finanzas' },
  { key: 'creditos', name: 'Créditos' },
  { key: 'riesgos', name: 'Riesgos' },
  { key: 'reportes', name: 'Reportes' },
  { key: 'configuracion', name: 'Configuración' },
]

const _moduleCache = new Map() // role -> Set(moduleKeys con can_read)

export async function getEnabledModules(role) {
  if (!role) return new Set()
  if (_moduleCache.has(role)) return _moduleCache.get(role)
  if (!isSupabaseConfigured()) return new Set()
  const { data, error } = await supabase.from('role_permissions').select('module').eq('role', role).eq('can_read', true)
  // Si la consulta falló (red intermitente, típico en móvil), no cachear un
  // Set vacío: dejaría los módulos vacíos para el resto de la sesión aunque
  // la red se recupere. Se reintenta en la próxima llamada.
  if (error) return new Set()
  const set = new Set((data || []).map((r) => r.module))
  _moduleCache.set(role, set)
  return set
}

export function invalidateModuleCache(role) {
  _moduleCache.delete(role)
}

export function useRolePermissions() {
  async function listForRole(role) {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('role_permissions').select('module, can_create, can_read, can_update, can_delete').eq('role', role)
  }

  async function listAll() {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    return supabase.from('role_permissions').select('role, module, can_create, can_read, can_update, can_delete')
  }

  async function countMembersByRole() {
    if (!isSupabaseConfigured()) return {}
    const { data, error } = await supabase.from('cooperativa_members').select('role').eq('is_active', true)
    if (error || !data) return {}
    return data.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc }, {})
  }

  async function setModuleAccess(role, moduleKey, enabled) {
    return supabase
      .from('role_permissions')
      .upsert(
        { role, module: moduleKey, can_create: enabled, can_read: enabled, can_update: enabled, can_delete: enabled },
        { onConflict: 'role,module' },
      )
  }

  return { ROLES, MODULES, listForRole, listAll, countMembersByRole, setModuleAccess }
}
