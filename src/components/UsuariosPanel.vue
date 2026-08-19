<template>
  <div class="usr-layout">
    <div class="usr-col">
      <div class="catalog-card">
        <h3 class="catalog-title">Miembros actuales</h3>
        <ul class="catalog-list">
          <li v-if="!loadingMiembros && !miembros.length" class="catalog-empty">Sin miembros todavía</li>
          <li v-for="m in miembros" :key="m.id" class="usr-item">
            <div>
              <strong>{{ m.nombre }}</strong>
              <div class="usr-item-sub">{{ m.email }}</div>
            </div>
            <span class="badge" :class="m.activo ? 'badge--blue' : 'badge--gray'">{{ ROLE_LABEL[m.role] || m.role }}</span>
          </li>
        </ul>
      </div>

      <div class="catalog-card">
        <h3 class="catalog-title">Invitar nuevo usuario</h3>
        <form class="usr-form" @submit.prevent="enviarInvitacion">
          <div class="form-field">
            <label>Correo <span class="req">*</span></label>
            <input v-model="form.email" type="email" required placeholder="persona@correo.com" />
          </div>
          <div class="form-field">
            <label>Nombre (opcional)</label>
            <input v-model="form.fullName" type="text" placeholder="Se completa al aceptar si se deja vacío" />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Rol</label>
              <select v-model="form.role">
                <option v-for="r in ROLES" :key="r.key" :value="r.key">{{ r.name }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>Vincular a colaborador (opcional)</label>
              <select v-model="form.empleadoId">
                <option value="">Ninguno</option>
                <option v-for="e in empleadosSinUsuario" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>
          </div>
          <div v-if="error" class="req" style="font-size:12.5px;">{{ error }}</div>
          <button type="submit" class="catalog-add-btn catalog-add-btn--wide" :disabled="enviando">
            {{ enviando ? 'Generando...' : 'Generar invitación' }}
          </button>
        </form>

        <div v-if="ultimoEnlace" class="usr-link-box">
          <p>Comparte este enlace con la persona invitada (válido por 7 días):</p>
          <div class="usr-link-row">
            <input :value="ultimoEnlace" readonly @click="$event.target.select()" />
            <button type="button" class="action-btn" title="Copiar" @click="copiarEnlace(ultimoEnlace)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="usr-col">
      <div class="catalog-card">
        <h3 class="catalog-title">Invitaciones</h3>
        <ul class="catalog-list">
          <li v-if="!loadingInvitaciones && !invitaciones.length" class="catalog-empty">Sin invitaciones todavía</li>
          <li v-for="inv in invitaciones" :key="inv.id" class="usr-item">
            <div>
              <strong>{{ inv.email }}</strong>
              <div class="usr-item-sub">
                {{ ROLE_LABEL[inv.role] || inv.role }}<span v-if="inv.empleadoNombre"> · {{ inv.empleadoNombre }}</span>
              </div>
            </div>
            <div class="usr-item-actions">
              <span class="badge" :class="`badge--${inv.statusClass}`">{{ inv.status }}</span>
              <button v-if="inv.estado === 'pendiente'" type="button" class="action-btn" title="Copiar enlace" @click="copiarEnlace(enlaceDe(inv.codigo))">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button v-if="inv.estado === 'pendiente'" type="button" class="action-btn action-btn--red" title="Revocar" @click="revocar(inv)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useInvitaciones } from '../composables/useInvitaciones.js'
import { usePersonal } from '../composables/usePersonal.js'
import { ROLES } from '../composables/useRolePermissions.js'

const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.key, r.name]))

const { cooperativaId, currentUser } = useAuth()
const { crearInvitacion, listInvitaciones, revocarInvitacion, listMiembrosCooperativa } = useInvitaciones()
const { listEmpleados } = usePersonal()

const miembros = ref([])
const loadingMiembros = ref(true)
const invitaciones = ref([])
const loadingInvitaciones = ref(true)
const empleados = ref([])

const empleadosSinUsuario = computed(() => empleados.value.filter((e) => !e.profileId))

const form = ref({ email: '', fullName: '', role: 'operador', empleadoId: '' })
const enviando = ref(false)
const error = ref(null)
const ultimoEnlace = ref('')

function enlaceDe(codigo) {
  return `${window.location.origin}/invitacion/${codigo}`
}

async function copiarEnlace(enlace) {
  try { await navigator.clipboard.writeText(enlace) } catch { /* portapapeles no disponible */ }
}

async function cargarMiembros() {
  loadingMiembros.value = true
  const { data } = await listMiembrosCooperativa(cooperativaId.value)
  miembros.value = data || []
  loadingMiembros.value = false
}

async function cargarInvitaciones() {
  loadingInvitaciones.value = true
  const { data } = await listInvitaciones(cooperativaId.value)
  invitaciones.value = data || []
  loadingInvitaciones.value = false
}

async function cargarEmpleados() {
  const { data } = await listEmpleados()
  empleados.value = data || []
}

async function enviarInvitacion() {
  error.value = null
  if (!form.value.email.trim()) return
  enviando.value = true
  const { data, error: err } = await crearInvitacion(cooperativaId.value, currentUser.value?.id, form.value)
  enviando.value = false
  if (err) { error.value = err.message; return }
  ultimoEnlace.value = enlaceDe(data.codigo)
  form.value = { email: '', fullName: '', role: 'operador', empleadoId: '' }
  await cargarInvitaciones()
}

async function revocar(inv) {
  if (!confirm(`¿Revocar la invitación de ${inv.email}?`)) return
  await revocarInvitacion(inv.id)
  await cargarInvitaciones()
}

onMounted(() => { cargarMiembros(); cargarInvitaciones(); cargarEmpleados() })
</script>

<style scoped>
.usr-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
@media (max-width: 900px) { .usr-layout { grid-template-columns: 1fr; } }
.usr-col { display: flex; flex-direction: column; gap: 16px; }

.catalog-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .catalog-card { background: #1D293D; border-color: #3D5069; }
.catalog-title { font-size: 13.5px; font-weight: 700; color: #133C65; }
.dark .catalog-title { color: #E2E8F0; }

.catalog-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; max-height: 320px; overflow-y: auto; }
.catalog-empty { font-size: 12px; color: #7A90A0; padding: 6px 2px; }

.usr-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 8px 4px; border-bottom: 1px solid #F0F4F8; font-size: 13px; color: #1A2B3C;
}
.dark .usr-item { border-color: #2A3B57; color: #E2E8F0; }
.usr-item:last-child { border-bottom: none; }
.usr-item-sub { font-size: 11.5px; color: #7A90A0; margin-top: 2px; }
.usr-item-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.usr-form { display: flex; flex-direction: column; gap: 12px; }
.usr-form .form-field label { font-size: 12px; font-weight: 600; color: #4A6070; display: block; margin-bottom: 4px; }
.dark .usr-form .form-field label { color: #94A3B8; }
.usr-form input, .usr-form select {
  width: 100%; height: 36px; padding: 0 10px; border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13px; font-family: inherit; background: #F8FAFC; color: #1A2B3C; outline: none;
}
.dark .usr-form input, .dark .usr-form select { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.usr-form input:focus, .usr-form select:focus { border-color: #133C65; background: white; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.catalog-add-btn--wide {
  width: 100%; height: 36px; border-radius: 7px; border: none;
  background: #133C65; color: white; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.catalog-add-btn--wide:hover:not(:disabled) { background: #0D2A47; }
.catalog-add-btn--wide:disabled { opacity: 0.5; cursor: not-allowed; }

.usr-link-box { margin-top: 4px; padding: 10px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E8EEF4; }
.dark .usr-link-box { background: #162033; border-color: #3D5069; }
.usr-link-box p { font-size: 11.5px; color: #4A6070; margin: 0 0 6px; }
.dark .usr-link-box p { color: #94A3B8; }
.usr-link-row { display: flex; gap: 6px; }
.usr-link-row input {
  flex: 1; height: 32px; padding: 0 8px; border: 1px solid #D4E4F4; border-radius: 6px;
  font-size: 11.5px; background: white; color: #1A2B3C;
}
.dark .usr-link-row input { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }

.req { color: #C0392B; }

.badge {
  display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 12px;
  font-size: 11px; font-weight: 700; white-space: nowrap;
}
.badge--yellow { background: rgba(196,127,12,0.12); color: #8A5800; }
.badge--green  { background: rgba(26,145,82,0.12); color: #1A6B42; }
.badge--red    { background: rgba(192,57,43,0.12); color: #C0392B; }
.badge--gray   { background: rgba(112,113,115,0.12); color: #606060; }
.badge--blue   { background: rgba(19,60,101,0.1); color: #133C65; }
.dark .badge--yellow { background: rgba(251,191,36,0.18); color: #FBBF24; }
.dark .badge--green  { background: rgba(74,222,128,0.15); color: #4ADE80; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }
.dark .badge--gray   { background: rgba(148,163,184,0.18); color: #94A3B8; }
.dark .badge--blue   { background: rgba(96,165,250,0.18); color: #60A5FA; }

.action-btn {
  width: 26px; height: 26px; border-radius: 6px; border: none; background: none;
  color: #7A90A0; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}
.action-btn:hover { color: #133C65; background: #EBF3FF; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { color: #93B8D8; background: rgba(147,184,216,0.12); }
.action-btn--red:hover { color: #C0392B; background: rgba(192,57,43,0.1); }
</style>
