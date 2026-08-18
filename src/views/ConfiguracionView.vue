<template>
  <div class="module-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Configuración</h2>
        <p class="page-subtitle">Parámetros generales del sistema</p>
      </div>
    </div>

    <TabNav v-model="activeTab" :tabs="tabs" />

    <div v-if="activeTab === 'personal'" class="catalogos-grid">
      <CatalogList v-for="t in TIPOS_CATALOGO" :key="t.key" :tipo="t.key" :titulo="t.label" />
    </div>

    <div v-else-if="activeTab === 'feriados'" class="catalogos-grid">
      <FeriadosList />
    </div>

    <div v-else class="config-grid">
      <div class="config-card">
        <div class="config-card-header">
          <div class="config-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <h3 class="config-section-title">Información de la cooperativa</h3>
        </div>
        <div class="config-fields">
          <div class="config-field">
            <label>Nombre de la cooperativa</label>
            <input type="text" value="CoopeSaaS Demo" />
          </div>
          <div class="config-field">
            <label>Número de identificación</label>
            <input type="text" value="3-004-123456" />
          </div>
          <div class="config-field">
            <label>Correo institucional</label>
            <input type="email" value="contacto@cooperativa.com" />
          </div>
          <div class="config-field">
            <label>Teléfono</label>
            <input type="tel" value="2222-3333" />
          </div>
        </div>
        <div class="config-actions">
          <button class="btn-primary">Guardar cambios</button>
        </div>
      </div>

      <div class="config-card">
        <div class="config-card-header">
          <div class="config-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 class="config-section-title">Roles y permisos</h3>
        </div>
        <p class="config-desc">
          Gestiona los roles del sistema y los permisos de acceso para cada módulo.
        </p>
        <RouterLink to="/dashboard/configuracion/roles" class="config-link-btn">
          Administrar roles
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </RouterLink>
      </div>

      <div class="config-card">
        <div class="config-card-header">
          <div class="config-icon" style="background:#1A9152">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.63 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <h3 class="config-section-title">Notificaciones</h3>
        </div>
        <div class="toggle-list">
          <div v-for="notif in notifications" :key="notif.key" class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-name">{{ notif.name }}</span>
              <span class="toggle-desc">{{ notif.desc }}</span>
            </div>
            <button class="mini-toggle" :class="{ 'mini-toggle--on': notif.enabled }" @click="notif.enabled = !notif.enabled">
              <span class="mini-thumb"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TabNav from '../components/TabNav.vue'
import CatalogList from '../components/CatalogList.vue'
import FeriadosList from '../components/FeriadosList.vue'
import { TIPOS_CATALOGO } from '../composables/useCatalogosPersonal.js'

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'personal', label: 'Personal' },
  { key: 'feriados', label: 'Feriados' },
]
const activeTab = ref('general')

const notifications = reactive([
  { key: 'asamblea', name: 'Convocatorias de asamblea', desc: 'Enviar notificación por correo al programar', enabled: true },
  { key: 'asociado', name: 'Nuevos asociados', desc: 'Alerta cuando se registra un nuevo socio', enabled: true },
  { key: 'comite', name: 'Reuniones de comité', desc: 'Recordatorio 24h antes de una reunión', enabled: false },
])
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.catalogos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.config-card {
  background: white;
  border: 1px solid #E8EEF4;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dark .config-card { background: #1D293D; border-color: #3D5069; }

.config-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-icon {
  width: 38px; height: 38px; border-radius: 9px;
  background: #133C65; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.config-section-title { font-size: 15px; font-weight: 700; color: #133C65; }
.dark .config-section-title { color: #E2E8F0; }

.config-fields { display: flex; flex-direction: column; gap: 14px; }

.config-field { display: flex; flex-direction: column; gap: 5px; }

.config-field label {
  font-size: 12.5px; font-weight: 600; color: #4A6070;
}
.dark .config-field label { color: #94A3B8; }

.config-field input {
  height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; color: #1A2B3C; background: #F8FAFC; outline: none;
  transition: border-color 0.15s;
}
.dark .config-field input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.config-field input:focus { border-color: #133C65; background: white; }
.dark .config-field input:focus { background: #1D293D; }

.config-actions { padding-top: 4px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: #0D2A47; }

.config-desc { font-size: 13.5px; color: #4A6070; line-height: 1.5; }
.dark .config-desc { color: #94A3B8; }

.config-link-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13.5px; font-weight: 600; color: #133C65;
  background: #EBF3FF; border: none; padding: 9px 16px;
  border-radius: 8px; cursor: pointer; text-decoration: none; transition: background 0.15s;
  align-self: flex-start;
}
.config-link-btn:hover { background: #D4E8FF; }

.toggle-list { display: flex; flex-direction: column; gap: 14px; }

.toggle-item {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}

.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-name { font-size: 13.5px; font-weight: 600; color: #1A2B3C; }
.dark .toggle-name { color: #E2E8F0; }
.toggle-desc { font-size: 12px; color: #7A90A0; }

.mini-toggle {
  width: 36px; height: 20px; border-radius: 10px;
  background: #D4E4F4; border: none; cursor: pointer;
  position: relative; transition: background 0.2s; flex-shrink: 0;
}
.mini-toggle--on { background: #133C65; }
.mini-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: white; transition: transform 0.2s; display: block;
}
.mini-toggle--on .mini-thumb { transform: translateX(16px); }

@media (max-width: 900px) {
  .config-grid { grid-template-columns: 1fr; }
}
</style>
