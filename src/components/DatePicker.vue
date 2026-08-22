<template>
  <div class="dp-wrap" ref="wrapRef">
    <button type="button" class="dp-input" :class="{ 'dp-input--empty': !internalValue, [inputClass]: !!inputClass }" :disabled="disabled" @click="toggle">
      <svg class="dp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span class="dp-text">{{ displayText }}</span>
    </button>

    <Teleport to="body">
      <Transition name="dp-fade">
        <div v-if="open" ref="popoverRef" class="dp-popover" :style="popoverStyle" @click.stop>
          <div class="dp-header">
            <button type="button" class="dp-nav" @click="prevMonth">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="dp-month-year">
              <select v-model.number="viewMonth" class="dp-select">
                <option v-for="(m, i) in MESES" :key="m" :value="i">{{ m }}</option>
              </select>
              <select v-model.number="viewYear" class="dp-select">
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <button type="button" class="dp-nav" @click="nextMonth">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div class="dp-weekdays">
            <span v-for="d in DIAS" :key="d">{{ d }}</span>
          </div>

          <div class="dp-grid">
            <button
              v-for="cell in gridCells"
              :key="cell.key"
              type="button"
              class="dp-day"
              :class="{
                'dp-day--muted': !cell.inMonth,
                'dp-day--today': cell.isToday,
                'dp-day--selected': cell.isSelected,
                'dp-day--disabled': cell.disabled,
              }"
              :disabled="cell.disabled"
              @click="selectDay(cell)"
            >{{ cell.day }}</button>
          </div>

          <div class="dp-footer">
            <button type="button" class="dp-link" @click="selectToday">Hoy</button>
            <button type="button" class="dp-link dp-link--muted" @click="clear">Limpiar</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'dd/mm/aaaa' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  inputClass: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

const wrapRef = ref(null)
const popoverRef = ref(null)
const open = ref(false)
const popoverStyle = ref({})
const internalValue = ref(props.modelValue || '')

const today = new Date()
const [selY, selM, selD] = internalValue.value ? internalValue.value.split('-').map(Number) : [null, null, null]
const viewYear = ref(selY || today.getFullYear())
const viewMonth = ref(selY ? selM - 1 : today.getMonth())

watch(() => props.modelValue, (v) => { internalValue.value = v || '' })

const displayText = computed(() => {
  if (!internalValue.value) return props.placeholder
  const [y, m, d] = internalValue.value.split('-')
  return `${d}/${m}/${y}`
})

const yearOptions = computed(() => {
  const base = today.getFullYear()
  const years = []
  for (let y = base - 80; y <= base + 15; y++) years.push(y)
  return years
})

function pad(n) { return String(n).padStart(2, '0') }
function iso(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }

const gridCells = computed(() => {
  const y = viewYear.value
  const m = viewMonth.value
  const firstWeekday = new Date(y, m, 1).getDay()
  const daysInThisMonth = new Date(y, m + 1, 0).getDate()
  const daysInPrevMonth = new Date(y, m, 0).getDate()
  const cells = []

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    cells.push(makeCell(y, m - 1, d, false))
  }
  for (let d = 1; d <= daysInThisMonth; d++) {
    cells.push(makeCell(y, m, d, true))
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1]
    const nd = new Date(last.y, last.m, last.day + 1)
    cells.push(makeCell(nd.getFullYear(), nd.getMonth(), nd.getDate(), false))
  }
  return cells
})

function makeCell(y, m, d, inMonth) {
  const dt = new Date(y, m, d)
  const value = iso(dt.getFullYear(), dt.getMonth(), dt.getDate())
  const disabled = !!((props.min && value < props.min) || (props.max && value > props.max))
  return {
    key: value,
    y: dt.getFullYear(), m: dt.getMonth(), day: dt.getDate(),
    inMonth,
    isToday: value === iso(today.getFullYear(), today.getMonth(), today.getDate()),
    isSelected: value === internalValue.value,
    disabled,
  }
}

function selectDay(cell) {
  if (cell.disabled) return
  const value = iso(cell.y, cell.m, cell.day)
  internalValue.value = value
  emit('update:modelValue', value)
  open.value = false
}

function selectToday() {
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
  selectDay({ y: today.getFullYear(), m: today.getMonth(), day: today.getDate(), disabled: false })
}

function clear() {
  internalValue.value = ''
  emit('update:modelValue', '')
  open.value = false
}

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- } else { viewMonth.value-- }
}
function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ } else { viewMonth.value++ }
}

function positionPopover() {
  const el = wrapRef.value?.querySelector('.dp-input')
  if (!el) return
  const rect = el.getBoundingClientRect()
  const popoverWidth = 280
  const popoverHeight = 360
  let left = rect.left
  if (left + popoverWidth > window.innerWidth - 8) left = window.innerWidth - popoverWidth - 8

  const spaceBelow = window.innerHeight - rect.bottom
  const openUpward = spaceBelow < popoverHeight && rect.top > spaceBelow
  popoverStyle.value = openUpward
    ? { bottom: `${window.innerHeight - rect.top + 6}px`, left: `${Math.max(8, left)}px` }
    : { top: `${rect.bottom + 6}px`, left: `${Math.max(8, left)}px` }
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    if (internalValue.value) {
      const [y, m] = internalValue.value.split('-').map(Number)
      viewYear.value = y; viewMonth.value = m - 1
    }
    positionPopover()
  }
}

function onDocClick(e) {
  if (!open.value) return
  if (wrapRef.value?.contains(e.target)) return
  if (popoverRef.value?.contains(e.target)) return
  open.value = false
}
function onScrollOrResize() {
  if (open.value) positionPopover()
}
function onKeydown(e) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onDocClick, true)
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocClick, true)
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.dp-wrap { position: relative; width: 100%; }

.dp-input {
  width: 100%; height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C;
  display: flex; align-items: center; gap: 8px; cursor: pointer; outline: none;
  transition: border-color 0.15s;
}
.dp-input:hover { border-color: #A9C6E4; }
.dp-input:focus-visible { border-color: #133C65; }
.dp-input:disabled { opacity: 0.6; cursor: not-allowed; }
.dp-input--empty .dp-text { color: #8CA0B3; }
.dp-icon { color: #7A90A0; flex-shrink: 0; }
.dp-text { flex: 1; text-align: left; }
.dark .dp-input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.dark .dp-input--empty .dp-text { color: #64748B; }

.dp-popover {
  position: fixed; width: 280px; z-index: 3000;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  box-shadow: 0 10px 30px rgba(19,60,101,0.18);
  padding: 14px; display: flex; flex-direction: column; gap: 10px;
}
.dark .dp-popover { background: #1D293D; border-color: #3D5069; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

.dp-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.dp-nav {
  width: 26px; height: 26px; border-radius: 6px; border: none; background: #F0F4F8; color: #133C65;
  display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
}
.dp-nav:hover { background: #E8EEF4; }
.dark .dp-nav { background: #2D3F55; color: #93B8D8; }
.dark .dp-nav:hover { background: #344a63; }

.dp-month-year { display: flex; gap: 6px; flex: 1; }
.dp-select {
  flex: 1; min-width: 0; height: 26px; padding: 0 4px; font-size: 12.5px; font-weight: 600;
  border: 1px solid #E8EEF4; border-radius: 6px; background: white; color: #133C65; cursor: pointer;
}
.dark .dp-select { background: #162033; border-color: #3D5069; color: #93B8D8; }

.dp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; }
.dp-weekdays span { font-size: 10.5px; font-weight: 700; color: #7A90A0; text-transform: uppercase; }

.dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.dp-day {
  width: 100%; aspect-ratio: 1; border: none; background: none; border-radius: 6px;
  font-size: 12.5px; color: #1A2B3C; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.dp-day:hover:not(:disabled) { background: #F0F4F8; }
.dp-day--muted { color: #C5D5E5; }
.dp-day--today { font-weight: 700; color: #133C65; box-shadow: inset 0 0 0 1.5px #133C65; }
.dp-day--selected { background: #133C65 !important; color: white; font-weight: 700; }
.dp-day--disabled { opacity: 0.35; cursor: not-allowed; }
.dark .dp-day { color: #E2E8F0; }
.dark .dp-day:hover:not(:disabled) { background: #2D3F55; }
.dark .dp-day--muted { color: #445B75; }
.dark .dp-day--today { color: #93B8D8; box-shadow: inset 0 0 0 1.5px #93B8D8; }
.dark .dp-day--selected { background: #93B8D8 !important; color: #162033; }

.dp-footer { display: flex; justify-content: space-between; border-top: 1px solid #F0F4F8; padding-top: 8px; }
.dark .dp-footer { border-color: #3D5069; }
.dp-link { background: none; border: none; font-size: 12.5px; font-weight: 600; color: #133C65; cursor: pointer; padding: 2px 4px; }
.dp-link--muted { color: #7A90A0; }
.dark .dp-link { color: #93B8D8; }
.dark .dp-link--muted { color: #64748B; }

.dp-fade-enter-active, .dp-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dp-fade-enter-from, .dp-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
