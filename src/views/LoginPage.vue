<template>
  <div class="login-page">

    <!-- Panel izquierdo: branding -->
    <div class="brand-panel">
      <div class="brand-dots"></div>
      <div class="brand-glow"></div>

      <div class="brand-top">
        <RouterLink to="/" class="brand-logo">
          <img src="/logo-blanco.png" alt="CoopeSaaS" class="brand-logo-img" />
        </RouterLink>
      </div>

      <div class="brand-content">
        <div class="brand-hero">
          <h1 class="brand-headline">
            Gestión cooperativa<br>
            <em>inteligente</em>
          </h1>
          <p class="brand-tagline">
            Plataforma integral para la administración de cooperativas costarricenses.
          </p>
        </div>

        <ul class="brand-features">
          <li v-for="feat in features" :key="feat">
            <div class="feat-check">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span>{{ feat }}</span>
          </li>
        </ul>
      </div>

      <div class="brand-footer">
        <p>© 2026 CoopeSaaS · Sistema interno · Uso exclusivo para personal autorizado</p>
      </div>
    </div>

    <!-- Panel derecho: formulario -->
    <div class="form-panel">
      <div class="form-container" :class="{ 'is-visible': formVisible }">

        <div class="form-top">
          <RouterLink to="/" class="back-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Volver al inicio
          </RouterLink>
        </div>

        <div class="form-card">
          <div class="form-header">
            <h2 class="form-title">Iniciar sesión</h2>
            <p class="form-subtitle">Accede con tu cuenta cooperativa</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="field">
              <label for="email">Correo electrónico</label>
              <div class="input-wrap">
                <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="correo@cooperativa.com"
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="field">
              <div class="field-label-row">
                <label for="password">Contraseña</label>
                <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
              </div>
              <div class="input-wrap">
                <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div v-if="loginError" class="error-msg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ loginError }}
            </div>

            <button type="submit" class="btn-login" :disabled="loginLoading">
              <span v-if="loginLoading" class="spin"></span>
              <span v-else>Ingresar</span>
            </button>
          </form>

          <div class="security-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Acceso exclusivo para funcionarios autorizados
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { isSupabaseConfigured } from '../lib/supabase.js'

const router = useRouter()
const route  = useRoute()
const { loginWithEmail, setUser } = useAuth()

const email        = ref('')
const password     = ref('')
const showPassword = ref(false)
const formVisible  = ref(false)
const loginError   = ref('')
const loginLoading = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { formVisible.value = true })
})

async function handleLogin() {
  if (!email.value || !password.value) return
  loginError.value   = ''
  loginLoading.value = true

  try {
    if (isSupabaseConfigured()) {
      const { error } = await loginWithEmail(email.value, password.value)
      if (error) {
        loginError.value = 'Correo o contraseña incorrectos. Si aún no tienes acceso, solicita una demo.'
        return
      }
      const redirect = route.query.redirect || '/dashboard'
      router.push(redirect)
    } else {
      await new Promise(r => setTimeout(r, 600))
      setUser({
        email: email.value,
        name: email.value.split('@')[0],
        role: 'admin',
      })
      router.push('/dashboard')
    }
  } catch {
    loginError.value = 'No se pudo conectar. Verifica tu conexión e intenta de nuevo.'
  } finally {
    loginLoading.value = false
  }
}

const features = [
  'Gestión de personal y asociados',
  'Órganos sociales y comités',
  'Planificación de asambleas',
  'Reportes y estadísticas en tiempo real',
]
</script>

<style scoped>
/* ── Layout ─────────────────────────────── */
.login-page {
  display: grid;
  grid-template-columns: 55% 45%;
  min-height: 100svh;
}

/* ── Brand panel ────────────────────────── */
.brand-panel {
  position: relative;
  background: var(--navy);
  display: flex;
  flex-direction: column;
  padding: 44px 56px;
  overflow: hidden;
}

.brand-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1.5px, transparent 1.5px);
  background-size: 32px 32px;
  pointer-events: none;
}

.brand-glow {
  position: absolute;
  bottom: -180px;
  right: -120px;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,163,28,0.14) 0%, transparent 65%);
  pointer-events: none;
}

.brand-top {
  position: relative;
  z-index: 1;
  margin-bottom: auto;
}

.brand-logo {
  display: inline-block;
  text-decoration: none;
}

.brand-logo-img {
  height: 80px;
  width: auto;
  object-fit: contain;
}

.brand-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  padding: 40px 0;
}

.brand-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand-headline {
  font-family: var(--font-display);
  font-size: clamp(40px, 3.8vw, 54px);
  font-weight: 700;
  color: white;
  line-height: 1.1;
  letter-spacing: -1px;
}

.brand-headline em {
  font-style: italic;
  color: #E8A31C;
  font-weight: 600;
}

.brand-tagline {
  font-size: 16px;
  line-height: 1.65;
  color: rgba(255,255,255,0.6);
  max-width: 400px;
}

.brand-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: rgba(255,255,255,0.75);
}

.feat-check {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(26,145,82,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-footer {
  position: relative;
  z-index: 1;
  padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 12px;
  color: rgba(255,255,255,0.3);
}

/* ── Form panel ─────────────────────────── */
.form-panel {
  background: #F3F6FA;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.form-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  opacity: 0;
  transform: translateX(12px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.form-container.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Back link */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.15s ease;
  text-decoration: none;
}
.back-link:hover { color: var(--navy); }

/* Card */
.form-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: 0 4px 40px rgba(19,60,101,0.1), 0 1px 4px rgba(19,60,101,0.06);
  border: 1px solid rgba(19,60,101,0.05);
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--navy);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.form-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 12px;
  color: var(--navy-medium);
  font-weight: 500;
  transition: color 0.15s;
}
.forgot-link:hover { color: var(--navy); text-decoration: underline; }

/* Input */
.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  height: 48px;
  padding: 0 44px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-ui);
  color: var(--text);
  background: var(--off-white);
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  outline: none;
}

.input-wrap input::placeholder { color: var(--text-muted); }

.input-wrap input:focus {
  border-color: var(--navy);
  background: white;
  box-shadow: 0 0 0 3px rgba(19,60,101,0.1);
}

.eye-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.eye-btn:hover { color: var(--navy); }

/* Error */
.error-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #C0392B;
  background: rgba(192,57,43,0.07);
  border: 1px solid rgba(192,57,43,0.18);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  line-height: 1.5;
}

/* Submit button */
.btn-login {
  width: 100%;
  height: 50px;
  background: var(--navy);
  color: white;
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-ui);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.3px;
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) {
  background: var(--navy-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(19,60,101,0.28);
}

.btn-login:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Spinner */
.spin {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  display: block;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Security note */
.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 20px;
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Responsive ─────────────────────────── */
@media (max-width: 900px) {
  .login-page { grid-template-columns: 1fr; }
  .brand-panel { display: none; }
  .form-panel {
    min-height: 100svh;
    background: white;
    padding: 32px 20px;
    align-items: flex-start;
    padding-top: 64px;
  }
  .form-card {
    box-shadow: none;
    border: none;
    padding: 0;
  }
}
</style>
