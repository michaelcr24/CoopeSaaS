<template>
  <div class="app-shell" :class="{ dark: isDark }">

    <!-- ─── SIDEBAR ─── -->
    <aside class="sidebar" :class="{ 'sidebar--open': mobileOpen, 'sidebar--collapsed': sidebarCollapsed }">

      <!-- Brand -->
      <div class="sidebar-brand">
        <RouterLink to="/dashboard" class="brand-link">
          <img src="/icono-blanco.png" alt="" class="brand-icon" />
          <span class="brand-name">CoopeSaaS</span>
        </RouterLink>
        <button class="sidebar-toggle" @click="toggleSidebar" title="Contraer menú">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">

        <RouterLink to="/dashboard" class="nav-item" :class="{ 'nav-item--active': isExact('/dashboard') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </span>
          <span class="nav-label">Inicio</span>
        </RouterLink>

        <div class="nav-section-label">Módulos</div>

        <RouterLink v-if="canSeeModule('personal')" to="/dashboard/personal" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/personal') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="nav-label">Personal</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('asociados')" to="/dashboard/asociados" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/asociados') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span class="nav-label">Asociados</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('organos')" to="/dashboard/organos" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/organos') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="nav-label">Órganos Sociales</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('comites')" to="/dashboard/comites" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/comites') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </span>
          <span class="nav-label">Comités</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('asambleas')" to="/dashboard/asambleas" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/asambleas') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          <span class="nav-label">Asambleas</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('votaciones')" to="/dashboard/votaciones" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/votaciones') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </span>
          <span class="nav-label">Votaciones</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('finanzas')" to="/dashboard/finanzas" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/finanzas') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </span>
          <span class="nav-label">Finanzas</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('creditos')" to="/dashboard/creditos" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/creditos') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </span>
          <span class="nav-label">Créditos</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('riesgos')" to="/dashboard/riesgos" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/riesgos') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <span class="nav-label">Riesgos</span>
        </RouterLink>

        <RouterLink v-if="canSeeModule('reportes')" to="/dashboard/reportes" class="nav-item" :class="{ 'nav-item--active': isActive('/dashboard/reportes') }">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </span>
          <span class="nav-label">Reportes</span>
        </RouterLink>

        <template v-if="canSeeModule('configuracion')">
        <div class="nav-section-label">Sistema</div>

        <!-- Configuración (expandable) -->
        <div
          class="nav-item nav-item--expandable"
          :class="{ 'nav-item--active': isActive('/dashboard/configuracion') }"
          @click="toggleConfig"
        >
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          <span class="nav-label">Configuración</span>
          <svg class="nav-chevron" :class="{ 'nav-chevron--open': configOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <Transition name="subnav">
          <div v-if="configOpen" class="nav-sub">
            <RouterLink to="/dashboard/configuracion" class="nav-sub-item" :class="{ 'nav-sub-item--active': isExact('/dashboard/configuracion') }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              General
            </RouterLink>
            <RouterLink to="/dashboard/configuracion/roles" class="nav-sub-item" :class="{ 'nav-sub-item--active': isActive('/dashboard/configuracion/roles') }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Roles
            </RouterLink>
          </div>
        </Transition>
        </template>

      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">

        <!-- Dark mode toggle -->
        <div class="mode-row">
          <span class="mode-label">
            <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            {{ isDark ? 'Modo oscuro' : 'Modo claro' }}
          </span>
          <button class="toggle-switch" :class="{ 'toggle-switch--on': isDark }" @click="toggleDark" title="Cambiar modo">
            <span class="toggle-thumb"></span>
          </button>
        </div>

        <!-- User card -->
        <div class="user-card">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-details">
            <span class="user-name">{{ fullName }}</span>
            <span class="user-email">{{ userEmail }}</span>
          </div>
          <button class="logout-btn" title="Cerrar sesión" @click="logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

      </div>
    </aside>

    <!-- ─── MAIN AREA ─── -->
    <div class="main-area" :class="{ 'main-area--collapsed': sidebarCollapsed }">

      <!-- Mobile topbar -->
      <div class="mobile-header">
        <button class="mobile-menu-btn" @click="mobileOpen = !mobileOpen">
          <svg v-if="!mobileOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <RouterLink to="/dashboard" class="mobile-brand">
          <img src="/icono.png" alt="CoopeSaaS" class="mobile-brand-icon" />
          <span><strong>Coope</strong>SaaS</span>
        </RouterLink>
      </div>

      <!-- Page content -->
      <main class="page-content">
        <RouterView />
      </main>

    </div>

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false"></div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { getEnabledModules } from '../composables/useRolePermissions.js'

const route = useRoute()
const router = useRouter()

const { fullName, userEmail, initials, clearUser, currentUser } = useAuth()

const isDark = ref(false)
const mobileOpen = ref(false)
const configOpen = ref(false)
const sidebarCollapsed = ref(false)
const enabledModules = ref(new Set())

function canSeeModule(key) {
  return enabledModules.value.has(key)
}

watch(
  () => currentUser.value?.profile?.role,
  async (role) => {
    enabledModules.value = role ? await getEnabledModules(role) : new Set()
  },
  { immediate: true },
)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('coopesaas-sidebar', sidebarCollapsed.value ? '1' : '0')
}

function isActive(path) {
  return route.path.startsWith(path)
}

function isExact(path) {
  return route.path === path
}

function toggleConfig() {
  if (!configOpen.value) {
    configOpen.value = true
  } else if (!isActive('/dashboard/configuracion')) {
    configOpen.value = false
  }
  if (!isActive('/dashboard/configuracion')) {
    router.push('/dashboard/configuracion')
  }
}

watch(() => route.path, (path) => {
  if (path.startsWith('/dashboard/configuracion')) {
    configOpen.value = true
  }
  mobileOpen.value = false
}, { immediate: true })


function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('coopesaas-dark', isDark.value ? '1' : '0')
}

function logout() {
  clearUser()
  router.push('/login')
}

onMounted(() => {
  const saved = localStorage.getItem('coopesaas-dark')
  if (saved === '1') { isDark.value = true; document.documentElement.classList.add('dark') }
  const savedSidebar = localStorage.getItem('coopesaas-sidebar')
  if (savedSidebar === '1') sidebarCollapsed.value = true
})

onUnmounted(() => {
  document.documentElement.classList.remove('dark')
})
</script>

<style scoped>
/* ── Shell layout ───────────────────────── */
.app-shell {
  display: flex;
  min-height: 100svh;
  background: var(--surface, #F4F6F8);
}

/* ── Sidebar ────────────────────────────── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #133C65;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  transition: transform 0.25s ease, width 0.25s ease;
  overflow: hidden;
}

/* ── Brand ──────────────────────────────── */
.sidebar-brand {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  min-width: 0;
  flex: 1;
}

.sidebar-toggle {
  width: 30px; height: 30px;
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.sidebar-toggle:hover { background: rgba(255,255,255,0.2); color: white; }

.brand-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.2px;
}

/* ── Nav ────────────────────────────────── */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,0.3);
  padding: 12px 10px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  user-select: none;
}

.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.9);
}

.nav-item--active {
  background: rgba(255,255,255,0.15) !important;
  color: white !important;
}

.nav-item--expandable {
  cursor: pointer;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  line-height: 1.3;
}

.nav-chevron {
  flex-shrink: 0;
  color: rgba(255,255,255,0.4);
  transition: transform 0.2s ease;
}

.nav-chevron--open {
  transform: rotate(180deg);
}

/* Sub nav */
.nav-sub {
  overflow: hidden;
  margin: 0 0 2px 30px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-sub-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-sub-item:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.85);
}

.nav-sub-item--active {
  background: rgba(255,255,255,0.12);
  color: white;
}

/* Sub nav transition */
.subnav-enter-active,
.subnav-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  max-height: 120px;
}

.subnav-enter-from,
.subnav-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Sidebar footer ─────────────────────── */
.sidebar-footer {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

/* Dark mode toggle row */
.mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
}

.mode-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
}

.toggle-switch {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: rgba(255,255,255,0.2);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.toggle-switch--on {
  background: #E8A31C;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s ease;
  display: block;
}

.toggle-switch--on .toggle-thumb {
  transform: translateX(16px);
}

/* User card */
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #E8A31C;
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(211,47,47,0.25);
  color: #FF8080;
}

/* ── Sidebar collapsed (desktop) ────────── */
.sidebar--collapsed { width: 64px; }
.sidebar--collapsed .brand-name { display: none; }
.sidebar--collapsed .sidebar-toggle { margin: 0 auto; }
.sidebar--collapsed .brand-link { flex: 0; }
.sidebar--collapsed .nav-label { display: none; }
.sidebar--collapsed .nav-section-label { display: none; }
.sidebar--collapsed .nav-chevron { display: none; }
.sidebar--collapsed .nav-sub { display: none; }
.sidebar--collapsed .nav-item { justify-content: center; padding: 10px 0; }
.sidebar--collapsed .nav-item--expandable { justify-content: center; }
.sidebar--collapsed .mode-row { justify-content: center; }
.sidebar--collapsed .mode-label { display: none; }
.sidebar--collapsed .user-details { display: none; }
.sidebar--collapsed .user-card { justify-content: center; gap: 0; flex-direction: column; }
.sidebar--collapsed .logout-btn { margin-left: 0; margin-top: 4px; }

/* ── Main area ──────────────────────────── */
.main-area {
  margin-left: 260px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.25s ease;
}

.main-area--collapsed { margin-left: 64px; }

/* ── Page content ───────────────────────── */
.page-content {
  flex: 1;
  padding: 28px;
  background: #F4F6F8;
  min-height: 0;
}

.dark .page-content { background: #0F172B; }

/* ── Mobile overlay ─────────────────────── */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 190;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Mobile topbar ──────────────────────── */
.mobile-header {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 52px;
  background: white;
  border-bottom: 1px solid #E8EEF4;
  position: sticky;
  top: 0;
  z-index: 150;
  flex-shrink: 0;
}
.dark .mobile-header { background: #1D293D; border-color: #3D5069; }

.mobile-menu-btn {
  width: 38px; height: 38px;
  border-radius: 8px;
  background: #F4F6F8;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #133C65;
  flex-shrink: 0;
}
.dark .mobile-menu-btn { background: #243553; color: #93B8D8; }

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #133C65;
  font-size: 16px;
  font-weight: 500;
}
.dark .mobile-brand { color: #E2E8F0; }
.mobile-brand-icon { width: 26px; height: 26px; object-fit: contain; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 900px) {
  .sidebar { transform: translateX(-100%); width: 260px !important; }
  .sidebar--open { transform: translateX(0); }
  .sidebar-toggle { display: none; }
  .main-area { margin-left: 0 !important; }
  .mobile-header { display: flex; }
  .page-content { padding: 16px; }
}
</style>
