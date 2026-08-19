<template>
  <div class="inv-page">
    <div class="inv-card">
      <img src="/logo.png" alt="CoopeSaaS" class="inv-logo" />

      <template v-if="cargando">
        <p class="inv-msg">Verificando invitación...</p>
      </template>

      <template v-else-if="!invitacion">
        <h2 class="inv-title">Invitación no válida</h2>
        <p class="inv-msg">Este enlace no existe o ya no está disponible. Solicita una nueva invitación a tu administrador.</p>
      </template>

      <template v-else-if="invitacion.estado === 'aceptada'">
        <h2 class="inv-title">Invitación ya utilizada</h2>
        <p class="inv-msg">Esta invitación ya fue aceptada. Si es tu cuenta, inicia sesión normalmente.</p>
        <RouterLink to="/login" class="btn-primary inv-btn">Ir a iniciar sesión</RouterLink>
      </template>

      <template v-else-if="invitacion.estado === 'revocada' || (invitacion.estado === 'pendiente' && new Date(invitacion.expira_at) < new Date())">
        <h2 class="inv-title">Invitación expirada</h2>
        <p class="inv-msg">Este enlace ya no está disponible. Pide a tu administrador que te envíe una invitación nueva.</p>
      </template>

      <template v-else-if="pasoConfirmar">
        <h2 class="inv-title">Revisa tu correo</h2>
        <p class="inv-msg">Te enviamos un enlace de confirmación a <strong>{{ invitacion.email }}</strong>. Ábrelo y luego inicia sesión — completaremos tu registro automáticamente.</p>
        <RouterLink to="/login" class="btn-primary inv-btn">Ir a iniciar sesión</RouterLink>
      </template>

      <template v-else>
        <h2 class="inv-title">Únete a {{ invitacion.cooperativa_nombre }}</h2>
        <p class="inv-msg">Te invitaron como <strong>{{ ROLE_LABEL[invitacion.role] || invitacion.role }}</strong>. Crea tu contraseña para continuar.</p>

        <form class="inv-form" @submit.prevent="aceptar">
          <div class="form-field">
            <label>Correo</label>
            <input :value="invitacion.email" type="email" disabled />
          </div>
          <div class="form-field">
            <label>Nombre completo <span class="req">*</span></label>
            <input v-model="fullName" type="text" required />
          </div>
          <div class="form-field">
            <label>Contraseña <span class="req">*</span></label>
            <input v-model="password" type="password" minlength="6" required placeholder="Mínimo 6 caracteres" />
          </div>
          <div v-if="error" class="req" style="font-size:12.5px;">{{ error }}</div>
          <button type="submit" class="btn-primary inv-btn" :disabled="enviando">{{ enviando ? 'Creando cuenta...' : 'Crear cuenta y unirme' }}</button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { useInvitaciones } from '../composables/useInvitaciones.js'

const ROLE_LABEL = { admin: 'Administrador', consejo: 'Consejo', operador: 'Operador', asociado: 'Asociado', guest: 'Invitado' }

const route = useRoute()
const router = useRouter()
const { obtenerInvitacionPublica, aceptarInvitacionRpc } = useInvitaciones()

const cargando = ref(true)
const invitacion = ref(null)
const fullName = ref('')
const password = ref('')
const enviando = ref(false)
const error = ref(null)
const pasoConfirmar = ref(false)

onMounted(async () => {
  const codigo = route.params.codigo
  if (!isSupabaseConfigured() || !codigo) { cargando.value = false; return }
  const { data } = await obtenerInvitacionPublica(codigo)
  invitacion.value = data
  if (data?.full_name) fullName.value = data.full_name
  cargando.value = false
})

async function aceptar() {
  error.value = null
  if (!fullName.value.trim() || password.value.length < 6) { error.value = 'Completa tu nombre y una contraseña de al menos 6 caracteres.'; return }

  enviando.value = true
  const codigo = route.params.codigo
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: invitacion.value.email,
    password: password.value,
    options: { data: { full_name: fullName.value.trim() } },
  })
  if (signUpError) {
    enviando.value = false
    error.value = signUpError.message
    return
  }

  if (!data.session) {
    // Requiere confirmación por correo: guardamos el código para
    // completar la vinculación automáticamente cuando inicie sesión.
    localStorage.setItem('coopesaas-pending-invite', codigo)
    enviando.value = false
    pasoConfirmar.value = true
    return
  }

  const { error: aceptarError } = await aceptarInvitacionRpc(codigo)
  enviando.value = false
  if (aceptarError) { error.value = aceptarError.message; return }
  router.push('/dashboard')
}
</script>

<style scoped>
.inv-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #F0F4F8; padding: 20px;
}
.dark .inv-page { background: #0F1729; }

.inv-card {
  background: white; border-radius: 16px; padding: 36px 32px; max-width: 400px; width: 100%;
  box-shadow: 0 10px 40px rgba(19,60,101,0.12); text-align: center;
}
.dark .inv-card { background: #1D293D; }

.inv-logo { width: 48px; height: 48px; margin: 0 auto 18px; display: block; object-fit: contain; }

.inv-title { font-size: 18px; font-weight: 700; color: #133C65; margin-bottom: 8px; }
.dark .inv-title { color: #E2E8F0; }

.inv-msg { font-size: 13.5px; color: #4A6070; line-height: 1.5; margin-bottom: 18px; }
.dark .inv-msg { color: #94A3B8; }

.inv-form { display: flex; flex-direction: column; gap: 14px; text-align: left; }
.inv-form .form-field label { font-size: 12.5px; font-weight: 600; color: #4A6070; display: block; margin-bottom: 5px; }
.dark .inv-form .form-field label { color: #94A3B8; }
.inv-form input {
  width: 100%; height: 38px; padding: 0 12px; border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: #F8FAFC; color: #1A2B3C; outline: none;
}
.dark .inv-form input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.inv-form input:focus { border-color: #133C65; background: white; }
.inv-form input:disabled { opacity: 0.6; }

.req { color: #C0392B; }

.inv-btn { width: 100%; justify-content: center; margin-top: 6px; text-decoration: none; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 600;
  color: white; background: #133C65; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #0D2A47; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
