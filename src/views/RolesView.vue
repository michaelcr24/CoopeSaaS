<template>
  <div class="module-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Roles y Accesos</h2>
        <p class="page-subtitle">Controla qué módulos puede ver cada rol del sistema</p>
      </div>
    </div>

    <div class="roles-grid">
      <div v-for="rol in ROLES" :key="rol.key" class="role-card">
        <div class="role-top">
          <div class="role-icon" :style="{ background: rol.color }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h3 class="role-name">{{ rol.name }}</h3>
            <span class="role-users">{{ memberCounts[rol.key] || 0 }} usuario{{ memberCounts[rol.key] === 1 ? '' : 's' }}</span>
          </div>
        </div>
        <p class="role-desc">{{ rol.desc }}</p>
        <span class="role-mod-count">{{ enabledCount(rol.key) }} de {{ MODULES.length }} módulos habilitados</span>
        <div class="role-footer">
          <button class="btn-outline" @click="openEdit(rol)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: editar módulos del rol -->
    <Transition name="fade">
      <div v-if="editingRole" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="role-icon role-icon--sm" :style="{ background: editingRole.color }">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h3 class="modal-title">Permisos — {{ editingRole.name }}</h3>
                <p class="modal-sub">Módulos visibles para este rol</p>
              </div>
            </div>
            <button class="modal-close" @click="closeEdit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div v-if="loadingModal" class="modal-loading">Cargando permisos…</div>

          <div v-else class="modal-modules">
            <div v-for="mod in modulePerms" :key="mod.key" class="module-row">
              <span class="module-name">{{ mod.name }}</span>
              <button
                class="mini-toggle"
                :class="{ 'mini-toggle--on': mod.enabled }"
                :disabled="mod.saving"
                @click="toggle(mod)"
              >
                <span class="mini-thumb"></span>
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-outline" @click="closeEdit">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRolePermissions, ROLES, MODULES, invalidateModuleCache } from '../composables/useRolePermissions.js'

const { listForRole, listAll, countMembersByRole, setModuleAccess } = useRolePermissions()

const memberCounts = ref({})
const permsByRole = ref({}) // { [role]: Set(moduleKeysEnabled) }

const editingRole = ref(null)
const loadingModal = ref(false)
const modulePerms = ref([])

function enabledCount(roleKey) {
  return permsByRole.value[roleKey]?.size || 0
}

async function loadSummary() {
  memberCounts.value = await countMembersByRole()
  const { data } = await listAll()
  const map = {}
  for (const row of data || []) {
    if (!row.can_read) continue
    if (!map[row.role]) map[row.role] = new Set()
    map[row.role].add(row.module)
  }
  permsByRole.value = map
}

async function openEdit(rol) {
  editingRole.value = rol
  loadingModal.value = true
  const { data } = await listForRole(rol.key)
  const byModule = Object.fromEntries((data || []).map((r) => [r.module, r]))
  modulePerms.value = MODULES.map((m) => ({
    ...m,
    enabled: !!byModule[m.key]?.can_read,
    saving: false,
  }))
  loadingModal.value = false
}

function closeEdit() {
  editingRole.value = null
  modulePerms.value = []
}

async function toggle(mod) {
  const next = !mod.enabled
  mod.saving = true
  const { error } = await setModuleAccess(editingRole.value.key, mod.key, next)
  mod.saving = false
  if (error) return
  mod.enabled = next
  invalidateModuleCache(editingRole.value.key)

  const set = permsByRole.value[editingRole.value.key] || new Set()
  next ? set.add(mod.key) : set.delete(mod.key)
  permsByRole.value = { ...permsByRole.value, [editingRole.value.key]: set }
}

onMounted(loadSummary)
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.role-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 18px 20px; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
  display: flex; flex-direction: column; gap: 12px;
}
.dark .role-card { background: #1D293D; border-color: #3D5069; }

.role-top { display: flex; align-items: center; gap: 10px; }
.role-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.role-icon--sm { width: 30px; height: 30px; border-radius: 8px; }
.role-name { font-size: 14.5px; font-weight: 700; color: #133C65; }
.dark .role-name { color: #E2E8F0; }
.role-users { font-size: 12px; color: #7A90A0; display: block; margin-top: 1px; }

.role-desc { font-size: 13px; color: #4A6070; line-height: 1.5; }
.dark .role-desc { color: #94A3B8; }

.role-mod-count {
  font-size: 11px; font-weight: 600;
  background: #F0F4F8; color: #4A6070;
  padding: 3px 9px; border-radius: 12px; align-self: flex-start;
}
.dark .role-mod-count { background: #162033; color: #94A3B8; }

.role-footer { padding-top: 4px; border-top: 1px solid #F0F4F8; display: flex; gap: 8px; }
.dark .role-footer { border-color: #3D5069; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 12.5px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4;
  padding: 6px 14px; border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }
.dark .btn-outline { color: #93B8D8; border-color: #3D5069; }
.dark .btn-outline:hover { background: rgba(147,184,216,0.1); border-color: #93B8D8; }

/* ── Modal ──────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,43,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 20px;
}
.modal-card {
  background: white; border-radius: 14px; width: 100%; max-width: 420px;
  max-height: 85vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}
.dark .modal-card { background: #1D293D; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid #E8EEF4;
}
.dark .modal-header { border-color: #3D5069; }
.modal-title-group { display: flex; align-items: center; gap: 10px; }
.modal-title { font-size: 15.5px; font-weight: 700; color: #133C65; }
.dark .modal-title { color: #E2E8F0; }
.modal-sub { font-size: 12px; color: #7A90A0; margin-top: 1px; }

.modal-close {
  width: 30px; height: 30px; border-radius: 7px; border: none;
  background: #F0F4F8; color: #4A6070; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-close:hover { background: #E2E8F0; }
.dark .modal-close { background: #162033; color: #94A3B8; }

.modal-loading { padding: 32px 20px; text-align: center; font-size: 13px; color: #7A90A0; }

.modal-modules { padding: 8px 20px; overflow-y: auto; display: flex; flex-direction: column; }
.module-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid #F0F4F8;
}
.dark .module-row { border-color: #2A3B57; }
.module-row:last-child { border-bottom: none; }
.module-name { font-size: 13.5px; font-weight: 600; color: #1A2B3C; }
.dark .module-name { color: #E2E8F0; }

.mini-toggle {
  width: 36px; height: 20px; border-radius: 10px;
  background: #D4E4F4; border: none; cursor: pointer;
  position: relative; transition: background 0.2s; flex-shrink: 0;
}
.mini-toggle:disabled { opacity: 0.6; cursor: wait; }
.mini-toggle--on { background: #133C65; }
.mini-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: white; transition: transform 0.2s; display: block;
}
.mini-toggle--on .mini-thumb { transform: translateX(16px); }

.modal-footer { padding: 14px 20px; border-top: 1px solid #E8EEF4; display: flex; justify-content: flex-end; }
.dark .modal-footer { border-color: #3D5069; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
