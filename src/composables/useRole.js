import { ref, computed } from 'vue'

// Selector de rol 100% local/demo (localStorage) para alternar la UI en modo
// demo. No es una fuente de autorización real: la seguridad efectiva vive en
// las policies RLS de Supabase (user_role(), is_admin_or_consejo()).

const ROLES = {
  admin: {
    name: 'Administrador',
    user: 'Jeudy Paniagua',
    initials: 'JP',
    email: 'jpaniagua@cne.go.cr',
    color: '#133C65',
    avatarBg: '#133C65',
  },
  operador: {
    name: 'Operador',
    user: 'Ana Vargas',
    initials: 'AV',
    email: 'avargas@coopesaas.cr',
    color: '#C47F0C',
    avatarBg: '#7B3FA0',
  },
  asociado: {
    name: 'Asociado',
    user: 'Juan Pérez Mora',
    initials: 'JPM',
    email: 'jperez.mora@gmail.com',
    color: '#1A9152',
    avatarBg: '#1A9152',
  },
  consejo: {
    name: 'Consejo',
    user: 'Roberto Méndez',
    initials: 'RM',
    email: 'rmendez@coopesaas.cr',
    color: '#7B3FA0',
    avatarBg: '#7B3FA0',
  },
}

const _role = ref(localStorage.getItem('coopesaas-role') || 'admin')

export function useRole() {
  const isAdmin    = computed(() => _role.value === 'admin')
  const isOperador = computed(() => _role.value === 'operador')
  const isAsociado = computed(() => _role.value === 'asociado')
  const isConsejo  = computed(() => _role.value === 'consejo')
  const roleInfo   = computed(() => ROLES[_role.value])

  function setRole(role) {
    _role.value = role
    localStorage.setItem('coopesaas-role', role)
  }

  return { currentRole: _role, isAdmin, isOperador, isAsociado, isConsejo, roleInfo, setRole, ROLES }
}
