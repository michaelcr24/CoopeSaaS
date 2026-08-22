<template>
  <div class="module-page votaciones-root">

    <!-- ══════════════════════════════════════════════════════
         SELECTOR DE MODO
    ══════════════════════════════════════════════════════ -->
    <div class="mode-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="mode-tab"
        :class="{ active: activeMode === tab.key }"
        @click="activeMode = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-hint">{{ tab.hint }}</span>
      </button>
    </div>

    <div v-if="missingAsamblea" class="mode-tabs" style="padding-top:0;">
      <p style="color:#C0392B; font-size:13.5px;">
        Abre este módulo desde una asamblea concreta (paso "Votaciones" en Asambleas) para gestionar su votación.
      </p>
    </div>

    <!-- ══════════════════════════════════════════════════════
         VISTA 1: ASISTENCIA (phone)
    ══════════════════════════════════════════════════════ -->
    <div v-if="activeMode === 'asistencia'" class="phone-wrapper">
      <div class="phone-frame">

        <!-- Header -->
        <div class="app-header">
          <img src="/icono-blanco.png" width="22" alt="Logo" />
          <span class="app-header-title">Lista de asistencia</span>
        </div>

        <!-- Assembly info card -->
        <div class="attend-info-card">
          <div class="assembly-name">{{ assembly.name }}</div>
          <div class="assembly-meta">
            <span>📅 {{ assembly.fecha }}</span>
            <span>📍 {{ assembly.lugar }}</span>
          </div>
          <div class="attend-counter">
            <span class="counter-num">{{ presentCount }}</span>
            <span class="counter-sep">/</span>
            <span class="counter-total">{{ attendees.length }}</span>
            <span class="counter-label">presentes</span>
          </div>
        </div>

        <!-- Search -->
        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Buscar asociado..." class="search-input" />
        </div>

        <!-- Attendees list -->
        <div class="attendee-list">
          <div
            v-for="att in filteredAttendees"
            :key="att.id"
            class="attendee-row"
            :class="{ present: att.present }"
            @click="toggleAttendance(att)"
          >
            <div class="att-avatar" :style="{ background: att.color }">{{ att.initials }}</div>
            <div class="att-info">
              <span class="att-name">{{ att.name }}</span>
              <span class="att-num">{{ att.num }}</span>
            </div>
            <button
              class="toggle-btn"
              :class="{ on: att.present }"
              @click.stop="toggleAttendance(att)"
            >
              <span class="toggle-dot"></span>
            </button>
          </div>
        </div>

        <!-- Footer buttons -->
        <div class="phone-footer">
          <button class="btn-outline-sm" @click="markAll">Marcar todos</button>
          <button class="btn-primary-sm" @click="activeMode = 'voto'">Ir a Votación →</button>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         VISTA 2: VOTACIÓN (phone)
    ══════════════════════════════════════════════════════ -->
    <div v-else-if="activeMode === 'voto'" class="phone-wrapper">
      <div class="phone-frame vote-frame">

        <!-- Header -->
        <div class="app-header">
          <img src="/icono-blanco.png" width="22" alt="Logo" />
          <span class="app-header-title">Votación</span>
        </div>

        <!-- State A: No active election -->
        <div v-if="!activeElection" class="vote-waiting">
          <div class="waiting-icon">⏳</div>
          <p class="waiting-title">Esperando activación</p>
          <p class="waiting-sub">El administrador activará la próxima votación</p>
        </div>

        <!-- State B: Voting in progress -->
        <template v-else-if="activeElection && !userHasVoted">
          <div class="vote-body">
            <div class="vote-election-title">{{ activeElection.title }}</div>
            <p class="vote-instruction">Selecciona un candidato</p>
            <p v-if="voteError" class="vote-instruction" style="color:#C0392B;">{{ voteError }}</p>
            <div class="candidate-cards">
              <div
                v-for="cand in activeElection.candidates"
                :key="cand.id"
                class="candidate-card"
                :class="{ selected: selectedCandidate && selectedCandidate.id === cand.id }"
                @click="selectedCandidate = cand"
              >
                <img v-if="cand.photo" :src="photoSrc(cand.photo)" :alt="cand.name" class="cand-photo" />
                <div v-else class="cand-icon" :style="{ background: cand.color }">{{ cand.icon }}</div>
                <span class="cand-name">{{ cand.name }}</span>
              </div>
            </div>
          </div>
          <div class="phone-footer">
            <button
              class="btn-vote"
              :disabled="!selectedCandidate"
              @click="submitVote"
            >
              Votar
            </button>
          </div>
        </template>

        <!-- State C: Vote registered -->
        <div v-else-if="activeElection && userHasVoted" class="vote-done">
          <div class="vote-checkmark">✅</div>
          <p class="vote-done-title">¡Voto registrado!</p>
          <p class="vote-done-name">{{ selectedCandidate ? selectedCandidate.name : '' }}</p>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         VISTA 3: DASHBOARD (monitor)
    ══════════════════════════════════════════════════════ -->
    <div v-else-if="activeMode === 'dashboard'" class="dashboard-view">

      <!-- KPI Cards -->
      <div class="kpi-row">
        <div class="kpi-card">
          <span class="kpi-value">{{ presentCount }}</span>
          <span class="kpi-label">Presentes</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-value">{{ quorumPercent }}%</span>
          <span class="kpi-label">Quórum</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-value">{{ elections.length }}</span>
          <span class="kpi-label">Total votaciones</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-value">{{ electionsFinished }}</span>
          <span class="kpi-label">Completadas</span>
        </div>
      </div>

      <!-- Two columns -->
      <div class="dash-columns">

        <!-- LEFT: Election queue -->
        <div class="dash-left">
          <div class="col-title">Agenda del día</div>
          <div
            v-for="(elec, idx) in elections"
            :key="elec.id"
            class="queue-item"
            :class="{ 'queue-active': elec.state === 'active', 'queue-done': elec.state === 'finished' }"
          >
            <span class="queue-num">{{ idx + 1 }}</span>
            <span class="queue-title">{{ elec.title }}</span>
            <span
              class="status-badge"
              :class="{
                'badge-pending': elec.state === 'waiting',
                'badge-active': elec.state === 'active',
                'badge-done': elec.state === 'finished',
              }"
            >
              <span v-if="elec.state === 'active'" class="badge-pulse-dot"></span>
              {{ elec.state === 'waiting' ? 'Pendiente' : elec.state === 'active' ? 'En curso' : 'Completada' }}
            </span>
          </div>
        </div>

        <!-- RIGHT: Current election panel -->
        <div class="dash-right">

          <!-- All finished -->
          <div v-if="!currentDashboardElection" class="all-done">
            <div class="all-done-icon">🏆</div>
            <p class="all-done-title">Todas las votaciones han concluido</p>
            <button class="btn-primary-dash" @click="activeMode = 'acta'">Generar acta</button>
          </div>

          <!-- Sub-state: waiting -->
          <template v-else-if="currentDashboardElection.state === 'waiting'">
            <div class="panel-header">
              <h3 class="panel-title">{{ currentDashboardElection.title }}</h3>
              <span class="panel-meta">{{ currentDashboardElection.candidates.length }} candidatos</span>
            </div>

            <div class="candidate-preview-grid">
              <div
                v-for="cand in currentDashboardElection.candidates"
                :key="cand.id"
                class="cand-preview"
              >
                <img v-if="cand.photo" :src="photoSrc(cand.photo)" :alt="cand.name" class="cand-preview-photo" />
                <div v-else class="cand-icon cand-preview-photo" :style="{ background: cand.color }">{{ cand.icon }}</div>
                <span class="cand-preview-name">{{ cand.name }}</span>
              </div>
            </div>

            <!-- Add candidate form -->
            <div class="add-cand-section">
              <button
                v-if="!showAddCandForm"
                class="btn-add-cand"
                @click="showAddCandForm = true"
              >+ Agregar candidato</button>

              <div v-else class="add-cand-form">
                <input
                  v-model="newCandName"
                  type="text"
                  placeholder="Nombre del candidato"
                  class="add-input"
                />
                <select v-model="newCandPhoto" class="add-select">
                  <option value="">— Seleccionar foto —</option>
                  <option value="/Mujer1.png">Mujer 1</option>
                  <option value="/Mujer2.png">Mujer 2</option>
                  <option value="/Hombre1.png">Hombre 1</option>
                  <option value="/Hombre2.png">Hombre 2</option>
                </select>
                <div class="form-row">
                  <button class="btn-save-cand" @click="saveNewCandidate">Guardar</button>
                  <button class="btn-cancel-cand" @click="showAddCandForm = false; newCandName = ''; newCandPhoto = ''">Cancelar</button>
                </div>
              </div>
            </div>

            <button class="btn-start-vote" @click="startElection(currentDashboardElection)">
              ▶ Iniciar votación
            </button>
          </template>

          <!-- Sub-state: active -->
          <template v-else-if="currentDashboardElection.state === 'active'">
            <div class="live-header">
              <span class="live-badge">
                <span class="live-dot"></span>EN VIVO
              </span>
              <h3 class="panel-title">{{ currentDashboardElection.title }}</h3>
            </div>
            <p class="vote-progress">
              {{ totalVotesCast }} / {{ presentCount }} votos emitidos
            </p>

            <div class="bar-list">
              <div v-for="cand in currentDashboardElection.candidates" :key="cand.id" class="bar-row">
                <img v-if="cand.photo" :src="photoSrc(cand.photo)" :alt="cand.name" class="bar-photo" />
                <div v-else class="cand-icon bar-photo" :style="{ background: cand.color }">{{ cand.icon }}</div>
                <div class="bar-info">
                  <span class="bar-name">{{ cand.name }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: barWidth(cand) + '%' }"></div>
                  </div>
                </div>
                <span class="bar-count">{{ cand.votos }}</span>
              </div>
            </div>

            <div class="action-row">
              <button
                class="btn-simulate"
                :disabled="simulating"
                @click="simularVotos"
              >
                {{ simulating ? '⏳ Simulando...' : '⚡ Simular votos' }}
              </button>
              <button class="btn-stop-vote" @click="finalizarVotacion">
                ⏹ Finalizar votación
              </button>
            </div>
          </template>

          <!-- Sub-state: finished (Kahoot-style) -->
          <template v-else-if="currentDashboardElection.state === 'finished'">
            <!-- This means currentDashboardElection is the next non-finished, but if
                 somehow we land here after finishing, show winner screen for activeElection.
                 We use winnerElection computed to display the last finished. -->
          </template>

        </div>
      </div>

      <!-- Winner overlay panel (shown when election just finished) -->
      <div v-if="showWinnerPanel && winnerElection" class="winner-overlay">
        <div class="winner-screen">

          <!-- Heading -->
          <div class="winner-heading">
            {{ winnerElection.type === 'referendum' ? 'RESULTADO' : (winnerElection.winnersCount || 1) > 1 ? 'ELEGIDOS' : 'ELEGIDO' }}
          </div>

          <!-- Single winner -->
          <template v-if="(winnerElection.winnersCount || 1) === 1">
            <img
              v-if="winner(winnerElection).photo"
              :src="photoSrc(winner(winnerElection).photo)"
              :alt="winner(winnerElection).name"
              class="winner-photo-large"
            />
            <div
              v-else
              class="cand-icon winner-photo-large"
              :style="{ background: winner(winnerElection).color }"
            >{{ winner(winnerElection).icon }}</div>
            <div class="winner-name-large">{{ winner(winnerElection).name }}</div>
            <div class="winner-votes">
              {{ winner(winnerElection).votos }} {{ winner(winnerElection).votos === 1 ? 'voto' : 'votos' }}
            </div>
          </template>

          <!-- Multiple winners -->
          <template v-else>
            <div class="multi-winners-row">
              <div
                v-for="w in getWinners(winnerElection)"
                :key="w.id"
                class="multi-winner"
              >
                <img v-if="w.photo" :src="photoSrc(w.photo)" :alt="w.name" class="winner-photo-lg2" />
                <div v-else class="cand-icon winner-photo-lg2" :style="{ background: w.color }">{{ w.icon }}</div>
                <div class="winner-name-lg2">{{ w.name }}</div>
                <div class="winner-votes-lg2">{{ w.votos }} {{ w.votos === 1 ? 'voto' : 'votos' }}</div>
              </div>
            </div>
          </template>

          <div class="runner-up-row">
            <div
              v-for="cand in runnerUps(winnerElection)"
              :key="cand.id"
              class="runner-up"
            >
              <img v-if="cand.photo" :src="photoSrc(cand.photo)" :alt="cand.name" class="runner-photo" />
              <div v-else class="cand-icon runner-photo" :style="{ background: cand.color }">{{ cand.icon }}</div>
              <span class="runner-name">{{ cand.name }}</span>
              <span class="runner-votes">{{ cand.votos }} v.</span>
            </div>
          </div>

          <div class="winner-actions">
            <button
              v-if="nextElectionAfterWinner"
              class="btn-next-election"
              @click="showWinnerPanel = false"
            >
              Siguiente votación →
            </button>
            <button
              v-else
              class="btn-next-election"
              @click="showWinnerPanel = false; activeMode = 'acta'"
            >
              Ir a generar acta →
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════════════
         VISTA 4: ACTA
    ══════════════════════════════════════════════════════ -->
    <div v-else-if="activeMode === 'acta'" class="acta-wrapper">
      <div class="acta-paper">

        <!-- Header -->
        <div class="acta-header">
          <img src="/logo.png" alt="Logo" class="acta-logo" />
          <div class="acta-title-block">
            <h1 class="acta-main-title">ACTA DE ASAMBLEA</h1>
            <h2 class="acta-sub-title">{{ assembly.name }}</h2>
          </div>
        </div>

        <hr class="acta-divider" />

        <!-- General data -->
        <div class="acta-section">
          <h3 class="acta-section-title">Datos Generales</h3>
          <div class="acta-data-grid">
            <div class="acta-data-item">
              <span class="acta-label">Fecha:</span>
              <span class="acta-value">{{ assembly.fecha }}</span>
            </div>
            <div class="acta-data-item">
              <span class="acta-label">Lugar:</span>
              <span class="acta-value">{{ assembly.lugar }}</span>
            </div>
            <div class="acta-data-item">
              <span class="acta-label">Hora inicio:</span>
              <TimePicker v-model="actaHoraInicio" style="flex:1" />
            </div>
            <div class="acta-data-item">
              <span class="acta-label">Hora fin:</span>
              <TimePicker v-model="actaHoraFin" style="flex:1" />
            </div>
            <div class="acta-data-item">
              <span class="acta-label">Nº de acta:</span>
              <input v-model="actaNumero" type="text" placeholder="Ej: 001-2026" class="acta-input" />
            </div>
          </div>
        </div>

        <!-- Attendance table -->
        <div class="acta-section">
          <h3 class="acta-section-title">Asistencia</h3>
          <table class="acta-table">
            <thead>
              <tr>
                <th>Asociado</th>
                <th>Nº Socio</th>
                <th>Asistencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="att in attendees" :key="att.id">
                <td>{{ att.name }}</td>
                <td>{{ att.num }}</td>
                <td>
                  <span :class="att.present ? 'badge-present' : 'badge-absent'">
                    {{ att.present ? 'Presente' : 'Ausente' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Election results -->
        <div class="acta-section">
          <h3 class="acta-section-title">Resultados de Votaciones</h3>
          <div v-for="elec in elections" :key="elec.id" class="acta-election-block">
            <h4 class="acta-election-title">{{ elec.title }}</h4>
            <table class="acta-table">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Votos</th>
                  <th>%</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="cand in elec.candidates"
                  :key="cand.id"
                  :class="{ 'row-winner': isWinner(elec, cand) }"
                >
                  <td>{{ cand.name }}</td>
                  <td>{{ cand.votos }}</td>
                  <td>{{ elecPercent(elec, cand) }}%</td>
                  <td>
                    <span v-if="isWinner(elec, cand)" class="badge-electo">ELECTO ✓</span>
                    <span v-else class="badge-no-electo">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Agreements -->
        <div class="acta-section">
          <h3 class="acta-section-title">Acuerdos</h3>
          <textarea
            v-model="actaAcuerdos"
            class="acta-textarea"
            rows="6"
            placeholder="Registre los acuerdos tomados en la asamblea..."
          ></textarea>
        </div>

        <!-- Signatures -->
        <div class="acta-section acta-signatures">
          <div class="sig-block">
            <div class="sig-line"></div>
            <p class="sig-role">Secretario/a</p>
            <p class="sig-name">Nombre y firma</p>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <p class="sig-role">Presidente/a</p>
            <p class="sig-name">Nombre y firma</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="acta-actions no-print">
          <button class="btn-print" @click="printActa">🖨 Imprimir</button>
          <button class="btn-export" @click="exportActaCSV">📄 Exportar</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useAsociados, initialsOf, colorFor } from '../composables/useAsociados.js'
import { useAsambleas } from '../composables/useAsambleas.js'
import { useVotaciones } from '../composables/useVotaciones.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import TimePicker from '../components/TimePicker.vue'

const route = useRoute()
const { currentUser } = useAuth()
const { getByProfileId } = useAsociados()
const { saveActa: saveActaAsamblea } = useAsambleas()
const {
  loadAsamblea, loadAsistencia, toggleAsistencia, markAllAsistencia,
  ensureVotaciones, loadElecciones,
  startElection: startElectionApi, finalizarVotacion: finalizarVotacionApi,
  addOpcion, submitVote: submitVoteApi, subscribeResultados,
} = useVotaciones()

const asambleaId = computed(() => route.query.asamblea || null)
const modoReal = computed(() => isSupabaseConfigured() && !!asambleaId.value)
const missingAsamblea = computed(() => isSupabaseConfigured() && !asambleaId.value)

// ── TABS ─────────────────────────────────────────────────────────
const tabs = [
  { key: 'asistencia', label: 'Asistencia',  icon: '📋', hint: 'Teléfono' },
  { key: 'voto',       label: 'Votación',    icon: '🗳️',  hint: 'Teléfono' },
  { key: 'dashboard',  label: 'Dashboard',   icon: '📊', hint: 'Monitor'  },
  { key: 'acta',       label: 'Acta',        icon: '📄', hint: 'Documento'},
]
const activeMode = ref('asistencia')

// ── DATOS (demo si no hay Supabase configurado o no se seleccionó asamblea) ──
const DEMO_ASSEMBLY = {
  name: 'Asamblea Ordinaria 2026',
  fecha: '28/06/2026',
  lugar: 'Salón Comunal, Sede Central',
  totalSocios: 248,
}

const DEMO_ATTENDEES = [
  { id:1,  name:'Juan Pérez Mora',      initials:'JP',  color:'#133C65', num:'A-001', present:true  },
  { id:2,  name:'Laura Soto Jiménez',   initials:'LS',  color:'#1A9152', num:'A-002', present:true  },
  { id:3,  name:'Roberto Ureña',        initials:'RU',  color:'#C47F0C', num:'A-003', present:false },
  { id:4,  name:'Carmen Fallas',        initials:'CF',  color:'#7B3FA0', num:'A-004', present:true  },
  { id:5,  name:'Ernesto Vega',         initials:'EV',  color:'#C0392B', num:'A-005', present:false },
  { id:6,  name:'María Rodríguez',      initials:'MR',  color:'#133C65', num:'A-006', present:true  },
  { id:7,  name:'Carlos Solano',        initials:'CS',  color:'#1A9152', num:'A-007', present:true  },
  { id:8,  name:'Ana Vargas',           initials:'AV',  color:'#7B3FA0', num:'A-008', present:true  },
  { id:9,  name:'Luis Jiménez',         initials:'LJ',  color:'#C47F0C', num:'A-009', present:true  },
  { id:10, name:'Patricia Mora',        initials:'PM',  color:'#C0392B', num:'A-010', present:false },
  { id:11, name:'Fernando Castro',      initials:'FC',  color:'#1565C0', num:'A-011', present:true  },
  { id:12, name:'Gloria Herrera',       initials:'GH',  color:'#00808C', num:'A-012', present:true  },
  { id:13, name:'Marcos Salas',         initials:'MS',  color:'#7B3FA0', num:'A-013', present:true  },
  { id:14, name:'Ingrid Quesada',       initials:'IQ',  color:'#C0392B', num:'A-014', present:false },
  { id:15, name:'Rodrigo Blanco',       initials:'RB',  color:'#133C65', num:'A-015', present:true  },
]

const DEMO_ELECTIONS = [
  {
    id: 0, type: 'referendum',
    title: '¿Se somete a votación la agenda?',
    state: 'waiting',
    winnersCount: 1,
    candidates: [
      { id:1, name:'A Favor',    color:'#1A9152', icon:'✓', votos:0 },
      { id:2, name:'En Contra',  color:'#C0392B', icon:'✗', votos:0 },
      { id:3, name:'Abstención', color:'#7A90A0', icon:'—', votos:0 },
    ]
  },
  {
    id: 1, type: 'eleccion',
    title: '1 Propietario Consejo de Administración',
    state: 'waiting',
    winnersCount: 1,
    candidates: [
      { id:1, name:'Ana Rodríguez',  photo:'/Mujer1.png',  votos:0 },
      { id:2, name:'Carmen López',   photo:'/Mujer2.png',  votos:0 },
      { id:3, name:'Luis Méndez',    photo:'/Hombre1.png', votos:0 },
      { id:4, name:'Abstención',     color:'#7A90A0', icon:'—', votos:0 },
    ]
  },
  {
    id: 2, type: 'eleccion',
    title: '2 Propietarios Comité de Vigilancia',
    state: 'waiting',
    winnersCount: 2,
    candidates: [
      { id:1, name:'Carlos Vargas',  photo:'/Hombre1.png', votos:0 },
      { id:2, name:'Roberto Solano', photo:'/Hombre2.png', votos:0 },
      { id:3, name:'Ana Rodríguez',  photo:'/Mujer1.png',  votos:0 },
      { id:4, name:'Abstención',     color:'#7A90A0', icon:'—', votos:0 },
    ]
  }
]

const assembly = ref(isSupabaseConfigured() ? { name: '', fecha: '', lugar: '', totalSocios: 0 } : DEMO_ASSEMBLY)
const attendees = ref(isSupabaseConfigured() ? [] : DEMO_ATTENDEES)
const elections = ref(isSupabaseConfigured() ? [] : DEMO_ELECTIONS)
const miAsociadoId = ref(null)
const loadingDatos = ref(false)

async function cargarTodo() {
  if (!modoReal.value) return
  loadingDatos.value = true
  const [{ data: asambleaData }, { data: asocData }] = await Promise.all([
    loadAsamblea(asambleaId.value),
    getByProfileId(currentUser.value?.id),
  ])
  if (asambleaData) {
    assembly.value = asambleaData
    actaHoraInicio.value = asambleaData.horaInicioReal || ''
    actaHoraFin.value = asambleaData.horaCierreReal || ''
    actaNumero.value = asambleaData.numeroActa || ''
    actaAcuerdos.value = asambleaData.acuerdos || ''
  }
  miAsociadoId.value = asocData?.id ?? null

  const { data: asistenciaData } = await loadAsistencia(asambleaId.value)
  if (asistenciaData) attendees.value = asistenciaData

  await ensureVotaciones(asambleaId.value)
  const { data: eleccionesData } = await loadElecciones(asambleaId.value)
  if (eleccionesData) elections.value = eleccionesData
  loadingDatos.value = false
}

onMounted(cargarTodo)

// ── ASISTENCIA STATE ─────────────────────────────────────────────
const searchQuery = ref('')
const filteredAttendees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return attendees.value
  return attendees.value.filter(
    a => a.name.toLowerCase().includes(q) || a.num.toLowerCase().includes(q)
  )
})

async function toggleAttendance(att) {
  const nuevo = !att.present
  if (modoReal.value) await toggleAsistencia(att.id, nuevo)
  att.present = nuevo
}

async function markAll() {
  const allPresent = attendees.value.every(a => a.present)
  const nuevo = !allPresent
  if (modoReal.value) await markAllAsistencia(asambleaId.value, nuevo)
  attendees.value.forEach(a => { a.present = nuevo })
}

// ── COMPUTED ──────────────────────────────────────────────────────
const presentCount    = computed(() => attendees.value.filter(a => a.present).length)
const quorumPercent   = computed(() => assembly.value.totalSocios ? Math.round(presentCount.value / assembly.value.totalSocios * 100 * 10) / 10 : 0)
const electionsFinished = computed(() => elections.value.filter(e => e.state === 'finished').length)
const activeElection  = computed(() => elections.value.find(e => e.state === 'active') ?? null)
const currentDashboardElection = computed(() => elections.value.find(e => e.state !== 'finished') ?? null)

// ── VOTACIÓN STATE ────────────────────────────────────────────────
const userHasVoted      = ref(false)
const selectedCandidate = ref(null)
const voteError         = ref(null)
const showAddCandForm   = ref(false)
const newCandName       = ref('')
const newCandPhoto      = ref('')
const showWinnerPanel   = ref(false)
const winnerElection    = ref(null)

const totalVotesCast  = computed(() => {
  if (!activeElection.value) return 0
  return activeElection.value.candidates.reduce((s, c) => s + c.votos, 0)
})
const nextElectionAfterWinner = computed(() => {
  if (!winnerElection.value) return null
  const idx = elections.value.findIndex(e => e.id === winnerElection.value.id)
  return elections.value.slice(idx + 1).find(e => e.state !== 'finished') ?? null
})

// Reset voting state y suscripción en vivo cuando cambia la votación activa
let unsubscribeResultados = null
watch(activeElection, (val) => {
  if (unsubscribeResultados) { unsubscribeResultados(); unsubscribeResultados = null }
  if (!val) {
    userHasVoted.value = false
    selectedCandidate.value = null
    return
  }
  if (modoReal.value) {
    unsubscribeResultados = subscribeResultados(val.id, async () => {
      const { data } = await loadElecciones(asambleaId.value)
      if (data) elections.value = data
    })
  }
})

onUnmounted(() => { if (unsubscribeResultados) unsubscribeResultados() })

async function submitVote() {
  if (!selectedCandidate.value || !activeElection.value) return
  voteError.value = null
  if (modoReal.value) {
    if (!miAsociadoId.value) { voteError.value = 'No se encontró tu registro de asociado.'; return }
    const { error: err } = await submitVoteApi(activeElection.value.id, selectedCandidate.value.id, miAsociadoId.value)
    if (err) { voteError.value = err.message; return }
  }
  const cand = activeElection.value.candidates.find(c => c.id === selectedCandidate.value.id)
  if (cand) cand.votos++
  userHasVoted.value = true
}

async function startElection(elec) {
  if (modoReal.value) {
    const { error: err } = await startElectionApi(elec.id)
    if (err) return
  }
  elec.state = 'active'
  userHasVoted.value = false
  selectedCandidate.value = null
}

async function saveNewCandidate() {
  if (!newCandName.value.trim()) return
  const elec = currentDashboardElection.value
  if (!elec) return

  if (modoReal.value) {
    const { data, error: err } = await addOpcion(elec.id, newCandName.value.trim(), elec.candidates.length)
    if (err || !data) return
    const absIdx = elec.candidates.findIndex(c => c.name === 'Abstención')
    const abs = absIdx !== -1 ? elec.candidates.splice(absIdx, 1)[0] : null
    elec.candidates.push({ id: data.id, name: data.texto, icon: initialsOf(data.texto), color: colorFor(data.id), votos: 0 })
    if (abs) elec.candidates.push(abs)
  } else {
    const absIdx = elec.candidates.findIndex(c => c.name === 'Abstención')
    const abs = absIdx !== -1 ? elec.candidates.splice(absIdx, 1)[0] : null
    elec.candidates.push({ id: elec.candidates.length + 1, name: newCandName.value.trim(), photo: newCandPhoto.value, votos: 0 })
    if (abs) { abs.id = elec.candidates.length + 1; elec.candidates.push(abs) }
  }
  newCandName.value  = ''
  newCandPhoto.value = ''
  showAddCandForm.value = false
}

// ── SIMULACIÓN (solo modo demo — nunca escribe votos reales) ─────
let simInterval = null
const simulating = ref(false)

function simularVotos() {
  if (modoReal.value || simulating.value || !activeElection.value) return
  simulating.value = true
  const e = activeElection.value
  const total = presentCount.value
  const weights = [0.47, 0.35, 0.18]
  const targets = e.candidates.map((_, i) => Math.floor(total * (weights[i] !== undefined ? weights[i] : 0.15)))
  const progress = e.candidates.map(() => 0)

  simInterval = setInterval(() => {
    let anyLeft = false
    for (let i = 0; i < e.candidates.length; i++) {
      if (progress[i] < targets[i]) {
        e.candidates[i].votos++
        progress[i]++
        anyLeft = true
      }
    }
    if (!anyLeft) {
      clearInterval(simInterval)
      simInterval = null
      simulating.value = false
    }
  }, 80)
}

function eliminateCrossElected() {
  // If winners of election 1 (Consejo) also appear in election 2 (Comité), remove them
  // (heuristico atado a los ids del set demo; en datos reales simplemente no aplica)
  const consejo = elections.value.find(e => e.id === 1)
  const comite  = elections.value.find(e => e.id === 2)
  if (!consejo || !comite || consejo.state !== 'finished') return
  const winnerNames = new Set(getWinners(consejo).map(c => c.name))
  comite.candidates = comite.candidates.filter(c => c.name === 'Abstención' || !winnerNames.has(c.name))
}

async function finalizarVotacion() {
  if (simInterval) {
    clearInterval(simInterval)
    simInterval = null
  }
  simulating.value = false
  if (!activeElection.value) return

  if (modoReal.value) {
    const { error: err } = await finalizarVotacionApi(activeElection.value.id)
    if (err) return
  }
  winnerElection.value = activeElection.value
  activeElection.value.state = 'finished'
  eliminateCrossElected()
  showWinnerPanel.value = true
}

// ── ACTA STATE ────────────────────────────────────────────────────
const actaHoraInicio = ref('')
const actaHoraFin    = ref('')
const actaNumero     = ref('')
const actaAcuerdos   = ref('')

let actaSaveTimer = null
watch([actaHoraInicio, actaHoraFin, actaNumero, actaAcuerdos], () => {
  if (!modoReal.value) return
  clearTimeout(actaSaveTimer)
  actaSaveTimer = setTimeout(() => {
    saveActaAsamblea(asambleaId.value, {
      horaInicio: actaHoraInicio.value,
      horaCierre: actaHoraFin.value,
      numActa: actaNumero.value,
      acuerdos: actaAcuerdos.value,
      observaciones: '',
    })
  }, 800)
})

function printActa() {
  window.print()
}

function exportActaCSV() {
  const rows = [['Candidato','Votos','%','Resultado']]
  elections.value.forEach(elec => {
    elec.candidates.forEach(c => {
      rows.push([c.name, c.votos, elecPercent(elec, c) + '%', isWinner(elec, c) ? 'ELECTO' : ''])
    })
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'acta-asamblea.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function barWidth(candidate) {
  if (!activeElection.value) return 0
  const total = activeElection.value.candidates.reduce((s, c) => s + c.votos, 0)
  return total > 0 ? Math.round(candidate.votos / total * 100) : 0
}

function getWinners(elec) {
  const count   = elec.winnersCount || 1
  const nonAbs  = elec.candidates.filter(c => c.name !== 'Abstención')
  const sorted  = [...nonAbs].sort((a, b) => b.votos - a.votos)
  return sorted.slice(0, count).filter(c => c.votos > 0)
}

function winner(elec) {
  return getWinners(elec)[0] || elec.candidates[0]
}

function runnerUps(elec) {
  const winners = getWinners(elec)
  const winIds  = new Set(winners.map(w => w.id))
  return [...elec.candidates]
    .sort((a, b) => b.votos - a.votos)
    .filter(c => !winIds.has(c.id))
}

function isWinner(elec, cand) {
  return getWinners(elec).some(w => w.id === cand.id)
}

function elecPercent(elec, cand) {
  const total = elec.candidates.reduce((s, c) => s + c.votos, 0)
  return total > 0 ? Math.round(cand.votos / total * 100) : 0
}

const BASE = import.meta.env.BASE_URL
function photoSrc(path) {
  if (!path) return path
  return BASE + path.replace(/^\//, '')
}
</script>

<style scoped>

/* ── ROOT ─────────────────────────────────────────────────────── */
.votaciones-root {
  padding: 0;
}

/* ── MODE TABS ────────────────────────────────────────────────── */
.mode-tabs {
  display: flex;
  gap: 8px;
  padding: 20px 24px 0;
  background: transparent;
  flex-wrap: wrap;
}
.mode-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 20px;
  border: 2px solid #d0d8e4;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 110px;
}
.mode-tab:hover {
  border-color: #133C65;
}
.mode-tab.active {
  background: #133C65;
  border-color: #133C65;
  color: white;
}
.tab-icon {
  font-size: 20px;
  line-height: 1;
}
.tab-label {
  font-size: 13px;
  font-weight: 600;
}
.tab-hint {
  font-size: 10px;
  opacity: 0.65;
}

/* ── PHONE FRAME ─────────────────────────────────────────────── */
.phone-wrapper {
  padding: 32px 24px;
  display: flex;
  justify-content: center;
}
.phone-frame {
  width: 380px;
  max-width: 100%;
  margin: 0 auto;
  background: white;
  border-radius: 28px;
  border: 8px solid #1A2B3C;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  overflow: hidden;
  min-height: 680px;
  display: flex;
  flex-direction: column;
}

/* ── APP HEADER (phone top bar) ──────────────────────────────── */
.app-header {
  background: #133C65;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  flex-shrink: 0;
}
.app-header-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* ── ATTEND INFO CARD ─────────────────────────────────────────── */
.attend-info-card {
  background: #f0f4f9;
  padding: 14px 16px;
  border-bottom: 1px solid #e0e8f0;
  flex-shrink: 0;
}
.assembly-name {
  font-size: 13px;
  font-weight: 700;
  color: #133C65;
  margin-bottom: 4px;
}
.assembly-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: #667;
  margin-bottom: 8px;
}
.attend-counter {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.counter-num {
  font-size: 28px;
  font-weight: 800;
  color: #1A9152;
}
.counter-sep {
  font-size: 20px;
  color: #999;
}
.counter-total {
  font-size: 20px;
  font-weight: 600;
  color: #444;
}
.counter-label {
  font-size: 13px;
  color: #555;
  margin-left: 4px;
}

/* ── SEARCH BAR ───────────────────────────────────────────────── */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #e8eef4;
  flex-shrink: 0;
}
.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 13px;
  background: transparent;
  color: #333;
}
.search-input::placeholder { color: #aaa; }

/* ── ATTENDEE LIST ────────────────────────────────────────────── */
.attendee-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}
.attendee-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f4f9;
}
.attendee-row:hover { background: #f7fafd; }
.att-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.att-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.att-name {
  font-size: 13px;
  font-weight: 500;
  color: #222;
}
.att-num {
  font-size: 11px;
  color: #888;
}
.toggle-btn {
  width: 38px;
  height: 22px;
  border-radius: 11px;
  background: #ccc;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-btn.on { background: #1A9152; }
.toggle-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
  display: block;
}
.toggle-btn.on .toggle-dot { transform: translateX(16px); }

/* ── PHONE FOOTER ─────────────────────────────────────────────── */
.phone-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e8eef4;
  flex-shrink: 0;
  background: white;
}
.btn-outline-sm {
  flex: 1;
  padding: 9px 0;
  border: 2px solid #133C65;
  border-radius: 8px;
  background: transparent;
  color: #133C65;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-outline-sm:hover { background: #e8f0f8; }
.btn-primary-sm {
  flex: 1;
  padding: 9px 0;
  border: none;
  border-radius: 8px;
  background: #133C65;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary-sm:hover { background: #0d2a47; }

/* ── VOTE FRAME SPECIFICS ─────────────────────────────────────── */
.vote-frame {
  background: #0D2A47;
}
.vote-waiting {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: white;
  text-align: center;
}
.waiting-icon { font-size: 56px; margin-bottom: 16px; }
.waiting-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #c9d8e8;
}
.waiting-sub {
  font-size: 13px;
  color: #7a9ab8;
  line-height: 1.5;
}

.vote-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: white;
}
.vote-election-title {
  font-size: 14px;
  font-weight: 700;
  color: #133C65;
  margin-bottom: 6px;
  line-height: 1.4;
}
.vote-instruction {
  font-size: 12px;
  color: #888;
  margin-bottom: 16px;
}
.candidate-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.candidate-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 2px solid #e0e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  background: white;
}
.candidate-card:hover { border-color: #133C65; background: #f5f8fc; }
.candidate-card.selected {
  border-color: #133C65;
  background: #e8f0f8;
}
.cand-photo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d0dde8;
}
.cand-icon {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  /* default size (mobile candidate card) */
  width: 56px;
  height: 56px;
  font-size: 22px;
}
/* When used as bar-photo (36px) */
.bar-photo.cand-icon { width: 36px; height: 36px; font-size: 15px; }
/* When used as cand-preview-photo (70px) */
.cand-preview-photo.cand-icon { width: 70px; height: 70px; font-size: 28px; }
/* When used as winner-photo-large (120px) */
.winner-photo-large.cand-icon { width: 120px; height: 120px; font-size: 48px; }
/* When used as runner-photo (50px) */
.runner-photo.cand-icon { width: 50px; height: 50px; font-size: 20px; }
.cand-name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}
.btn-vote {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: #133C65;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.btn-vote:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-vote:not(:disabled):hover { background: #0d2a47; }

.vote-done {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  background: white;
}
.vote-checkmark { font-size: 64px; margin-bottom: 16px; animation: pop 0.4s ease; }
.vote-done-title {
  font-size: 20px;
  font-weight: 800;
  color: #1A9152;
  margin-bottom: 8px;
}
.vote-done-name { font-size: 15px; color: #555; }

@keyframes pop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); }
}

/* ── DASHBOARD VIEW ───────────────────────────────────────────── */
.dashboard-view {
  padding: 24px;
  position: relative;
}
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 900px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
.kpi-card {
  background: white;
  border: 1px solid #d8e4ee;
  border-radius: 10px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.kpi-value {
  font-size: 32px;
  font-weight: 800;
  color: #133C65;
  line-height: 1;
}
.kpi-label {
  font-size: 12px;
  color: #778;
  font-weight: 500;
}
.dash-columns {
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 20px;
}
@media (max-width: 800px) {
  .dash-columns { grid-template-columns: 1fr; }
}

/* ── QUEUE (left) ─────────────────────────────────────────────── */
.dash-left {
  background: white;
  border: 1px solid #d8e4ee;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.col-title {
  font-size: 14px;
  font-weight: 700;
  color: #133C65;
  margin-bottom: 16px;
}
.queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  transition: background 0.15s;
}
.queue-item:hover { background: #f4f8fc; }
.queue-active { background: #e8f0f8 !important; }
.queue-done   { opacity: 0.55; }
.queue-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #d0dde8;
  color: #445;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.queue-active .queue-num { background: #133C65; color: white; }
.queue-title {
  flex: 1;
  font-size: 12px;
  color: #333;
  line-height: 1.4;
}
.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.badge-pending { background: #e8edf2; color: #667; }
.badge-active  { background: #e0f0ff; color: #1565C0; }
.badge-done    { background: #e0f8ec; color: #1A9152; }
.badge-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1565C0;
  animation: pulse 1.2s infinite;
  display: inline-block;
}

/* ── PANEL (right) ────────────────────────────────────────────── */
.dash-right {
  background: white;
  border: 1px solid #d8e4ee;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  position: relative;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #133C65;
  flex: 1;
}
.panel-meta {
  font-size: 12px;
  color: #888;
  background: #f0f4f8;
  padding: 3px 10px;
  border-radius: 20px;
}

.candidate-preview-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.cand-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.cand-preview-photo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d0dde8;
}
.cand-preview-name {
  font-size: 11px;
  color: #445;
  text-align: center;
  max-width: 80px;
}

.add-cand-section { margin-bottom: 20px; }
.btn-add-cand {
  padding: 8px 16px;
  border: 2px dashed #99b2c8;
  border-radius: 8px;
  background: transparent;
  color: #556;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-add-cand:hover { border-color: #133C65; color: #133C65; background: #f5f8fc; }

.add-cand-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #f5f8fc;
  border-radius: 10px;
  border: 1px solid #d0dde8;
}
.add-input,
.add-select {
  padding: 9px 12px;
  border: 1px solid #c8d8e8;
  border-radius: 7px;
  font-size: 13px;
  color: #333;
  background: white;
  outline: none;
}
.add-input:focus,
.add-select:focus { border-color: #133C65; }
.form-row { display: flex; gap: 8px; }
.btn-save-cand {
  flex: 1;
  padding: 9px;
  background: #133C65;
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-save-cand:hover { background: #0d2a47; }
.btn-cancel-cand {
  flex: 1;
  padding: 9px;
  background: transparent;
  color: #667;
  border: 1px solid #c0cdd8;
  border-radius: 7px;
  font-size: 13px;
  cursor: pointer;
}
.btn-start-vote {
  width: 100%;
  padding: 14px;
  background: #133C65;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-start-vote:hover { background: #0d2a47; }

/* ── LIVE STATE ───────────────────────────────────────────────── */
.live-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff0f0;
  color: #c0392b;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: 20px;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0392b;
  animation: pulse 1.2s infinite;
  display: inline-block;
}
.vote-progress {
  font-size: 13px;
  color: #667;
  margin-bottom: 20px;
}

.bar-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bar-photo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d0dde8;
  flex-shrink: 0;
}
.bar-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.bar-name { font-size: 13px; font-weight: 500; color: #333; }
.bar-track {
  height: 8px;
  border-radius: 4px;
  background: #e4ecf4;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: #133C65;
  transition: width 0.3s ease;
}
.bar-count {
  font-size: 13px;
  font-weight: 700;
  color: #133C65;
  min-width: 28px;
  text-align: right;
}

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn-simulate {
  flex: 1;
  padding: 11px;
  background: #e8f4e8;
  color: #1A9152;
  border: 2px solid #1A9152;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-simulate:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-simulate:not(:disabled):hover { background: #d0ecdb; }
.btn-stop-vote {
  flex: 1;
  padding: 11px;
  background: transparent;
  color: #c0392b;
  border: 2px solid #c0392b;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-stop-vote:hover { background: #fde8e8; }

/* ── ALL DONE ─────────────────────────────────────────────────── */
.all-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  gap: 16px;
}
.all-done-icon { font-size: 56px; }
.all-done-title { font-size: 18px; font-weight: 700; color: #133C65; }
.btn-primary-dash {
  padding: 12px 28px;
  background: #133C65;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary-dash:hover { background: #0d2a47; }

/* ── WINNER OVERLAY ───────────────────────────────────────────── */
.winner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.winner-screen {
  background: linear-gradient(135deg, #0D2A47 0%, #133C65 100%);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  color: white;
  max-width: 480px;
  width: 100%;
  animation: pop 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.winner-heading {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #F5C518;
  margin-bottom: 16px;
  text-transform: uppercase;
}
.winner-photo-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #F5C518;
  object-fit: cover;
  margin: 0 auto 14px;
  display: block;
}
.winner-name-large {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}
.winner-votes {
  font-size: 14px;
  color: #8fb8d8;
  margin-bottom: 24px;
}
/* Multi-winner layout */
.multi-winners-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.multi-winner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.winner-photo-lg2 {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid #F5C518;
  object-fit: cover;
  display: block;
}
.winner-photo-lg2.cand-icon { width: 90px; height: 90px; font-size: 36px; }
.winner-name-lg2 {
  font-size: 16px;
  font-weight: 800;
  text-align: center;
  max-width: 110px;
}
.winner-votes-lg2 {
  font-size: 12px;
  color: #8fb8d8;
}
.runner-up-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.runner-up {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.runner-photo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #4a7a9c;
}
.runner-name {
  font-size: 11px;
  color: #9ab8cc;
  max-width: 70px;
  text-align: center;
}
.runner-votes {
  font-size: 12px;
  color: #6a9ab8;
}
.winner-actions { margin-top: 8px; }
.btn-next-election {
  padding: 12px 28px;
  background: #F5C518;
  color: #0D2A47;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-next-election:hover { background: #e0b510; }

/* ── PULSE ANIMATION ──────────────────────────────────────────── */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── ACTA ─────────────────────────────────────────────────────── */
.acta-wrapper {
  padding: 32px 24px;
  background: #f0f4f8;
  min-height: calc(100vh - 100px);
}
.acta-paper {
  max-width: 780px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  border-radius: 4px;
  padding: 40px;
}
.acta-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.acta-logo {
  height: 56px;
  object-fit: contain;
  flex-shrink: 0;
}
.acta-title-block { flex: 1; }
.acta-main-title {
  font-size: 22px;
  font-weight: 900;
  color: #133C65;
  letter-spacing: 0.04em;
  margin: 0 0 4px;
}
.acta-sub-title {
  font-size: 14px;
  color: #445;
  margin: 0;
  font-weight: 400;
}
.acta-divider {
  border: none;
  border-top: 2px solid #133C65;
  margin: 0 0 28px;
}

.acta-section { margin-bottom: 28px; }
.acta-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #133C65;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0e8f0;
}

.acta-data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.acta-data-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.acta-label {
  font-size: 13px;
  color: #667;
  font-weight: 600;
  white-space: nowrap;
}
.acta-value {
  font-size: 13px;
  color: #333;
}
.acta-input {
  padding: 6px 10px;
  border: 1px solid #c8d8e8;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  background: #f8fafc;
  outline: none;
  flex: 1;
}
.acta-input:focus { border-color: #133C65; background: white; }

.acta-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.acta-table th {
  background: #f0f4f8;
  color: #133C65;
  font-weight: 700;
  padding: 9px 12px;
  text-align: left;
  border-bottom: 2px solid #d0dde8;
}
.acta-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #eef2f7;
  color: #333;
}
.acta-table tr:last-child td { border-bottom: none; }
.row-winner { background: #fffde7; }

.badge-present {
  background: #e0f8ec;
  color: #1A9152;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}
.badge-absent {
  background: #fde8e8;
  color: #c0392b;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}
.badge-electo {
  background: #e0f8ec;
  color: #1A9152;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}
.badge-no-electo { color: #bbb; font-size: 13px; }

.acta-election-block { margin-bottom: 20px; }
.acta-election-title {
  font-size: 13px;
  font-weight: 600;
  color: #445;
  margin-bottom: 8px;
}

.acta-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #c8d8e8;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  resize: vertical;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
.acta-textarea:focus { border-color: #133C65; }

.acta-signatures {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
  margin-top: 40px;
}
.sig-block {
  flex: 1;
  min-width: 180px;
}
.sig-line {
  border-bottom: 1.5px solid #334;
  margin-bottom: 8px;
  padding-top: 40px;
}
.sig-role {
  font-size: 13px;
  font-weight: 700;
  color: #133C65;
  margin: 0 0 3px;
}
.sig-name { font-size: 12px; color: #889; margin: 0; }

.acta-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e8eef4;
}
.btn-print,
.btn-export {
  padding: 11px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-print {
  background: #133C65;
  color: white;
  border: none;
}
.btn-print:hover { background: #0d2a47; }
.btn-export {
  background: transparent;
  color: #133C65;
  border: 2px solid #133C65;
}
.btn-export:hover { background: #e8f0f8; }

/* ── PRINT ────────────────────────────────────────────────────── */
@media print {
  .mode-tabs, .acta-actions, .no-print { display: none !important; }
  .acta-wrapper { padding: 0; background: white; }
  .acta-paper   { box-shadow: none; padding: 20px; }
}

/* ── DARK MODE ────────────────────────────────────────────────── */
.dark .mode-tab { background: #1e2d3d; border-color: #2e4058; color: #c8d8e8; }
.dark .mode-tab.active { background: #133C65; border-color: #133C65; color: white; }
.dark .phone-frame { border-color: #0a1520; }
.dark .attend-info-card { background: #1a2b3c; border-color: #2e4058; }
.dark .assembly-name { color: #a0c4e8; }
.dark .attendee-row { border-color: #1e2d3d; }
.dark .attendee-row:hover { background: #1a2b3c; }
.dark .att-name { color: #dde8f4; }
.dark .att-num { color: #5a7a9a; }
.dark .phone-footer { background: #111e2b; border-color: #2e4058; }
.dark .kpi-card { background: #1a2b3c; border-color: #2e4058; }
.dark .kpi-label { color: #5a7a9a; }
.dark .dash-left, .dark .dash-right {
  background: #1a2b3c;
  border-color: #2e4058;
}
.dark .col-title { color: #a0c4e8; }
.dark .queue-item:hover { background: #1e2d3d; }
.dark .queue-active { background: #1e3a55 !important; }
.dark .queue-title { color: #c8d8e8; }
.dark .panel-title { color: #a0c4e8; }
.dark .bar-track { background: #2e4058; }
.dark .acta-wrapper { background: #111e2b; }
.dark .acta-paper { background: #1a2b3c; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
.dark .acta-main-title { color: #a0c4e8; }
.dark .acta-sub-title { color: #7a9ab8; }
.dark .acta-divider { border-color: #2e4058; }
.dark .acta-section-title { color: #8ab0cc; border-color: #2e4058; }
.dark .acta-table th { background: #1e2d3d; color: #a0c4e8; border-color: #2e4058; }
.dark .acta-table td { border-color: #1e2d3d; color: #c8d8e8; }
.dark .acta-input { background: #111e2b; border-color: #2e4058; color: #c8d8e8; }
.dark .acta-textarea { background: #111e2b; border-color: #2e4058; color: #c8d8e8; }
.dark .sig-line { border-color: #5a7a9a; }
.dark .sig-role { color: #8ab0cc; }
.dark .acta-actions { border-color: #2e4058; }
.dark .vote-body { background: #1a2b3c; }
.dark .candidate-card {
  background: #1a2b3c;
  border-color: #2e4058;
  color: #c8d8e8;
}
.dark .candidate-card.selected { background: #1e3a55; border-color: #4a8ccc; }
.dark .vote-election-title { color: #a0c4e8; }
.dark .cand-name { color: #dde8f4; }
.dark .vote-done { background: #1a2b3c; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .mode-tabs { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
  .mode-tabs::-webkit-scrollbar { height: 0; }
  .mode-tab { flex-shrink: 0; }
  .dash-columns { grid-template-columns: 1fr; }
  .dash-left, .dash-right { min-width: 0; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
