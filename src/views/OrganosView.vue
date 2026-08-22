<template>
  <div class="module-page">

    <div v-if="pageError" class="convoc-estado convoc-pending" style="border-color:#F5C6C0; color:#C0392B;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ pageError }}</span>
    </div>

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

      <div v-if="orgLoading" class="empty-state">Cargando…</div>

      <div v-else class="organs-grid">
        <div v-for="org in organs" :key="org.id" class="organ-card">
          <div class="organ-header">
            <div class="organ-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h3 class="organ-name">{{ org.name }}</h3>
              <span class="organ-period">{{ org.period ? `Período ${org.period}` : 'Sin período definido' }}</span>
            </div>
          </div>

          <div class="organ-members">
            <div class="members-label">Integrantes ({{ org.members.length }})</div>
            <div v-for="m in org.members.slice(0, 3)" :key="m.id" class="member-row">
              <div class="member-avatar" :style="{ background: m.asociado?.color ?? '#C5D5E5' }">
                {{ m.asociado?.initials ?? '?' }}
              </div>
              <div class="member-info">
                <span class="member-name">{{ m.asociado?.name ?? 'Vacante' }}</span>
                <span class="member-role">{{ m.role }}</span>
              </div>
            </div>
            <div v-if="!org.members.length" class="members-more">Sin integrantes registrados</div>
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

        <div v-if="!organs.length" class="empty-state">
          Sin órganos registrados todavía. Crea el primero con "Nuevo órgano".
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
            <p class="detail-page-subtitle">{{ selectedOrgan.period ? `Período ${selectedOrgan.period} · ` : '' }}{{ selectedOrgan.members.length }} integrantes</p>
          </div>
        </div>
      </div>

      <TabNav v-model="detailTab" :tabs="tabsList" />

      <div v-if="detailLoading" class="empty-state">Cargando…</div>

      <template v-else>
        <!-- ── Sesiones y actas ── -->
        <div v-if="detailTab === 'sesiones'" class="detail-section detail-section--full">
          <div class="section-head">
            <h3 class="section-title">Sesiones y actas</h3>
            <button class="btn-primary btn-sm" @click="openSesionModal()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva sesión
            </button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tema</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acta</th>
                  <th class="th-actions">Acc.</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sesion in sesiones" :key="sesion.id">
                  <td class="cell-bold">{{ sesion.tema }}</td>
                  <td>{{ capitalize(sesion.tipo) }}</td>
                  <td>{{ sesion.fecha }}</td>
                  <td><span class="badge" :class="'badge--' + sesion.estadoClass">{{ sesion.estado }}</span></td>
                  <td>
                    <button v-if="sesion.hasActa" class="acta-link" @click="verActa(sesion)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Ver acta
                    </button>
                    <span v-else class="text-muted-sm">Sin adjuntar</span>
                  </td>
                  <td style="white-space:nowrap">
                    <button class="action-btn" title="Editar" @click="openSesionModal(sesion)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn action-btn--danger" title="Eliminar" @click="eliminarSesionRow(sesion)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="!sesiones.length">
                  <td :colspan="6" class="empty-row">Sin sesiones registradas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Seguimiento de acuerdos ── -->
        <div v-if="detailTab === 'acuerdos'" class="detail-section detail-section--full">
          <div class="section-head">
            <h3 class="section-title">Seguimiento de acuerdos</h3>
            <button class="btn-primary btn-sm" :disabled="!sesiones.length" @click="openAcuerdoModal()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo acuerdo
            </button>
          </div>
          <p v-if="!sesiones.length" class="hint-text">Registra al menos una sesión antes de agregar acuerdos.</p>

          <div class="kpi-row">
            <KpiCard :value="kpiTotal" label="Acuerdos totales" variant="navy" />
            <KpiCard :value="kpiPendientes" label="Pendientes" variant="yellow" />
            <KpiCard :value="kpiEnProceso" label="En proceso" variant="gold" />
            <KpiCard :value="kpiVencidos" label="Vencidos" variant="red" />
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Acuerdo</th>
                  <th>Sesión</th>
                  <th>Responsable</th>
                  <th>Fecha límite</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th class="th-actions">Acc.</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="acuerdo in acuerdos" :key="acuerdo.id">
                  <td class="cell-bold">{{ acuerdo.texto }}</td>
                  <td>
                    <span class="td-sesion">{{ acuerdo.sesionTema }}</span>
                    <span class="td-sub">{{ acuerdo.sesionFecha }}</span>
                  </td>
                  <td>{{ acuerdo.responsableNombre }}</td>
                  <td :class="acuerdo.vencido ? 'txt-red fw-600' : ''">{{ acuerdo.fechaLimite }}</td>
                  <td><span class="badge" :class="'badge--' + acuerdo.estadoClass">{{ acuerdo.estado }}</span></td>
                  <td>
                    <div class="prog-wrap">
                      <div class="prog-bg">
                        <div class="prog-fill" :class="acuerdo.vencido ? 'prog--red' : acuerdo.estadoRaw === 'completado' ? 'prog--green' : 'prog--blue'" :style="{ width: acuerdo.progreso + '%' }"></div>
                      </div>
                      <span class="prog-pct">{{ acuerdo.progreso }}%</span>
                    </div>
                  </td>
                  <td style="white-space:nowrap">
                    <button class="action-btn" title="Editar" @click="openAcuerdoModal(acuerdo)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn action-btn--danger" title="Eliminar" @click="eliminarAcuerdoRow(acuerdo)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="!acuerdos.length">
                  <td :colspan="7" class="empty-row">Sin acuerdos registrados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Integrantes ── -->
        <div v-if="detailTab === 'integrantes'" class="detail-section detail-section--full">
          <div class="section-head">
            <h3 class="section-title">Gestión de integrantes</h3>
            <button v-if="!editMode" class="btn-primary btn-sm" @click="startEdit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
          </div>

          <template v-if="!editMode">
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Puesto</th><th>Asociado</th><th>Desde</th></tr></thead>
                <tbody>
                  <tr v-for="m in selectedOrgan.members" :key="m.id">
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
                  <tr v-if="!selectedOrgan.members.length">
                    <td :colspan="3" class="empty-row">Sin integrantes registrados</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <template v-else>
            <div class="edit-slots">
              <div v-for="slot in editSlots.filter(s => !s._delete)" :key="slot.dbId ?? slot" class="edit-slot">
                <div class="edit-slot-head">
                  <input v-model="slot.role" type="text" class="slot-role-input" placeholder="Puesto (ej. Presidente/a)" />
                  <button class="ac-clear" title="Quitar puesto" @click="removeSlot(slot)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="autocomplete-wrap">
                  <div class="autocomplete-input-wrap">
                    <svg class="ac-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
                    <button v-if="slot.asociado" class="ac-clear ac-clear--inset" @mousedown.prevent="clearSlot(slot)" title="Quitar asociado">
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
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
              <button class="btn-outline btn-sm" @click="addSlot">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar puesto
              </button>
            </div>
            <div class="edit-actions">
              <button class="btn-outline btn-sm" @click="cancelEdit">Cancelar</button>
              <button class="btn-primary btn-sm" :disabled="miembrosSaving" @click="saveEdit">Guardar cambios</button>
            </div>
          </template>
        </div>
      </template>
    </template>

    <!-- Modal: nuevo órgano -->
    <div v-if="organoModal.open" class="modal-backdrop">
      <div class="modal-box">
        <button class="modal-close" @click="organoModal.open = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">Nuevo órgano</h3>
        <div class="modal-form">
          <div class="form-field">
            <label>Nombre <span class="req">*</span></label>
            <input v-model="organoModal.nombre" type="text" placeholder="Ej: Comité de Crédito" />
          </div>
          <div class="form-field">
            <label>Período</label>
            <input v-model="organoModal.periodo" type="text" placeholder="Ej: 2024-2026" />
          </div>
          <div class="form-field">
            <label>Descripción</label>
            <textarea v-model="organoModal.descripcion" rows="3" placeholder="Función y alcance del órgano..."></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-outline" @click="organoModal.open = false">Cancelar</button>
            <button class="btn-primary" :disabled="organoModal.saving || !organoModal.nombre.trim()" @click="guardarOrgano">Crear órgano</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: nueva/editar sesión -->
    <div v-if="sesionModal.open" class="modal-backdrop">
      <div class="modal-box">
        <button class="modal-close" @click="sesionModal.open = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">{{ sesionModal.id ? 'Editar sesión' : 'Nueva sesión' }}</h3>
        <div class="modal-form">
          <div class="form-field">
            <label>Tema <span class="req">*</span></label>
            <textarea v-model="sesionModal.tema" rows="2" placeholder="Ej: Revisión de estados financieros"></textarea>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Tipo</label>
              <select v-model="sesionModal.tipo">
                <option value="ordinaria">Ordinaria</option>
                <option value="extraordinaria">Extraordinaria</option>
              </select>
            </div>
            <div class="form-field">
              <label>Estado</label>
              <select v-model="sesionModal.estado">
                <option value="programada">Programada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Fecha <span class="req">*</span></label>
              <DatePicker v-model="sesionModal.fecha" />
            </div>
            <div class="form-field">
              <label>Hora</label>
              <TimePicker v-model="sesionModal.hora" />
            </div>
          </div>
          <div class="form-field">
            <label>Lugar</label>
            <input v-model="sesionModal.lugar" type="text" placeholder="Ej: Sala de sesiones" />
          </div>

          <div v-if="sesionModal.id" class="acta-attach">
            <label>Acta (PDF)</label>
            <div v-if="sesionModal.actaPath" class="acta-attach-row">
              <button class="acta-link" @click="verActaModal">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Ver acta actual
              </button>
              <label class="file-link">Reemplazar<input type="file" accept="application/pdf" hidden @change="onActaFileChange" /></label>
              <button class="acta-remove" @click="quitarActaModal">Quitar</button>
            </div>
            <div v-else class="file-drop">
              <p>Arrastra el acta aquí o <label class="file-link">selecciona el archivo<input type="file" accept="application/pdf" hidden @change="onActaFileChange" /></label></p>
              <small>Solo PDF</small>
            </div>
          </div>
          <p v-else class="hint-text">Guarda la sesión primero para poder adjuntar el acta.</p>

          <div class="modal-actions">
            <button class="btn-outline" @click="sesionModal.open = false">Cancelar</button>
            <button class="btn-primary" :disabled="sesionModal.saving || !sesionModal.tema.trim() || !sesionModal.fecha" @click="guardarSesion">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: nuevo/editar acuerdo -->
    <div v-if="acuerdoModal.open" class="modal-backdrop">
      <div class="modal-box">
        <button class="modal-close" @click="acuerdoModal.open = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">{{ acuerdoModal.id ? 'Editar acuerdo' : 'Nuevo acuerdo' }}</h3>
        <div class="modal-form">
          <div class="form-field">
            <label>Acuerdo <span class="req">*</span></label>
            <textarea v-model="acuerdoModal.texto" rows="3" placeholder="Descripción del acuerdo tomado..."></textarea>
          </div>
          <div class="form-field">
            <label>Sesión <span class="req">*</span></label>
            <select v-model="acuerdoModal.sesionId">
              <option value="" disabled>Seleccionar</option>
              <option v-for="s in sesiones" :key="s.id" :value="s.id">{{ s.tema }} · {{ s.fecha }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Responsable</label>
              <select v-model="acuerdoModal.responsableId">
                <option value="">Sin asignar</option>
                <option v-for="r in responsables" :key="r.id" :value="r.id">{{ r.name }} ({{ r.role }})</option>
              </select>
            </div>
            <div class="form-field">
              <label>Fecha límite</label>
              <DatePicker v-model="acuerdoModal.fechaLimite" />
            </div>
          </div>
          <div class="form-field">
            <label>Estado</label>
            <select v-model="acuerdoModal.estado">
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="completado">Completado</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-outline" @click="acuerdoModal.open = false">Cancelar</button>
            <button class="btn-primary" :disabled="acuerdoModal.saving || !acuerdoModal.texto.trim() || !acuerdoModal.sesionId" @click="guardarAcuerdo">Guardar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useAsociados, initialsOf, colorFor } from '../composables/useAsociados.js'
import { useOrganos } from '../composables/useOrganos.js'
import TabNav from '../components/TabNav.vue'
import KpiCard from '../components/KpiCard.vue'
import DatePicker from '../components/DatePicker.vue'
import TimePicker from '../components/TimePicker.vue'

const { cooperativaId } = useAuth()
const { search: searchAsociados } = useAsociados()
const {
  listOrganos, getOrgano, createOrgano, saveMiembros,
  listSesiones, createSesion, updateSesion, deleteSesion,
  subirActa, reemplazarActa, eliminarActa, getUrlActa,
  listAcuerdosByOrgano, createAcuerdo, updateAcuerdo, deleteAcuerdo,
  listResponsablesDisponibles,
} = useOrganos()

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

const pageError = ref(null)

/* ── Lista de órganos ───────────────────── */
const orgLoading = ref(false)
const organs = ref([])

async function loadOrganos() {
  orgLoading.value = true
  const { data, error: err } = await listOrganos(cooperativaId.value)
  orgLoading.value = false
  if (err) { pageError.value = err.message; return }
  organs.value = data || []
}
onMounted(loadOrganos)

const organoModal = reactive({ open: false, saving: false, nombre: '', periodo: '', descripcion: '' })
function openNewOrgan() {
  organoModal.nombre = ''
  organoModal.periodo = ''
  organoModal.descripcion = ''
  organoModal.open = true
}
async function guardarOrgano() {
  if (!organoModal.nombre.trim()) return
  organoModal.saving = true
  const { data, error: err } = await createOrgano(cooperativaId.value, {
    nombre: organoModal.nombre.trim(), periodo: organoModal.periodo.trim(), descripcion: organoModal.descripcion.trim(),
  })
  organoModal.saving = false
  if (err) { pageError.value = err.message; return }
  organs.value.push(data)
  organoModal.open = false
  await openDetail(data)
}

/* ── Detalle inline ─────────────────────── */
const selectedOrgan = ref(null)
const detailTab = ref('sesiones')
const detailLoading = ref(false)
const sesiones = ref([])
const acuerdos = ref([])
const responsables = ref([])

const tabsList = computed(() => [
  { key: 'sesiones', label: 'Sesiones y actas', count: sesiones.value.length },
  { key: 'acuerdos', label: 'Seguimiento de acuerdos', count: acuerdos.value.length },
  { key: 'integrantes', label: 'Integrantes', count: selectedOrgan.value?.members.length ?? 0 },
])

async function openDetail(org) {
  selectedOrgan.value = org
  detailTab.value = 'sesiones'
  editMode.value = false
  pageError.value = null
  detailLoading.value = true
  const [sesRes, acRes, respRes] = await Promise.all([
    listSesiones(org.id),
    listAcuerdosByOrgano(org.id),
    listResponsablesDisponibles(cooperativaId.value),
  ])
  detailLoading.value = false
  sesiones.value = sesRes.data || []
  acuerdos.value = acRes.data || []
  responsables.value = respRes.data || []
}

function closeDetail() {
  selectedOrgan.value = null
  editMode.value = false
  sesiones.value = []
  acuerdos.value = []
  responsables.value = []
}

/* ── Edición de integrantes ─────────────── */
const editMode = ref(false)
const editSlots = ref([])
const miembrosSaving = ref(false)

function startEdit() {
  editSlots.value = selectedOrgan.value.members.map(m => ({
    dbId: m.id, role: m.role, asociado: m.asociado ? { ...m.asociado } : null,
    query: m.asociado?.name ?? '', open: false, suggestions: [], _delete: false,
  }))
  editMode.value = true
}

function cancelEdit() { editMode.value = false }

function addSlot() {
  editSlots.value.push({ dbId: null, role: '', asociado: null, query: '', open: false, suggestions: [], _delete: false })
}

function removeSlot(slot) {
  if (slot.dbId) { slot._delete = true; slot.open = false }
  else editSlots.value.splice(editSlots.value.indexOf(slot), 1)
}

async function saveEdit() {
  miembrosSaving.value = true
  const { error: err } = await saveMiembros(selectedOrgan.value.id, editSlots.value)
  miembrosSaving.value = false
  if (err) { pageError.value = err.message; return }
  const { data, error: getErr } = await getOrgano(selectedOrgan.value.id)
  if (getErr) { pageError.value = getErr.message; return }
  selectedOrgan.value = data
  const idx = organs.value.findIndex(o => o.id === data.id)
  if (idx !== -1) organs.value[idx] = data
  editMode.value = false
}

/* ── Autocomplete de asociados ──────────── */
async function onSlotInput(slot) {
  const { data } = await searchAsociados(slot.query)
  slot.suggestions = (data || []).map(a => ({ id: a.id, name: a.nombre, cedula: a.cedula, initials: initialsOf(a.nombre), color: colorFor(a.id) }))
  slot.open = true
}
function onSlotBlur(slot) { setTimeout(() => { slot.open = false }, 160) }
function selectSuggestion(slot, a) { slot.asociado = { ...a }; slot.query = a.name; slot.open = false }
function clearSlot(slot) { slot.asociado = null; slot.query = ''; slot.open = false }

/* ── Sesiones y actas ────────────────────── */
const sesionModal = reactive({ open: false, saving: false, id: null, tema: '', tipo: 'ordinaria', fecha: '', hora: '', lugar: '', estado: 'programada', actaPath: null })

function openSesionModal(sesion = null) {
  if (sesion) {
    Object.assign(sesionModal, {
      id: sesion.id, tema: sesion.tema, tipo: sesion.tipo, fecha: sesion.fechaISO,
      hora: sesion.hora, lugar: sesion.lugar, estado: sesion.estadoRaw, actaPath: sesion.actaPath,
    })
  } else {
    Object.assign(sesionModal, { id: null, tema: '', tipo: 'ordinaria', fecha: '', hora: '', lugar: '', estado: 'programada', actaPath: null })
  }
  sesionModal.open = true
}

async function guardarSesion() {
  if (!sesionModal.tema.trim() || !sesionModal.fecha) return
  sesionModal.saving = true
  const payload = { tema: sesionModal.tema.trim(), tipo: sesionModal.tipo, fecha: sesionModal.fecha, hora: sesionModal.hora, lugar: sesionModal.lugar, estado: sesionModal.estado }
  const { data, error: err } = sesionModal.id
    ? await updateSesion(sesionModal.id, payload)
    : await createSesion(selectedOrgan.value.id, payload)
  sesionModal.saving = false
  if (err) { pageError.value = err.message; return }

  if (sesionModal.id) {
    const idx = sesiones.value.findIndex(s => s.id === data.id)
    if (idx !== -1) sesiones.value[idx] = data
  } else {
    sesiones.value.unshift(data)
  }
  sesionModal.id = data.id
  sesionModal.actaPath = data.actaPath
}

function actualizarSesionEnLista(data) {
  const idx = sesiones.value.findIndex(s => s.id === data.id)
  if (idx !== -1) sesiones.value[idx] = data
}

async function onActaFileChange(e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file || !sesionModal.id) return
  sesionModal.saving = true
  const { data, error: err } = sesionModal.actaPath
    ? await reemplazarActa(cooperativaId.value, selectedOrgan.value.id, sesionModal.id, file, sesionModal.actaPath)
    : await subirActa(cooperativaId.value, selectedOrgan.value.id, sesionModal.id, file)
  sesionModal.saving = false
  if (err) { pageError.value = err.message; return }
  sesionModal.actaPath = data.actaPath
  actualizarSesionEnLista(data)
}

async function quitarActaModal() {
  if (!sesionModal.id || !sesionModal.actaPath) return
  const { data, error: err } = await eliminarActa(sesionModal.id, sesionModal.actaPath)
  if (err) { pageError.value = err.message; return }
  sesionModal.actaPath = null
  actualizarSesionEnLista(data)
}

async function abrirUrlActa(path) {
  const { url, error: err } = await getUrlActa(path)
  if (err || !url) { pageError.value = err?.message || 'No se pudo abrir el acta'; return }
  window.open(url, '_blank')
}
function verActa(sesion) { abrirUrlActa(sesion.actaPath) }
function verActaModal() { abrirUrlActa(sesionModal.actaPath) }

async function eliminarSesionRow(sesion) {
  if (!confirm(`¿Eliminar la sesión "${sesion.tema}"? También se eliminarán sus acuerdos.`)) return
  const { error: err } = await deleteSesion(sesion.id, sesion.actaPath)
  if (err) { pageError.value = err.message; return }
  sesiones.value = sesiones.value.filter(s => s.id !== sesion.id)
  acuerdos.value = acuerdos.value.filter(a => a.sesionId !== sesion.id)
}

/* ── Seguimiento de acuerdos ─────────────── */
const kpiTotal = computed(() => acuerdos.value.length)
const kpiPendientes = computed(() => acuerdos.value.filter(a => a.estadoRaw === 'pendiente' && !a.vencido).length)
const kpiEnProceso = computed(() => acuerdos.value.filter(a => a.estadoRaw === 'en_proceso' && !a.vencido).length)
const kpiVencidos = computed(() => acuerdos.value.filter(a => a.vencido).length)

const acuerdoModal = reactive({ open: false, saving: false, id: null, sesionId: '', texto: '', responsableId: '', fechaLimite: '', estado: 'pendiente' })

function openAcuerdoModal(acuerdo = null) {
  if (acuerdo) {
    Object.assign(acuerdoModal, {
      id: acuerdo.id, sesionId: acuerdo.sesionId, texto: acuerdo.texto,
      responsableId: acuerdo.responsableId || '', fechaLimite: acuerdo.fechaLimiteISO || '', estado: acuerdo.estadoRaw,
    })
  } else {
    Object.assign(acuerdoModal, { id: null, sesionId: sesiones.value[0]?.id || '', texto: '', responsableId: '', fechaLimite: '', estado: 'pendiente' })
  }
  acuerdoModal.open = true
}

async function guardarAcuerdo() {
  if (!acuerdoModal.texto.trim() || !acuerdoModal.sesionId) return
  acuerdoModal.saving = true
  const payload = { texto: acuerdoModal.texto.trim(), responsableId: acuerdoModal.responsableId || null, fechaLimite: acuerdoModal.fechaLimite || null, estado: acuerdoModal.estado }
  const { data, error: err } = acuerdoModal.id
    ? await updateAcuerdo(acuerdoModal.id, payload)
    : await createAcuerdo(acuerdoModal.sesionId, payload)
  acuerdoModal.saving = false
  if (err) { pageError.value = err.message; return }

  if (acuerdoModal.id) {
    const idx = acuerdos.value.findIndex(a => a.id === data.id)
    if (idx !== -1) acuerdos.value[idx] = data
  } else {
    acuerdos.value.unshift(data)
  }
  acuerdoModal.open = false
}

async function eliminarAcuerdoRow(acuerdo) {
  if (!confirm('¿Eliminar este acuerdo?')) return
  const { error: err } = await deleteAcuerdo(acuerdo.id)
  if (err) { pageError.value = err.message; return }
  acuerdos.value = acuerdos.value.filter(a => a.id !== acuerdo.id)
}
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

.empty-state { text-align: center; color: #7A90A0; font-style: italic; padding: 30px 14px; }

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

.detail-section {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .detail-section { background: #1D293D; border-color: #3D5069; }
.detail-section--full { width: 100%; }

.section-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 14px 18px; border-bottom: 1px solid #E8EEF4; background: #F8FAFC;
}
.dark .section-head { background: #162033; border-color: #3D5069; }
.section-title { font-size: 13.5px; font-weight: 700; color: #133C65; }
.dark .section-title { color: #E2E8F0; }

.hint-text { font-size: 12.5px; color: #7A90A0; padding: 12px 18px 0; }
.text-muted-sm { font-size: 12px; color: #B0C0D0; font-style: italic; }

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

.td-sesion { display: block; font-weight: 500; }
.td-sub { display: block; font-size: 11.5px; color: #7A90A0; }

/* ── Badges ─────────────────────────────── */
.badge {
  display: inline-flex; align-items: center; font-size: 11.5px; font-weight: 600;
  padding: 3px 9px; border-radius: 12px; white-space: nowrap;
}
.badge--green  { background: rgba(26,145,82,0.12);  color: #1A6B42; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #7A5000; }
.badge--red    { background: rgba(192,57,43,0.12);  color: #922B21; }
.badge--blue   { background: #EBF3FF; color: #133C65; }
.dark .badge--green  { background: rgba(74,222,128,0.18);  color: #4ADE80; }
.dark .badge--yellow { background: rgba(251,191,36,0.18);  color: #FBE24A; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }
.dark .badge--blue   { background: rgba(147,184,216,0.12); color: #93B8D8; }

/* ── KPI strip ──────────────────────────── */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 16px 18px 0; }
@media (max-width: 768px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }

/* ── Progreso ───────────────────────────── */
.prog-wrap { display: flex; align-items: center; gap: 8px; }
.prog-bg   { flex: 1; height: 6px; background: #E8EEF4; border-radius: 3px; overflow: hidden; min-width: 60px; }
.prog-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.prog--green { background: #22C55E; }
.prog--blue  { background: #3B82F6; }
.prog--red   { background: #EF4444; }
.prog-pct  { font-size: 11px; font-weight: 600; color: #4A6070; white-space: nowrap; }
.dark .prog-bg { background: #2D3F55; }
.dark .prog-pct { color: #94A3B8; }

.txt-red { color: #C0392B; }
.dark .txt-red { color: #F87171; }
.fw-600 { font-weight: 600; }

/* ── Acta ───────────────────────────────── */
.acta-link {
  display: inline-flex; align-items: center; gap: 5px; background: none; border: none;
  color: #133C65; font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 0;
}
.acta-link:hover { text-decoration: underline; }
.dark .acta-link { color: #93B8D8; }
.acta-attach { display: flex; flex-direction: column; gap: 6px; }
.acta-attach label { font-size: 12.5px; font-weight: 600; color: #4A6070; }
.dark .acta-attach label { color: #94A3B8; }
.acta-attach-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.acta-remove { background: none; border: none; color: #C0392B; font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 0; }
.acta-remove:hover { text-decoration: underline; }

.file-drop {
  border: 2px dashed #D4E4F4; border-radius: 10px; padding: 18px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-align: center; background: #F8FAFC; transition: border-color 0.15s;
}
.dark .file-drop { background: #162033; border-color: #3D5069; }
.file-drop p { font-size: 13px; color: #4A6070; margin: 0; }
.dark .file-drop p { color: #94A3B8; }
.file-drop small { font-size: 11.5px; color: #B0C0D0; }
.file-link { color: #133C65; font-weight: 600; cursor: pointer; text-decoration: underline; }
.dark .file-link { color: #93B8D8; }

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
.edit-slot { display: flex; flex-direction: column; gap: 6px; }
.edit-slot-head { display: flex; align-items: center; gap: 8px; }
.slot-role-input {
  flex: 1; height: 32px; padding: 0 10px; border: 1.5px solid #D4E4F4; border-radius: 6px;
  font-size: 12.5px; font-weight: 600; color: #133C65; font-family: inherit; outline: none; background: white;
}
.dark .slot-role-input { background: #162033; border-color: #3D5069; color: #93B8D8; }
.slot-role-input:focus { border-color: #133C65; }

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
  background: #F0F4F8; border: none; border-radius: 4px; color: #7A90A0;
  width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.12s; flex-shrink: 0;
}
.ac-clear--inset { position: absolute; right: 10px; }
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

/* ── Botones ────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover:not(:disabled) { background: #0D2A47; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 7px 13px; font-size: 12.5px; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600;
  color: #133C65; background: none; border: 1.5px solid #D4E4F4; padding: 7px 16px;
  border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }
.dark .btn-outline { color: #93B8D8; border-color: #3D5069; }
.dark .btn-outline:hover { background: rgba(147,184,216,0.1); border-color: #93B8D8; }

/* ── Modal ──────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10,24,40,0.5);
  backdrop-filter: blur(3px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: 16px; padding: 28px;
  width: 100%; max-width: 480px; position: relative;
  box-shadow: 0 24px 80px rgba(19,60,101,0.22); max-height: 90vh; overflow-y: auto;
}
.dark .modal-box { background: #1D293D; }
.modal-close {
  position: absolute; top: 14px; right: 14px;
  width: 28px; height: 28px; border-radius: 7px; background: #F4F6F8;
  border: none; color: #7A90A0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #E8EEF4; }
.dark .modal-close { background: #162033; }
.modal-title { font-size: 18px; font-weight: 700; color: #133C65; margin-bottom: 18px; }
.dark .modal-title { color: #E2E8F0; }
.modal-form { display: flex; flex-direction: column; gap: 14px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
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
.req { color: #C0392B; }

/* ── Transitions ────────────────────────── */
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .page-header .btn-primary { width: 100%; justify-content: center; }
  .organs-grid { grid-template-columns: 1fr; }
}
</style>
