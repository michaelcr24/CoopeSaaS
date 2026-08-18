import { ref, computed, onMounted } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const _user = ref(null)
const _session = ref(null)
const _loading = ref(true)
const _initialized = ref(false)

async function initializeAuth() {
  if (_initialized.value) return
  _initialized.value = true

  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('coopesaas-user')
    if (saved) {
      try { _user.value = JSON.parse(saved) } catch { /* ignore */ }
    }
    _loading.value = false
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  _session.value = session
  _user.value = await withProfile(session?.user ?? null)

  supabase.auth.onAuthStateChange(async (_event, session) => {
    _session.value = session
    _user.value = await withProfile(session?.user ?? null)
  })

  _loading.value = false
}

async function withProfile(user) {
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, cooperativa_members(cooperativa_id, cooperativas(nombre))')
    .eq('id', user.id)
    .maybeSingle()
  return { ...user, profile }
}

export function useAuth() {
  if (!_initialized.value) {
    initializeAuth()
  }

  async function loginWithEmail(email, password) {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase no está configurado. Configure las variables de entorno.' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }

    _user.value = await withProfile(data.user)

    return { error: null, data }
  }

  async function register(email, password, fullName) {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase no está configurado.' } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { data, error }
  }

  function setUser(data) {
    if (isSupabaseConfigured()) {
      console.warn('[CoopeSaaS] setUser no debería usarse con Supabase Auth. Use loginWithEmail().')
      return
    }
    _user.value = data
    localStorage.setItem('coopesaas-user', JSON.stringify(data))
  }

  async function clearUser() {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut()
    }
    _user.value = null
    _session.value = null
    localStorage.removeItem('coopesaas-user')
  }

  const fullName = computed(() => {
    if (!_user.value) return 'Usuario'
    const p = _user.value.profile || _user.value
    return p.full_name || p.name || p.nombre || _user.value.email?.split('@')[0] || 'Usuario'
  })

  const firstName = computed(() => fullName.value.split(' ')[0])

  const userEmail = computed(() => _user.value?.email || '')

  const cooperativaId = computed(() => _user.value?.profile?.cooperativa_members?.[0]?.cooperativa_id ?? null)
  const cooperativaNombre = computed(() => _user.value?.profile?.cooperativa_members?.[0]?.cooperativas?.nombre ?? null)

  const initials = computed(() => {
    const parts = fullName.value.split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0]?.slice(0, 2).toUpperCase() || 'U'
  })

  return {
    currentUser: _user,
    session: _session,
    loading: _loading,
    fullName,
    firstName,
    userEmail,
    cooperativaId,
    cooperativaNombre,
    initials,
    setUser,
    clearUser,
    loginWithEmail,
    register,
  }
}
