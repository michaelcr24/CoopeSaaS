<template>
  <div class="module-page">

    <div class="page-header">
      <div>
        <h2 class="page-title">Comités</h2>
        <p class="page-subtitle">Comités especializados, reuniones y acuerdos</p>
      </div>
      <div class="header-actions">
        <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(comites,[{key:'nombre',label:'Comité'},{key:'objetivo',label:'Objetivo'},{key:'ultimaReunion',label:'Última reunión'},{key:'proximaReunion',label:'Próxima reunión'},{key:'estado',label:'Estado'}],'comites')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
        </button>
        <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Comités')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
        </button>
        <button class="btn-primary" @click="openModal('nuevo')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo comité
        </button>
      </div>
    </div>

    <div class="data-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre del comité</th>
            <th>Objetivo</th>
            <th>Integrantes</th>
            <th>Última reunión</th>
            <th>Próxima reunión</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in comites" :key="c.id">
            <td>
              <div class="cell-name">
                <div class="cell-dot" :style="{ background: c.color }"></div>
                <span class="cell-name-txt">{{ c.name }}</span>
              </div>
            </td>
            <td><span class="cell-objetivo">{{ c.objetivo }}</span></td>
            <td>
              <div class="avatars-stack">
                <div
                  v-for="(m, i) in c.members.slice(0, 4)"
                  :key="m.role"
                  class="stack-avatar"
                  :style="{ background: m.asociado?.color ?? '#C5D5E5', zIndex: 10 - i }"
                  :title="m.asociado?.name ?? 'Vacante'"
                >
                  {{ m.asociado?.initials ?? '?' }}
                </div>
                <div v-if="c.members.length > 4" class="stack-more">+{{ c.members.length - 4 }}</div>
              </div>
            </td>
            <td>{{ c.lastMeeting }}</td>
            <td>{{ c.nextMeeting }}</td>
            <td><span class="badge" :class="`badge--${c.statusClass}`">{{ c.status }}</span></td>
            <td class="cell-actions">
              <button class="action-btn" title="Ver detalle" @click="openModal('detalle', c)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="action-btn" title="Editar integrantes" @click="openModal('editar', c)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══ MODAL ═══ -->
    <Transition name="modal-fade">
      <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box modal-box--lg">

          <button class="modal-close" @click="closeModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- ── Nuevo comité ── -->
          <template v-if="modal.type === 'nuevo'">
            <h3 class="modal-title">Nuevo comité</h3>
            <p class="modal-subtitle">Crea un comité especializado y define sus integrantes</p>
            <form class="modal-form" @submit.prevent="closeModal">

              <div class="form-section-title">Información general</div>
              <div class="form-field form-field--full">
                <label>Nombre del comité <span class="req">*</span></label>
                <input type="text" placeholder="Ej: Comité de Crédito" required />
              </div>
              <div class="form-field form-field--full">
                <label>Objetivo / Descripción <span class="req">*</span></label>
                <textarea rows="2" placeholder="Propósito y funciones principales del comité..." required></textarea>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Período inicio <span class="req">*</span></label>
                  <DatePicker required />
                </div>
                <div class="form-field">
                  <label>Período fin</label>
                  <DatePicker />
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Estado <span class="req">*</span></label>
                  <select required>
                    <option>Activo</option>
                    <option>Pausado</option>
                    <option>Inactivo</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Color identificador</label>
                  <div class="color-options">
                    <button
                      v-for="col in colorOptions"
                      :key="col"
                      type="button"
                      class="color-dot"
                      :style="{ background: col }"
                      :class="{ 'color-dot--active': newComiteColor === col }"
                      @click="newComiteColor = col"
                    ></button>
                  </div>
                </div>
              </div>

              <div class="form-section-title" style="margin-top:4px">Integrantes</div>
              <p class="form-hint">Define los puestos y asigna un asociado a cada uno</p>

              <div class="new-slots">
                <div v-for="(slot, idx) in newSlots" :key="idx" class="new-slot-row">
                  <input
                    v-model="slot.role"
                    type="text"
                    class="slot-role-input"
                    placeholder="Ej: Presidente/a"
                  />
                  <div class="autocomplete-wrap autocomplete-wrap--inline">
                    <div class="autocomplete-input-wrap">
                      <svg class="ac-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        v-model="slot.query"
                        type="text"
                        class="autocomplete-input"
                        placeholder="Buscar asociado..."
                        @input="onSlotInput(slot)"
                        @focus="onSlotInput(slot)"
                        @blur="onSlotBlur(slot)"
                      />
                      <div v-if="slot.asociado" class="ac-selected-avatar" :style="{ background: slot.asociado.color }">
                        {{ slot.asociado.initials }}
                      </div>
                      <button v-if="slot.asociado" type="button" class="ac-clear" @mousedown.prevent="clearSlot(slot)">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <Transition name="dropdown-fade">
                      <div v-if="slot.open && slot.suggestions.length" class="autocomplete-dropdown">
                        <div v-for="a in slot.suggestions" :key="a.id" class="ac-item" @mousedown.prevent="selectSuggestion(slot, a)">
                          <div class="member-avatar member-avatar--sm" :style="{ background: a.color }">{{ a.initials }}</div>
                          <div class="ac-item-info">
                            <span class="ac-item-name">{{ a.name }}</span>
                            <span class="ac-item-cedula">{{ a.cedula }}</span>
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </div>
                  <button type="button" class="slot-remove-btn" @click="removeNewSlot(idx)" title="Eliminar fila">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              <button type="button" class="btn-add-slot" @click="addNewSlot">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar puesto
              </button>

              <div class="modal-actions" style="margin-top:8px">
                <button type="button" class="btn-outline" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn-primary">Crear comité</button>
              </div>
            </form>
          </template>

          <!-- ── Detalle del comité ── -->
          <template v-if="modal.type === 'detalle' && modal.comite">
            <div class="modal-comite-header">
              <div class="comite-icon" :style="{ background: modal.comite.color }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h3 class="modal-title">{{ modal.comite.name }}</h3>
                <p class="modal-subtitle">{{ modal.comite.objetivo }}</p>
              </div>
              <span class="badge" :class="`badge--${modal.comite.statusClass}`" style="margin-left:auto;align-self:flex-start">{{ modal.comite.status }}</span>
            </div>

            <div class="comite-meta">
              <div class="meta-item">
                <span class="meta-label">Última reunión</span>
                <span class="meta-value">{{ modal.comite.lastMeeting }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Próxima reunión</span>
                <span class="meta-value">{{ modal.comite.nextMeeting }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Integrantes</span>
                <span class="meta-value">{{ modal.comite.members.length }}</span>
              </div>
            </div>

            <div class="detail-members-label">
              <span>Integrantes y puestos</span>
              <button class="btn-primary btn-sm" @click="openModal('editar', modal.comite)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar integrantes
              </button>
            </div>

            <div class="detail-table">
              <div class="detail-row detail-row--head">
                <span>Puesto</span>
                <span>Asociado</span>
              </div>
              <div v-for="m in modal.comite.members" :key="m.role" class="detail-row detail-row--2col">
                <span class="detail-role">{{ m.role }}</span>
                <div class="detail-person">
                  <div class="member-avatar member-avatar--sm" :style="{ background: m.asociado?.color ?? '#C5D5E5' }">
                    {{ m.asociado?.initials ?? '?' }}
                  </div>
                  <span :class="m.asociado ? '' : 'vacante-txt'">{{ m.asociado?.name ?? 'Vacante' }}</span>
                </div>
              </div>
            </div>

            <div class="modal-actions" style="margin-top:20px">
              <button class="btn-outline" @click="closeModal">Cerrar</button>
            </div>
          </template>

          <!-- ── Editar integrantes ── -->
          <template v-if="modal.type === 'editar' && modal.comite">
            <div class="modal-comite-header">
              <div class="comite-icon" :style="{ background: modal.comite.color }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <h3 class="modal-title">Editar integrantes</h3>
                <p class="modal-subtitle">{{ modal.comite.name }}</p>
              </div>
            </div>

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
                      :placeholder="`Buscar asociado para ${slot.role}...`"
                      @input="onSlotInput(slot)"
                      @focus="onSlotInput(slot)"
                      @blur="onSlotBlur(slot)"
                    />
                    <div v-if="slot.asociado" class="ac-selected-avatar" :style="{ background: slot.asociado.color }">
                      {{ slot.asociado.initials }}
                    </div>
                    <button v-if="slot.asociado" type="button" class="ac-clear" @mousedown.prevent="clearSlot(slot)">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <Transition name="dropdown-fade">
                    <div v-if="slot.open && slot.suggestions.length" class="autocomplete-dropdown">
                      <div v-for="a in slot.suggestions" :key="a.id" class="ac-item" @mousedown.prevent="selectSuggestion(slot, a)">
                        <div class="member-avatar member-avatar--sm" :style="{ background: a.color }">{{ a.initials }}</div>
                        <div class="ac-item-info">
                          <span class="ac-item-name">{{ a.name }}</span>
                          <span class="ac-item-cedula">{{ a.cedula }}</span>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-outline" @click="closeModal">Cancelar</button>
              <button class="btn-primary" @click="saveComiteEdit">Guardar cambios</button>
            </div>
          </template>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import DatePicker from '../components/DatePicker.vue'
import { exportCSV, exportPDF } from '../composables/useExport.js'

/* ── Asociados (mock) ───────────────────── */
const asociados = [
  { id: 1,  name: 'Juan Pérez Mora',    initials: 'JP', color: '#133C65', cedula: '1-0234-0567' },
  { id: 2,  name: 'Laura Soto Jiménez', initials: 'LS', color: '#1A9152', cedula: '2-0456-0789' },
  { id: 3,  name: 'Roberto Ureña',      initials: 'RU', color: '#C47F0C', cedula: '3-0123-0456' },
  { id: 4,  name: 'Carmen Fallas',      initials: 'CF', color: '#7B3FA0', cedula: '1-0678-0901' },
  { id: 5,  name: 'Ernesto Vega',       initials: 'EV', color: '#00808C', cedula: '4-0234-0567' },
  { id: 6,  name: 'María Rodríguez',    initials: 'MR', color: '#133C65', cedula: '1-0501-0234' },
  { id: 7,  name: 'Carlos Solano',      initials: 'CS', color: '#1A9152', cedula: '2-0301-0888' },
  { id: 8,  name: 'Ana Vargas',         initials: 'AV', color: '#7B3FA0', cedula: '4-0102-0345' },
  { id: 9,  name: 'Luis Jiménez',       initials: 'LJ', color: '#C47F0C', cedula: '1-0721-0912' },
  { id: 10, name: 'Patricia Mora',      initials: 'PM', color: '#C0392B', cedula: '3-0561-0234' },
  { id: 11, name: 'Fernando Castro',    initials: 'FC', color: '#1565C0', cedula: '1-0845-0312' },
  { id: 12, name: 'Gloria Herrera',     initials: 'GH', color: '#00808C', cedula: '2-0613-0789' },
  { id: 13, name: 'Marcos Salas',       initials: 'MS', color: '#7B3FA0', cedula: '4-0312-0655' },
  { id: 14, name: 'Ingrid Quesada',     initials: 'IQ', color: '#C0392B', cedula: '1-0933-0412' },
  { id: 15, name: 'Rodrigo Blanco',     initials: 'RB', color: '#133C65', cedula: '3-0777-0128' },
]

/* ── Comités (mock) ─────────────────────── */
const comites = ref([
  {
    id: 1, name: 'Comité de Crédito', color: '#133C65',
    objetivo: 'Evaluar y aprobar solicitudes de crédito',
    lastMeeting: '05/06/2026', nextMeeting: '19/06/2026',
    status: 'Activo', statusClass: 'green',
    members: [
      { role: 'Presidente/a', asociado: asociados[0] },
      { role: 'Secretario/a', asociado: asociados[1] },
      { role: 'Vocal I',      asociado: asociados[5] },
      { role: 'Vocal II',     asociado: asociados[10] },
      { role: 'Vocal III',    asociado: asociados[14] },
    ],
  },
  {
    id: 2, name: 'Comité de Educación', color: '#1A9152',
    objetivo: 'Planificar y gestionar actividades educativas y culturales',
    lastMeeting: '01/06/2026', nextMeeting: '15/06/2026',
    status: 'Activo', statusClass: 'green',
    members: [
      { role: 'Coordinador/a', asociado: asociados[4] },
      { role: 'Secretario/a',  asociado: asociados[3] },
      { role: 'Vocal I',       asociado: asociados[11] },
      { role: 'Vocal II',      asociado: asociados[7] },
    ],
  },
  {
    id: 3, name: 'Comité de Bienestar', color: '#C47F0C',
    objetivo: 'Promover el bienestar y calidad de vida de los asociados',
    lastMeeting: '20/05/2026', nextMeeting: '—',
    status: 'Pausado', statusClass: 'yellow',
    members: [
      { role: 'Coordinador/a', asociado: asociados[2] },
      { role: 'Vocal I',       asociado: asociados[9] },
      { role: 'Vocal II',      asociado: asociados[12] },
    ],
  },
  {
    id: 4, name: 'Comité Electoral', color: '#7B3FA0',
    objetivo: 'Organizar y fiscalizar procesos electorales internos',
    lastMeeting: '10/01/2026', nextMeeting: '10/01/2027',
    status: 'Inactivo', statusClass: 'gray',
    members: [
      { role: 'Presidente/a', asociado: asociados[6] },
      { role: 'Secretario/a', asociado: asociados[8] },
      { role: 'Fiscal',       asociado: asociados[13] },
      { role: 'Vocal I',      asociado: asociados[3] },
      { role: 'Vocal II',     asociado: asociados[11] },
    ],
  },
  {
    id: 5, name: 'Comité de Vigilancia Ambiental', color: '#00808C',
    objetivo: 'Supervisar prácticas ambientales y sostenibilidad',
    lastMeeting: '28/05/2026', nextMeeting: '28/06/2026',
    status: 'Activo', statusClass: 'green',
    members: [
      { role: 'Coordinador/a', asociado: asociados[4] },
      { role: 'Secretario/a',  asociado: asociados[1] },
      { role: 'Vocal I',       asociado: asociados[14] },
      { role: 'Vocal II',      asociado: asociados[7] },
    ],
  },
  {
    id: 6, name: 'Comité de TI', color: '#C0392B',
    objetivo: 'Gestionar tecnología, sistemas e infraestructura digital',
    lastMeeting: '03/06/2026', nextMeeting: '17/06/2026',
    status: 'Activo', statusClass: 'green',
    members: [
      { role: 'Coordinador/a', asociado: asociados[10] },
      { role: 'Secretario/a',  asociado: asociados[6] },
      { role: 'Vocal',         asociado: asociados[12] },
    ],
  },
])

/* ── Modal state ────────────────────────── */
const modal = reactive({ open: false, type: '', comite: null })
const editSlots = ref([])

const colorOptions = ['#133C65','#1A9152','#C47F0C','#7B3FA0','#00808C','#C0392B','#1565C0']
const newComiteColor = ref('#133C65')

const newSlots = ref([
  { role: '', query: '', asociado: null, open: false, suggestions: [] },
])

function openModal(type, comite = null) {
  modal.type = type
  modal.comite = comite
  modal.open = true

  if (type === 'editar' && comite) {
    editSlots.value = comite.members.map(m => ({
      role: m.role,
      asociado: m.asociado ? { ...m.asociado } : null,
      query: m.asociado?.name ?? '',
      open: false,
      suggestions: [],
    }))
  }

  if (type === 'nuevo') {
    newSlots.value = [{ role: '', query: '', asociado: null, open: false, suggestions: [] }]
    newComiteColor.value = '#133C65'
  }
}

function closeModal() {
  modal.open = false
}

function saveComiteEdit() {
  modal.comite.members = editSlots.value.map(slot => ({
    role: slot.role,
    asociado: slot.asociado ?? null,
  }))
  closeModal()
}

/* ── New slots ──────────────────────────── */
function addNewSlot() {
  newSlots.value.push({ role: '', query: '', asociado: null, open: false, suggestions: [] })
}
function removeNewSlot(idx) {
  newSlots.value.splice(idx, 1)
}

/* ── Autocomplete ───────────────────────── */
function onSlotInput(slot) {
  const q = slot.query.trim().toLowerCase()
  slot.suggestions = q
    ? asociados.filter(a => a.name.toLowerCase().includes(q) || a.cedula.includes(q))
    : asociados.slice(0, 8)
  slot.open = true
}

function onSlotBlur(slot) {
  setTimeout(() => { slot.open = false }, 160)
}

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
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.export-btn { width: 34px; height: 34px; background: none; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.export-btn--excel { color: #217346; border: 1.5px solid #C8E6C9; }
.export-btn--excel:hover { background: rgba(33,115,70,0.08); border-color: #217346; }
.export-btn--pdf { color: #C0392B; border: 1.5px solid #FFCDD2; }
.export-btn--pdf:hover { background: rgba(192,57,43,0.08); border-color: #C0392B; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

/* ── Tabla ──────────────────────────────── */
.data-card {
  background: white; border-radius: 12px;
  border: 1px solid #E8EEF4; box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .data-card { background: #1D293D; border-color: #3D5069; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; padding: 12px 16px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
  color: #7A90A0; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .data-table th { background: #162033; border-color: #3D5069; color: #64748B; }
.data-table td { padding: 12px 16px; font-size: 13.5px; color: #1A2B3C; border-bottom: 1px solid #F0F4F8; vertical-align: middle; }
.dark .data-table td { color: #E2E8F0; border-color: #3D5069; }
.data-table tbody tr:hover { background: #F8FAFC; }
.dark .data-table tbody tr:hover { background: rgba(255,255,255,0.04); }
.data-table tbody tr:last-child td { border-bottom: none; }

.cell-name { display: flex; align-items: center; gap: 10px; }
.cell-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.cell-name-txt { font-weight: 600; }

.cell-objetivo { font-size: 12.5px; color: #7A90A0; max-width: 200px; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.avatars-stack { display: flex; }
.stack-avatar {
  width: 26px; height: 26px; border-radius: 50%; border: 2px solid white;
  color: white; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-left: -6px; flex-shrink: 0;
}
.stack-avatar:first-child { margin-left: 0; }
.dark .stack-avatar { border-color: #1D293D; }
.stack-more {
  width: 26px; height: 26px; border-radius: 50%; border: 2px solid white;
  background: #E8EEF4; color: #7A90A0; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-left: -6px;
}
.dark .stack-more { background: #3D5069; border-color: #1D293D; color: #94A3B8; }

.cell-actions { white-space: nowrap; }

.badge { display: inline-block; font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.badge--green  { background: rgba(26,145,82,0.12); color: #1A6B42; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #8A5800; }
.badge--gray   { background: rgba(112,113,115,0.12); color: #606060; }
.dark .badge--green  { background: rgba(74,222,128,0.15);  color: #4ADE80; }
.dark .badge--yellow { background: rgba(251,191,36,0.18);  color: #FBBF24; }
.dark .badge--gray   { background: rgba(148,163,184,0.18); color: #94A3B8; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }
.dark .badge--blue   { background: rgba(96,165,250,0.18);  color: #60A5FA; }

.action-btn {
  background: none; border: none; color: #7A90A0; cursor: pointer;
  padding: 5px; border-radius: 6px; transition: color 0.12s, background 0.12s;
  display: inline-flex; align-items: center; vertical-align: middle;
}
.action-btn:hover { color: #133C65; background: #EBF3FF; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { color: #93B8D8; background: rgba(147,184,216,0.12); }

/* ── Modal ──────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10,24,40,0.5);
  backdrop-filter: blur(3px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: 16px; padding: 28px;
  width: 100%; max-width: 560px; position: relative;
  box-shadow: 0 24px 80px rgba(19,60,101,0.22); max-height: 90vh; overflow-y: auto;
}
.modal-box--lg { max-width: 660px; }
.dark .modal-box { background: #1D293D; }

.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 7px;
  background: #F4F6F8; border: none; color: #7A90A0; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.12s;
}
.modal-close:hover { background: #E8EEF4; }
.dark .modal-close { background: #162033; }

.modal-title { font-size: 19px; font-weight: 700; color: #133C65; margin-bottom: 2px; }
.dark .modal-title { color: #E2E8F0; }
.modal-subtitle { font-size: 13px; color: #7A90A0; margin-bottom: 20px; }

.modal-comite-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.comite-icon {
  width: 44px; height: 44px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

/* ── Comité meta row ────────────────────── */
.comite-meta {
  display: flex; gap: 0; margin-bottom: 18px;
  background: #F8FAFC; border: 1px solid #E8EEF4; border-radius: 10px; overflow: hidden;
}
.dark .comite-meta { background: #162033; border-color: #3D5069; }
.meta-item {
  flex: 1; display: flex; flex-direction: column; gap: 3px;
  padding: 12px 16px; border-right: 1px solid #E8EEF4;
}
.dark .meta-item { border-color: #3D5069; }
.meta-item:last-child { border-right: none; }
.meta-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #7A90A0; }
.meta-value { font-size: 14px; font-weight: 700; color: #133C65; }
.dark .meta-value { color: #E2E8F0; }

/* ── Detalle tabla ──────────────────────── */
.detail-members-label {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
  color: #7A90A0; margin-bottom: 10px;
}

.detail-table { border: 1px solid #E8EEF4; border-radius: 10px; overflow: hidden; }
.dark .detail-table { border-color: #3D5069; }

.detail-row {
  display: grid; grid-template-columns: 1fr 1.8fr 0.8fr;
  padding: 11px 16px; border-bottom: 1px solid #F0F4F8; align-items: center; gap: 12px;
}
.detail-row--2col { grid-template-columns: 1fr 1.8fr; }
.dark .detail-row { border-color: #3D5069; }
.detail-row:last-child { border-bottom: none; }

.detail-row--head {
  background: #F8FAFC; padding: 9px 16px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #7A90A0;
}
.dark .detail-row--head { background: #162033; color: #64748B; }

.detail-role { font-size: 13px; font-weight: 600; color: #133C65; }
.dark .detail-role { color: #93B8D8; }
.detail-person { display: flex; align-items: center; gap: 9px; }
.detail-person span { font-size: 13.5px; color: #1A2B3C; font-weight: 500; }
.dark .detail-person span { color: #E2E8F0; }
.vacante-txt { color: #B0C0D0 !important; font-style: italic; }

/* ── Edit slots ─────────────────────────── */
.edit-slots { display: flex; flex-direction: column; gap: 14px; margin-bottom: 22px; }
.edit-slot { display: flex; flex-direction: column; gap: 5px; }
.slot-role { font-size: 12.5px; font-weight: 700; color: #133C65; }
.dark .slot-role { color: #93B8D8; }

/* ── New slots (form) ───────────────────── */
.new-slots { display: flex; flex-direction: column; gap: 8px; }
.new-slot-row { display: grid; grid-template-columns: 160px 1fr 30px; gap: 8px; align-items: start; }
.slot-role-input {
  height: 40px; padding: 0 10px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.dark .slot-role-input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.slot-role-input:focus { border-color: #133C65; }

.slot-remove-btn {
  height: 40px; width: 30px; background: none; border: none; color: #B0C0D0;
  cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center;
  transition: color 0.12s, background 0.12s;
}
.slot-remove-btn:hover { color: #C0392B; background: rgba(192,57,43,0.08); }

.btn-add-slot {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px dashed #D4E4F4; padding: 7px 14px;
  border-radius: 8px; cursor: pointer; margin-top: 4px; transition: all 0.15s;
}
.btn-add-slot:hover { background: #EBF3FF; border-color: #133C65; }

/* ── Autocomplete ───────────────────────── */
.autocomplete-wrap { position: relative; }
.autocomplete-wrap--inline {}

.autocomplete-input-wrap { position: relative; display: flex; align-items: center; }
.ac-search-icon { position: absolute; left: 11px; color: #7A90A0; pointer-events: none; z-index: 1; }
.autocomplete-input {
  width: 100%; height: 40px; padding: 0 68px 0 32px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
  transition: border-color 0.15s;
}
.dark .autocomplete-input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.autocomplete-input:focus { border-color: #133C65; }

.ac-selected-avatar {
  position: absolute; right: 36px;
  width: 24px; height: 24px; border-radius: 50%;
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
.ac-item-name { font-size: 13.5px; font-weight: 600; color: #1A2B3C; }
.dark .ac-item-name { color: #E2E8F0; }
.ac-item-cedula { font-size: 11px; color: #7A90A0; font-family: monospace; }

.member-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  color: white; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.member-avatar--sm { width: 26px; height: 26px; font-size: 9px; }

/* ── Form ───────────────────────────────── */
.modal-form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field--full { grid-column: 1 / -1; }
.form-field label { font-size: 12.5px; font-weight: 600; color: #4A6070; }
.dark .form-field label { color: #94A3B8; }
.form-field input, .form-field select, .form-field textarea {
  height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.form-field textarea { height: auto; padding: 10px 12px; resize: vertical; }
.dark .form-field input, .dark .form-field select, .dark .form-field textarea {
  background: #162033; border-color: #3D5069; color: #E2E8F0;
}
.form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #133C65; }
.form-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  color: #7A90A0; border-bottom: 1px solid #F0F4F8; padding-bottom: 6px;
}
.dark .form-section-title { border-color: #3D5069; }
.form-hint { font-size: 12.5px; color: #7A90A0; margin-top: -6px; }
.req { color: #C0392B; }

/* ── Color picker ───────────────────────── */
.color-options { display: flex; gap: 8px; padding: 6px 0; }
.color-dot {
  width: 24px; height: 24px; border-radius: 50%; border: 3px solid transparent;
  cursor: pointer; transition: transform 0.12s, border-color 0.12s;
}
.color-dot:hover { transform: scale(1.15); }
.color-dot--active { border-color: #1A2B3C; transform: scale(1.1); }
.dark .color-dot--active { border-color: #E2E8F0; }

/* ── Buttons ────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover { background: #0D2A47; }
.btn-sm { padding: 7px 13px; font-size: 12.5px; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

/* ── Transitions ────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .header-actions { width: 100%; display: flex; gap: 8px; }
  .header-actions .btn-primary { flex: 1; justify-content: center; }
  .data-card { overflow-x: auto; }
  .form-row { grid-template-columns: 1fr; }
  .cell-objetivo { max-width: 120px; }
  .new-slot-row { grid-template-columns: 1fr 1fr 28px; }
}
</style>
