<template>
  <div class="home">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Bienvenido, {{ firstName }}</h2>
        <p class="page-subtitle">Resumen general de tu cooperativa</p>
      </div>
    </div>

    <!-- Stat cards — fila única -->
    <div class="stats-row">
      <RouterLink v-for="card in statCards" :key="card.key" :to="card.route" class="stat-card">
        <div class="stat-icon" :style="{ background: card.bg }">
          <span v-html="card.icon"></span>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ card.value }}</span>
          <span class="stat-label">{{ card.label }}</span>
        </div>
        <svg class="stat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </RouterLink>
    </div>

    <!-- Sección inferior: acceso rápido + actividad + calendario -->
    <div class="bottom-grid">

      <!-- Acceso rápido -->
      <div class="home-card">
        <div class="card-header">
          <h3 class="card-title">Acceso rápido</h3>
        </div>
        <div class="quick-links">
          <RouterLink v-for="link in quickLinks" :key="link.route" :to="link.route" class="quick-item">
            <div class="quick-icon" :style="{ background: link.bg }">
              <span v-html="link.icon"></span>
            </div>
            <div class="quick-body">
              <span class="quick-name">{{ link.name }}</span>
              <span class="quick-desc">{{ link.desc }}</span>
            </div>
            <svg class="quick-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </RouterLink>
        </div>
      </div>

      <!-- Actividad reciente -->
      <div class="home-card">
        <div class="card-header">
          <h3 class="card-title">Actividad reciente</h3>
        </div>
        <div class="activity-list">
          <div v-for="item in recentActivity" :key="item.id" class="activity-item">
            <div class="activity-dot" :style="{ background: item.color }"></div>
            <div class="activity-body">
              <span class="activity-text">{{ item.text }}</span>
              <span class="activity-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendario mensual -->
      <div class="home-card">
        <div class="card-header cal-header">
          <h3 class="card-title">Calendario</h3>
          <div class="cal-nav">
            <button class="cal-nav-btn" @click="prevMonth">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="cal-month-label">{{ monthNames[calMonth] }} {{ calYear }}</span>
            <button class="cal-nav-btn" @click="nextMonth">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div class="cal-body">
          <!-- Nombres de días -->
          <div class="cal-weekdays">
            <span v-for="d in dayNames" :key="d">{{ d }}</span>
          </div>

          <!-- Días -->
          <div class="cal-grid">
            <div
              v-for="(cell, i) in calDays"
              :key="i"
              class="cal-cell"
              :class="{
                'cal-cell--out': !cell.inMonth,
                'cal-cell--today': cell.isToday,
                'cal-cell--has-event': cell.events && cell.events.length > 0
              }"
              :title="cell.events && cell.events.map(e => e.title).join('\n')"
            >
              <span class="cal-day-num">{{ cell.day }}</span>
              <div v-if="cell.events && cell.events.length" class="cal-dots">
                <span
                  v-for="ev in cell.events.slice(0,3)"
                  :key="ev.title"
                  class="cal-dot"
                  :style="{ background: ev.color }"
                ></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Eventos del mes -->
        <div class="cal-events">
          <div class="cal-events-label">Este mes</div>
          <div v-if="monthEvents.length === 0" class="cal-no-events">Sin eventos registrados</div>
          <div v-for="ev in monthEvents" :key="ev.title" class="cal-event-item">
            <span class="cal-event-dot" :style="{ background: ev.color }"></span>
            <span class="cal-event-date">{{ formatEventDate(ev.date) }}</span>
            <span class="cal-event-title">{{ ev.title }}</span>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { firstName } = useAuth()

/* ── Stat cards ─────────────────────────── */
const statCards = [
  {
    key: 'personal', label: 'Personal', value: '32', route: '/dashboard/personal',
    bg: 'rgba(19,60,101,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#133C65" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    key: 'asociados', label: 'Asociados', value: '248', route: '/dashboard/asociados',
    bg: 'rgba(26,145,82,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
  {
    key: 'organos', label: 'Órganos Sociales', value: '4', route: '/dashboard/organos',
    bg: 'rgba(196,127,12,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C47F0C" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  {
    key: 'comites', label: 'Comités', value: '6', route: '/dashboard/comites',
    bg: 'rgba(123,63,160,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B3FA0" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  },
  {
    key: 'asambleas', label: 'Asambleas', value: '3', route: '/dashboard/asambleas',
    bg: 'rgba(192,57,43,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  },
]

/* ── Acceso rápido ──────────────────────── */
const quickLinks = [
  {
    name: 'Personal', desc: 'Gestiona el equipo de trabajo', route: '/dashboard/personal',
    bg: 'rgba(19,60,101,0.1)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#133C65" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  },
  {
    name: 'Asociados', desc: 'Registro y estado de socios', route: '/dashboard/asociados',
    bg: 'rgba(26,145,82,0.1)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
  {
    name: 'Asambleas', desc: 'Próximas y pasadas asambleas', route: '/dashboard/asambleas',
    bg: 'rgba(192,57,43,0.1)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  },
  {
    name: 'Comités', desc: 'Comités activos y reuniones', route: '/dashboard/comites',
    bg: 'rgba(123,63,160,0.1)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B3FA0" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  },
]

/* ── Actividad reciente ─────────────────── */
const recentActivity = [
  { id: 1, text: 'Nuevo asociado registrado: M. Rodríguez', time: 'Hace 2 horas', color: '#1A9152' },
  { id: 2, text: 'Asamblea ordinaria programada para el 20 jun', time: 'Hace 5 horas', color: '#133C65' },
  { id: 3, text: 'Acta de Comité de Crédito aprobada', time: 'Ayer', color: '#C47F0C' },
  { id: 4, text: 'Actualización de datos: J. Vargas (Personal)', time: 'Ayer', color: '#7B3FA0' },
  { id: 5, text: 'Nuevo rol creado: Supervisor de módulo', time: 'Hace 2 días', color: '#00808C' },
]

/* ── Calendario ─────────────────────────── */
const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const dayNames   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const now = new Date()
const calMonth = ref(now.getMonth())
const calYear  = ref(now.getFullYear())

// Fechas importantes — se reemplazarán con datos de Supabase
const allEvents = [
  { date: '2026-06-15', title: 'Reunión Comité de Educación', color: '#1A9152' },
  { date: '2026-06-19', title: 'Comité de Crédito', color: '#133C65' },
  { date: '2026-06-20', title: 'Asamblea Ordinaria 2026', color: '#C0392B' },
  { date: '2026-06-28', title: 'Comité de Vigilancia Ambiental', color: '#7B3FA0' },
  { date: '2026-07-10', title: 'Comité de Bienestar', color: '#C47F0C' },
  { date: '2026-07-15', title: 'Reunión Órgano de Vigilancia', color: '#C0392B' },
]

const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

const calDays = computed(() => {
  const year  = calYear.value
  const month = calMonth.value
  const firstDow   = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevTotal   = new Date(year, month, 0).getDate()

  const days = []

  for (let i = 0; i < firstDow; i++) {
    days.push({ day: prevTotal - firstDow + 1 + i, inMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    days.push({
      day: d,
      inMonth: true,
      dateStr: ds,
      isToday: ds === todayStr,
      events: allEvents.filter(e => e.date === ds),
    })
  }

  let next = 1
  while (days.length < 42) {
    days.push({ day: next++, inMonth: false })
  }

  return days
})

const monthEvents = computed(() =>
  allEvents.filter(e => {
    const [y, m] = e.date.split('-').map(Number)
    return y === calYear.value && m === calMonth.value + 1
  }).sort((a, b) => a.date.localeCompare(b.date))
)

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- }
  else calMonth.value--
}
function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ }
  else calMonth.value++
}

function formatEventDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(m)-1]}`
}
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 20px; }

/* Header */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 22px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

.btn-checkin {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13.5px; font-weight: 600; color: white;
  background: #1A9152; border: none; padding: 9px 20px;
  border-radius: 9px; cursor: pointer; transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-checkin:hover { background: #157A44; }

/* ── Stat row ───────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.07);
  border: 1px solid #E8EEF4;
  text-decoration: none;
  transition: box-shadow 0.15s, transform 0.15s;
}
.dark .stat-card { background: #1D293D; border-color: #3D5069; }
.stat-card:hover { box-shadow: 0 4px 16px rgba(19,60,101,0.12); transform: translateY(-1px); }

.stat-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.stat-body { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }

.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #133C65;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}
.dark .stat-value { color: #E2E8F0; }

.stat-label {
  font-size: 11.5px;
  color: #7A90A0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dark .stat-label { color: #64748B; }

.stat-arrow { color: #C5D5E5; flex-shrink: 0; }
.stat-card:hover .stat-arrow { color: #133C65; }

/* ── Bottom grid ────────────────────────── */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 18px;
  align-items: start;
}

/* Cards */
.home-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #E8EEF4;
  box-shadow: 0 1px 4px rgba(19,60,101,0.07);
  overflow: hidden;
}
.dark .home-card { background: #1D293D; border-color: #3D5069; }

.card-header {
  padding: 14px 18px 12px;
  border-bottom: 1px solid #F0F4F8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dark .card-header { border-color: #3D5069; }

.card-title { font-size: 13.5px; font-weight: 700; color: #133C65; }
.dark .card-title { color: #E2E8F0; }

/* Quick links */
.quick-links { display: flex; flex-direction: column; }

.quick-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 18px; text-decoration: none;
  border-bottom: 1px solid #F0F4F8; transition: background 0.12s;
}
.dark .quick-item { border-color: #3D5069; }
.quick-item:last-child { border-bottom: none; }
.quick-item:hover { background: #F8FAFC; }
.dark .quick-item:hover { background: rgba(255,255,255,0.04); }

.quick-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.quick-body { flex: 1; min-width: 0; }
.quick-name { display: block; font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .quick-name { color: #E2E8F0; }
.quick-desc { display: block; font-size: 11.5px; color: #7A90A0; margin-top: 1px; }
.quick-arrow { color: #C5D5E5; flex-shrink: 0; }

/* Activity */
.activity-list { display: flex; flex-direction: column; }

.activity-item {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 11px 18px; border-bottom: 1px solid #F0F4F8;
}
.dark .activity-item { border-color: #3D5069; }
.activity-item:last-child { border-bottom: none; }

.activity-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
}
.activity-body { display: flex; flex-direction: column; gap: 2px; }
.activity-text { font-size: 12.5px; color: #1A2B3C; font-weight: 500; line-height: 1.4; }
.dark .activity-text { color: #E2E8F0; }
.activity-time { font-size: 11px; color: #7A90A0; }

/* ── Calendario ─────────────────────────── */
.cal-header { gap: 0; }

.cal-nav {
  display: flex; align-items: center; gap: 6px;
}

.cal-nav-btn {
  width: 24px; height: 24px; border-radius: 6px;
  background: #F4F6F8; border: none; cursor: pointer; color: #4A6070;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s, color 0.12s;
}
.dark .cal-nav-btn { background: #162033; color: #94A3B8; }
.cal-nav-btn:hover { background: #EBF3FF; color: #133C65; }

.cal-month-label {
  font-size: 12px; font-weight: 700; color: #133C65; white-space: nowrap; min-width: 96px; text-align: center;
}
.dark .cal-month-label { color: #E2E8F0; }

.cal-body { padding: 12px 14px 0; }

.cal-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.cal-weekdays span {
  text-align: center; font-size: 10px; font-weight: 700;
  color: #7A90A0; text-transform: uppercase; letter-spacing: 0.3px;
  padding: 2px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.cal-cell {
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 0 4px; border-radius: 6px; cursor: default;
  min-height: 32px; position: relative;
  transition: background 0.1s;
}
.cal-cell:hover { background: #F0F4F8; }
.dark .cal-cell:hover { background: rgba(255,255,255,0.06); }

.cal-cell--out .cal-day-num { color: #C5D5E5; }
.dark .cal-cell--out .cal-day-num { color: #3D5069; }

.cal-cell--today {
  background: #133C65 !important;
  border-radius: 6px;
}
.cal-cell--today .cal-day-num { color: white !important; font-weight: 800; }

.cal-day-num {
  font-size: 12px; font-weight: 500; color: #1A2B3C; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.dark .cal-day-num { color: #E2E8F0; }

.cal-dots {
  display: flex; gap: 2px; margin-top: 2px;
}
.cal-dot {
  width: 4px; height: 4px; border-radius: 50; flex-shrink: 0;
}

/* Events list */
.cal-events {
  padding: 10px 14px 14px;
  border-top: 1px solid #F0F4F8;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dark .cal-events { border-color: #3D5069; }

.cal-events-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; color: #7A90A0; margin-bottom: 2px;
}

.cal-no-events { font-size: 12px; color: #B0C0D0; }

.cal-event-item {
  display: flex; align-items: center; gap: 7px;
}
.cal-event-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.cal-event-date {
  font-size: 11px; font-weight: 700; color: #7A90A0;
  white-space: nowrap; min-width: 34px;
}
.cal-event-title {
  font-size: 11.5px; color: #1A2B3C; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dark .cal-event-title { color: #E2E8F0; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .bottom-grid { grid-template-columns: 1fr 1fr; }
  .home-card:last-child { grid-column: 1 / -1; }
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .bottom-grid { grid-template-columns: 1fr; }
  .home-card:last-child { grid-column: auto; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .cal-grid-wrap, .calendar-grid { overflow-x: auto; }
  .activity-item { flex-wrap: wrap; }
}
</style>
