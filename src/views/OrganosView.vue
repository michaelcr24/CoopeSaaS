<template>
  <div class="module-page">

    <!-- ═══ VISTA: LISTA DE ÓRGANOS ═══ -->
    <template v-if="!selectedOrgan">
      <div class="page-header">
        <div>
          <h2 class="page-title">Órganos Sociales</h2>
          <p class="page-subtitle">Juntas directivas, consejos y órganos de vigilancia</p>
        </div>
        <button class="btn-primary" @click="openNewOrgan">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo órgano
        </button>
      </div>

      <div class="organs-grid">
        <div v-for="org in organs" :key="org.id" class="organ-card">
          <div class="organ-header">
            <div class="organ-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h3 class="organ-name">{{ org.name }}</h3>
              <span class="organ-period">Período {{ org.period }}</span>
            </div>
          </div>

          <div class="organ-members">
            <div class="members-label">Integrantes ({{ org.members.length }})</div>
            <div v-for="m in org.members.slice(0, 3)" :key="m.role" class="member-row">
              <div class="member-avatar" :style="{ background: m.asociado?.color ?? '#C5D5E5' }">
                {{ m.asociado?.initials ?? '?' }}
              </div>
              <div class="member-info">
                <span class="member-name">{{ m.asociado?.name ?? 'Vacante' }}</span>
                <span class="member-role">{{ m.role }}</span>
              </div>
            </div>
            <div v-if="org.members.length > 3" class="members-more">
              +{{ org.members.length - 3 }} más
            </div>
          </div>

          <div class="organ-footer">
            <button class="btn-outline" @click="openDetail(org)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ VISTA: DETALLE DEL ÓRGANO ═══ -->
    <template v-else>
      <div class="detail-page-header">
        <button class="btn-back" @click="closeDetail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Órganos Sociales
        </button>
        <div class="detail-title-row">
          <div class="organ-icon organ-icon--lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <h2 class="detail-page-title">{{ selectedOrgan.name }}</h2>
            <p class="detail-page-subtitle">Período {{ selectedOrgan.period }} · {{ selectedOrgan.members.length }} integrantes</p>
          </div>
        </div>
      </div>

      <!-- Dos columnas: Actas | Integrantes -->
      <div class="detail-two-col">

        <!-- ── Columna 1: Gestión de actas ── -->
        <div class="detail-section">
          <div class="section-head">
            <h3 class="section-title">Gestión de actas</h3>
            <button class="btn-primary btn-sm" @click="openNewActa">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva acta
            </button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th class="th-actions">Acc.</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="acta in selectedOrgan.actas" :key="acta.id">
                  <td class="cell-bold">{{ acta.numero }}</td>
                  <td>{{ acta.tipo }}</td>
                  <td>{{ acta.fecha }}</td>
                  <td><span class="badge" :class="'badge--' + acta.estadoClass">{{ acta.estado }}</span></td>
                  <td style="white-space:nowrap">
                    <button class="action-btn" title="Editar" @click="editActa(acta)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn action-btn--danger" title="Eliminar" @click="deleteActa(acta)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="!selectedOrgan.actas.length">
                  <td :colspan="5" class="empty-row">Sin actas registradas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Columna 2: Gestión de integrantes ── -->
        <div class="detail-section">
          <div class="section-head">
            <h3 class="section-title">Gestión de integrantes</h3>
            <button class="btn-primary btn-sm" @click="startEdit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
          </div>

          <!-- Modo lectura -->
          <template v-if="!editMode">
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Puesto</th><th>Asociado</th><th>Desde</th></tr></thead>
                <tbody>
                  <tr v-for="m in selectedOrgan.members" :key="m.role">
                    <td class="cell-bold role-cell">{{ m.role }}</td>
                    <td>
                      <div class="detail-person">
                        <div class="member-avatar member-avatar--sm" :style="{ background: m.asociado?.color ?? '#C5D5E5' }">
                          {{ m.asociado?.initials ?? '?' }}
                        </div>
                        <span :class="m.asociado ? '' : 'vacante-txt'">{{ m.asociado?.name ?? 'Vacante' }}</span>
                      </div>
                    </td>
                    <td class="detail-since">{{ m.desde ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- Modo edición -->
          <template v-else>
            <div class="edit-slots">
              <div v-for="slot in editSlots" :key="slot.role" class="edit-slot">
                <label class="slot-role">{{ slot.role }}</label>
                <div class="autocomplete-wrap">
                  <div class="autocomplete-input-wrap">
                    <svg class="ac-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      v-model="slot.query"
                      type="text"
                      class="autocomplete-input"
                      :placeholder="`Buscar para ${slot.role}...`"
                      @input="onSlotInput(slot)"
                      @focus="onSlotInput(slot)"
                      @blur="onSlotBlur(slot)"
                    />
                    <div v-if="slot.asociado" class="ac-selected-avatar" :style="{ background: slot.asociado.color }">
                      {{ slot.asociado.initials }}
                    </div>
                    <button v-if="slot.asociado" class="ac-clear" @mousedown.prevent="clearSlot(slot)" title="Quitar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <Transition name="dropdown-fade">
                    <div v-if="slot.open && slot.suggestions.length" class="autocomplete-dropdown">
                      <div
                        v-for="a in slot.suggestions"
                        :key="a.id"
                        class="ac-item"
                        @mousedown.prevent="selectSuggestion(slot, a)"
                      >
                        <div class="member-avatar member-avatar--sm" :style="{ background: a.color }">{{ a.initials }}</div>
                        <div class="ac-item-info">
                          <span class="ac-item-name">{{ a.name }}</span>
                          <span class="ac-item-cedula">{{ a.cedula }}</span>
                        </div>
                        <span v-if="a.cargo" class="ac-item-cargo">{{ a.cargo }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
            <div class="edit-actions">
              <button class="btn-outline btn-sm" @click="cancelEdit">Cancelar</button>
              <button class="btn-primary btn-sm" @click="saveEdit">Guardar cambios</button>
            </div>
          </template>
        </div>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref } from 'vue'

/* ── Asociados disponibles (mock) ───────── */
const asociados = [
  { id: 1,  name: 'Juan Pérez Mora',      initials: 'JP',  color: '#133C65', cedula: '1-0234-0567', cargo: 'Asociado' },
  { id: 2,  name: 'Laura Soto Jiménez',   initials: 'LS',  color: '#1A9152', cedula: '2-0456-0789', cargo: 'Asociada' },
  { id: 3,  name: 'Roberto Ureña',        initials: 'RU',  color: '#C47F0C', cedula: '3-0123-0456', cargo: 'Asociado' },
  { id: 4,  name: 'Carmen Fallas',        initials: 'CF',  color: '#7B3FA0', cedula: '1-0678-0901', cargo: 'Asociada' },
  { id: 5,  name: 'Ernesto Vega',         initials: 'EV',  color: '#00808C', cedula: '4-0234-0567', cargo: 'Asociado' },
  { id: 6,  name: 'María Rodríguez',      initials: 'MR',  color: '#133C65', cedula: '1-0501-0234', cargo: 'Asociada' },
  { id: 7,  name: 'Carlos Solano',        initials: 'CS',  color: '#1A9152', cedula: '2-0301-0888', cargo: 'Asociado' },
  { id: 8,  name: 'Ana Vargas',           initials: 'AV',  color: '#7B3FA0', cedula: '4-0102-0345', cargo: 'Asociada' },
  { id: 9,  name: 'Luis Jiménez',         initials: 'LJ',  color: '#C47F0C', cedula: '1-0721-0912', cargo: 'Asociado' },
  { id: 10, name: 'Patricia Mora',        initials: 'PM',  color: '#C0392B', cedula: '3-0561-0234', cargo: 'Asociada' },
  { id: 11, name: 'Fernando Castro',      initials: 'FC',  color: '#1565C0', cedula: '1-0845-0312', cargo: 'Asociado' },
  { id: 12, name: 'Gloria Herrera',       initials: 'GH',  color: '#00808C', cedula: '2-0613-0789', cargo: 'Asociada' },
  { id: 13, name: 'Marcos Salas',         initials: 'MS',  color: '#7B3FA0', cedula: '4-0312-0655', cargo: 'Asociado' },
  { id: 14, name: 'Ingrid Quesada',       initials: 'IQ',  color: '#C0392B', cedula: '1-0933-0412', cargo: 'Asociada' },
  { id: 15, name: 'Rodrigo Blanco',       initials: 'RB',  color: '#133C65', cedula: '3-0777-0128', cargo: 'Asociado' },
]

/* ── Órganos ────────────────────────────── */
const organs = ref([
  {
    id: 1,
    name: 'Consejo de Administración',
    period: '2024-2026',
    members: [
      { role: 'Presidente/a',     asociado: asociados[5],  desde: '15/04/2024' },
      { role: 'Vicepresidente/a', asociado: asociados[6],  desde: '15/04/2024' },
      { role: 'Secretario/a',     asociado: asociados[7],  desde: '15/04/2024' },
      { role: 'Tesorero/a',       asociado: asociados[0],  desde: '15/04/2024' },
      { role: 'Fiscal',           asociado: asociados[10], desde: '15/04/2024' },
      { role: 'Vocal I',          asociado: asociados[1],  desde: '15/04/2024' },
      { role: 'Vocal II',         asociado: asociados[11], desde: '15/04/2024' },
    ],
    actas: [
      { id: 1, numero: 'ACTA-001-2026', tipo: 'Ordinaria',      fecha: '10/01/2026', estado: 'Aprobada',  estadoClass: 'green'  },
      { id: 2, numero: 'ACTA-002-2026', tipo: 'Extraordinaria', fecha: '15/03/2026', estado: 'Aprobada',  estadoClass: 'green'  },
      { id: 3, numero: 'ACTA-003-2026', tipo: 'Ordinaria',      fecha: '05/05/2026', estado: 'Pendiente', estadoClass: 'yellow' },
    ],
  },
  {
    id: 2,
    name: 'Junta de Vigilancia',
    period: '2024-2026',
    members: [
      { role: 'Presidente/a', asociado: asociados[8],  desde: '15/04/2024' },
      { role: 'Secretario/a', asociado: asociados[9],  desde: '15/04/2024' },
      { role: 'Vocal',        asociado: asociados[12], desde: '15/04/2024' },
    ],
    actas: [
      { id: 1, numero: 'ACTA-JV-001-2025', tipo: 'Ordinaria', fecha: '20/02/2025', estado: 'Aprobada', estadoClass: 'green' },
      { id: 2, numero: 'ACTA-JV-002-2025', tipo: 'Ordinaria', fecha: '18/06/2025', estado: 'Aprobada', estadoClass: 'green' },
    ],
  },
  {
    id: 3,
    name: 'Comité de Educación',
    period: '2024-2025',
    members: [
      { role: 'Coordinador/a', asociado: asociados[4],  desde: '10/06/2024' },
      { role: 'Secretario/a',  asociado: asociados[3],  desde: '10/06/2024' },
      { role: 'Vocal I',       asociado: asociados[13], desde: '10/06/2024' },
      { role: 'Vocal II',      asociado: asociados[14], desde: '10/06/2024' },
    ],
    actas: [
      { id: 1, numero: 'ACTA-CE-001-2024', tipo: 'Ordinaria', fecha: '15/07/2024', estado: 'Aprobada', estadoClass: 'green' },
    ],
  },
  {
    id: 4,
    name: 'Tribunal Electoral',
    period: '2025-2027',
    members: [
      { role: 'Presidente/a', asociado: asociados[2],  desde: '20/05/2025' },
      { role: 'Secretario/a', asociado: asociados[5],  desde: '20/05/2025' },
      { role: 'Vocal',        asociado: asociados[13], desde: '20/05/2025' },
    ],
    actas: [
      { id: 1, numero: 'ACTA-TE-001-2025', tipo: 'Constitutiva', fecha: '20/05/2025', estado: 'Aprobada',  estadoClass: 'green'  },
      { id: 2, numero: 'ACTA-TE-002-2026', tipo: 'Ordinaria',    fecha: '12/02/2026', estado: 'Pendiente', estadoClass: 'yellow' },
    ],
  },
])

/* ── Detalle inline ─────────────────────── */
const selectedOrgan = ref(null)

function openDetail(org) {
  selectedOrgan.value = org
  editMode.value = false
}

function closeDetail() {
  selectedOrgan.value = null
  editMode.value = false
}

function openNewOrgan() {}

/* ── Edición de integrantes ─────────────── */
const editMode = ref(false)
const editSlots = ref([])

function startEdit() {
  editSlots.value = selectedOrgan.value.members.map(m => ({
    role: m.role,
    asociado: m.asociado ? { ...m.asociado } : null,
    query: m.asociado?.name ?? '',
    open: false,
    suggestions: [],
  }))
  editMode.value = true
}

function cancelEdit() { editMode.value = false }

function saveEdit() {
  selectedOrgan.value.members = editSlots.value.map((slot, i) => ({
    role: slot.role,
    asociado: slot.asociado,
    desde: selectedOrgan.value.members[i]?.desde,
  }))
  editMode.value = false
}

/* ── Autocomplete ───────────────────────── */
function onSlotInput(slot) {
  const q = slot.query.trim().toLowerCase()
  slot.suggestions = q
    ? asociados.filter(a => a.name.toLowerCase().includes(q) || a.cedula.includes(q))
    : asociados.slice(0, 8)
  slot.open = true
}

function onSlotBlur(slot) { setTimeout(() => { slot.open = false }, 160) }

function selectSuggestion(slot, a) {
  slot.asociado = { ...a }
  slot.query = a.name
  slot.open = false
}

function clearSlot(slot) {
  slot.asociado = null
  slot.query = ''
  slot.open = false
}

/* ── Actas ──────────────────────────────── */
let nextActaId = 20

function openNewActa() {
  if (!selectedOrgan.value) return
  selectedOrgan.value.actas.push({
    id: nextActaId++,
    numero: `ACTA-${String(selectedOrgan.value.id).padStart(2,'0')}-${nextActaId.toString().padStart(3,'0')}`,
    tipo: 'Ordinaria',
    fecha: '16/06/2026',
    estado: 'Pendiente',
    estadoClass: 'yellow',
  })
}

function editActa(_acta) {}

function deleteActa(acta) {
  if (!selectedOrgan.value) return
  selectedOrgan.value.actas = selectedOrgan.value.actas.filter(a => a.id !== acta.id)
}
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

/* ── Grid de tarjetas ───────────────────── */
.organs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 18px; }

.organ-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 4px rgba(19,60,101,0.07);
}
.dark .organ-card { background: #1D293D; border-color: #3D5069; }

.organ-header {
  display: flex; align-items: center; gap: 12px; padding: 16px 18px;
  background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .organ-header { background: #162033; border-color: #3D5069; }

.organ-icon {
  width: 40px; height: 40px; border-radius: 10px; background: #133C65;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.organ-icon--lg { width: 48px; height: 48px; border-radius: 12px; }

.organ-name { font-size: 14px; font-weight: 700; color: #133C65; }
.dark .organ-name { color: #E2E8F0; }
.organ-period { font-size: 11.5px; color: #7A90A0; }

.organ-members { padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; }
.members-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #7A90A0; margin-bottom: 2px; }
.members-more { font-size: 12px; color: #7A90A0; padding-left: 40px; }

.member-row { display: flex; align-items: center; gap: 10px; }
.member-avatar {
  width: 30px; height: 30px; border-radius: 50%; color: white; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.member-avatar--sm { width: 28px; height: 28px; font-size: 10px; }

.member-info { display: flex; flex-direction: column; gap: 1px; }
.member-name { font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .member-name { color: #E2E8F0; }
.member-role { font-size: 11.5px; color: #7A90A0; }

.organ-footer { padding: 12px 18px; border-top: 1px solid #F0F4F8; }
.dark .organ-footer { border-color: #3D5069; }

/* ── Detalle inline ─────────────────────── */
.detail-page-header { display: flex; flex-direction: column; gap: 14px; }

.btn-back {
  display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600;
  color: #133C65; background: none; border: none; cursor: pointer; padding: 0;
  transition: color 0.15s; width: fit-content;
}
.btn-back:hover { color: #0D2A47; }
.dark .btn-back { color: #93B8D8; }
.dark .btn-back:hover { color: #E2E8F0; }

.detail-title-row { display: flex; align-items: center; gap: 14px; }
.detail-page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; margin-bottom: 3px; }
.dark .detail-page-title { color: #E2E8F0; }
.detail-page-subtitle { font-size: 13.5px; color: #7A90A0; }

/* ── Dos columnas ───────────────────────── */
.detail-two-col {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;
}
@media (max-width: 900px) { .detail-two-col { grid-template-columns: 1fr; } }

.detail-section {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .detail-section { background: #1D293D; border-color: #3D5069; }

.section-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 14px 18px; border-bottom: 1px solid #E8EEF4; background: #F8FAFC;
}
.dark .section-head { background: #162033; border-color: #3D5069; }
.section-title { font-size: 13.5px; font-weight: 700; color: #133C65; }
.dark .section-title { color: #E2E8F0; }

.table-wrap { overflow-x: auto; }

/* ── Tabla ──────────────────────────────── */
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th {
  padding: 9px 14px; text-align: left;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
  color: #7A90A0; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .data-table th { background: #162033; border-color: #3D5069; color: #64748B; }
.data-table td { padding: 10px 14px; border-bottom: 1px solid #F0F4F8; color: #1A2B3C; vertical-align: middle; }
.dark .data-table td { border-color: #3D5069; color: #E2E8F0; }
.data-table tr:last-child td { border-bottom: none; }
.th-actions { width: 64px; text-align: center; }

.cell-bold { font-weight: 600; color: #133C65 !important; }
.dark .cell-bold { color: #93B8D8 !important; }
.role-cell { font-size: 12.5px; }
.empty-row { text-align: center; color: #B0C0D0; font-style: italic; padding: 22px 14px !important; }

/* ── Badges ─────────────────────────────── */
.badge {
  display: inline-flex; align-items: center; font-size: 11.5px; font-weight: 600;
  padding: 3px 9px; border-radius: 12px; white-space: nowrap;
}
.badge--green  { background: rgba(26,145,82,0.12);  color: #1A6B42; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #7A5000; }
.badge--red    { background: rgba(192,57,43,0.12);  color: #922B21; }
.dark .badge--green  { background: rgba(74,222,128,0.18);  color: #4ADE80; }
.dark .badge--yellow { background: rgba(251,191,36,0.18);  color: #FBE24A; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }

/* ── Acciones ───────────────────────────── */
.action-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; border-radius: 6px;
  background: transparent; color: #4A6070; cursor: pointer; transition: all 0.12s;
  vertical-align: middle;
}
.action-btn:hover { background: #EBF3FF; color: #133C65; }
.action-btn--danger:hover { background: #FDECEA; color: #C0392B; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { background: rgba(147,184,216,0.12); color: #93B8D8; }
.dark .action-btn--danger:hover { background: rgba(248,113,113,0.12); color: #F87171; }

/* ── Detail person ──────────────────────── */
.detail-person { display: flex; align-items: center; gap: 9px; }
.detail-person span { font-size: 13px; color: #1A2B3C; font-weight: 500; }
.dark .detail-person span { color: #E2E8F0; }
.detail-since { font-size: 12px; color: #7A90A0; }
.vacante-txt { color: #B0C0D0 !important; font-style: italic; }

/* ── Edit slots ─────────────────────────── */
.edit-slots { display: flex; flex-direction: column; gap: 12px; padding: 16px 18px; }
.edit-slot { display: flex; flex-direction: column; gap: 4px; }
.slot-role { font-size: 12px; font-weight: 700; color: #133C65; }
.dark .slot-role { color: #93B8D8; }

.edit-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 18px; border-top: 1px solid #E8EEF4;
}
.dark .edit-actions { border-color: #3D5069; }

/* ── Autocomplete ───────────────────────── */
.autocomplete-wrap { position: relative; }
.autocomplete-input-wrap { position: relative; display: flex; align-items: center; }
.ac-search-icon { position: absolute; left: 11px; color: #7A90A0; pointer-events: none; z-index: 1; }
.autocomplete-input {
  width: 100%; height: 38px; padding: 0 68px 0 32px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
  transition: border-color 0.15s;
}
.dark .autocomplete-input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.autocomplete-input:focus { border-color: #133C65; }

.ac-selected-avatar {
  position: absolute; right: 36px; width: 22px; height: 22px; border-radius: 50%;
  color: white; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.ac-clear {
  position: absolute; right: 10px;
  background: #F0F4F8; border: none; border-radius: 4px; color: #7A90A0;
  width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.12s;
}
.ac-clear:hover { background: #E8EEF4; color: #C0392B; }

.autocomplete-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: white; border: 1.5px solid #D4E4F4; border-radius: 10px;
  box-shadow: 0 8px 30px rgba(19,60,101,0.14); z-index: 100;
  max-height: 200px; overflow-y: auto;
}
.dark .autocomplete-dropdown { background: #1D293D; border-color: #3D5069; }

.ac-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  cursor: pointer; border-bottom: 1px solid #F0F4F8; transition: background 0.1s;
}
.dark .ac-item { border-color: #3D5069; }
.ac-item:last-child { border-bottom: none; }
.ac-item:hover { background: #F0F7FF; }
.dark .ac-item:hover { background: rgba(19,60,101,0.2); }

.ac-item-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.ac-item-name { font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .ac-item-name { color: #E2E8F0; }
.ac-item-cedula { font-size: 11px; color: #7A90A0; font-family: monospace; }
.ac-item-cargo { font-size: 11px; color: #7A90A0; background: #F0F4F8; padding: 2px 7px; border-radius: 12px; }
.dark .ac-item-cargo { background: #2D3F55; }

/* ── Botones ────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover { background: #0D2A47; }
.btn-sm { padding: 7px 13px; font-size: 12.5px; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600;
  color: #133C65; background: none; border: 1.5px solid #D4E4F4; padding: 7px 16px;
  border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }
.dark .btn-outline { color: #93B8D8; border-color: #3D5069; }
.dark .btn-outline:hover { background: rgba(147,184,216,0.1); border-color: #93B8D8; }

/* ── Transitions ────────────────────────── */
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .page-header .btn-primary { width: 100%; justify-content: center; }
  .data-card { overflow-x: auto; }
  .organs-grid { grid-template-columns: 1fr; }
  .detail-two-col { grid-template-columns: 1fr; }
}
</style>
