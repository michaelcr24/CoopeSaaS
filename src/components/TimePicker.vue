<template>
  <div class="tp-wrap" ref="wrapRef">
    <button type="button" class="tp-input" :class="{ 'tp-input--empty': !internalValue, [inputClass]: !!inputClass }" :disabled="disabled" @click="toggle">
      <svg class="tp-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
      <span class="tp-text">{{ displayText }}</span>
    </button>

    <Teleport to="body">
      <Transition name="tp-fade">
        <div v-if="open" ref="popoverRef" class="tp-popover" :style="popoverStyle" @click.stop>
          <div class="tp-cols">
            <div class="tp-col">
              <div class="tp-col-label">Hora</div>
              <div class="tp-col-scroll" ref="hourScrollRef">
                <button
                  v-for="h in hourOptions" :key="h"
                  type="button" class="tp-opt" :class="{ 'tp-opt--selected': h === selHour }"
                  @click="selectHour(h)"
                >{{ pad(h) }}</button>
              </div>
            </div>
            <div class="tp-col">
              <div class="tp-col-label">Min</div>
              <div class="tp-col-scroll" ref="minuteScrollRef">
                <button
                  v-for="m in minuteOptions" :key="m"
                  type="button" class="tp-opt" :class="{ 'tp-opt--selected': m === selMinute }"
                  @click="selectMinute(m)"
                >{{ pad(m) }}</button>
              </div>
            </div>
          </div>

          <div class="tp-footer">
            <button type="button" class="tp-link" @click="selectNow">Ahora</button>
            <button type="button" class="tp-link tp-link--muted" @click="clear">Limpiar</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '--:--' },
  disabled: { type: Boolean, default: false },
  minuteStep: { type: Number, default: 5 },
  inputClass: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const wrapRef = ref(null)
const popoverRef = ref(null)
const hourScrollRef = ref(null)
const minuteScrollRef = ref(null)
const open = ref(false)
const popoverStyle = ref({})
const internalValue = ref(props.modelValue || '')

watch(() => props.modelValue, (v) => { internalValue.value = v || '' })

function pad(n) { return String(n).padStart(2, '0') }

const [initH, initM] = internalValue.value ? internalValue.value.split(':').map(Number) : [null, null]
const selHour = ref(initH)
const selMinute = ref(initM)

const hourOptions = Array.from({ length: 24 }, (_, i) => i)
const minuteOptions = computed(() => {
  const step = props.minuteStep > 0 ? props.minuteStep : 5
  const opts = []
  for (let m = 0; m < 60; m += step) opts.push(m)
  return opts
})

const displayText = computed(() => internalValue.value || props.placeholder)

function emitIfComplete() {
  if (selHour.value != null && selMinute.value != null) {
    const value = `${pad(selHour.value)}:${pad(selMinute.value)}`
    internalValue.value = value
    emit('update:modelValue', value)
  }
}

function selectHour(h) { selHour.value = h; emitIfComplete() }
function selectMinute(m) { selMinute.value = m; emitIfComplete() }

function selectNow() {
  const now = new Date()
  selHour.value = now.getHours()
  const step = props.minuteStep > 0 ? props.minuteStep : 5
  selMinute.value = Math.round(now.getMinutes() / step) * step % 60
  emitIfComplete()
}

function clear() {
  selHour.value = null
  selMinute.value = null
  internalValue.value = ''
  emit('update:modelValue', '')
  open.value = false
}

function scrollToSelected() {
  nextTick(() => {
    hourScrollRef.value?.querySelector('.tp-opt--selected')?.scrollIntoView({ block: 'center' })
    minuteScrollRef.value?.querySelector('.tp-opt--selected')?.scrollIntoView({ block: 'center' })
  })
}

function positionPopover() {
  const el = wrapRef.value?.querySelector('.tp-input')
  if (!el) return
  const rect = el.getBoundingClientRect()
  const popoverWidth = 160
  const popoverHeight = 260
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
    positionPopover()
    scrollToSelected()
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
.tp-wrap { position: relative; width: 100%; }

.tp-input {
  width: 100%; height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C;
  display: flex; align-items: center; gap: 8px; cursor: pointer; outline: none;
  transition: border-color 0.15s;
}
.tp-input:hover { border-color: #A9C6E4; }
.tp-input:focus-visible { border-color: #133C65; }
.tp-input:disabled { opacity: 0.6; cursor: not-allowed; }
.tp-input--empty .tp-text { color: #8CA0B3; }
.tp-icon { color: #7A90A0; flex-shrink: 0; }
.tp-text { flex: 1; text-align: left; font-variant-numeric: tabular-nums; }
.dark .tp-input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.dark .tp-input--empty .tp-text { color: #64748B; }

.tp-popover {
  position: fixed; width: 160px; z-index: 3000;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  box-shadow: 0 10px 30px rgba(19,60,101,0.18);
  padding: 10px; display: flex; flex-direction: column; gap: 8px;
}
.dark .tp-popover { background: #1D293D; border-color: #3D5069; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

.tp-cols { display: flex; gap: 6px; }
.tp-col { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.tp-col-label { font-size: 10.5px; font-weight: 700; color: #7A90A0; text-transform: uppercase; text-align: center; }

.tp-col-scroll {
  display: flex; flex-direction: column; gap: 2px;
  max-height: 168px; overflow-y: auto; scroll-behavior: smooth;
  border: 1px solid #F0F4F8; border-radius: 8px; padding: 3px;
}
.dark .tp-col-scroll { border-color: #2A3B57; }

.tp-opt {
  width: 100%; padding: 6px 0; border: none; background: none; border-radius: 6px;
  font-size: 13px; font-variant-numeric: tabular-nums; color: #1A2B3C; cursor: pointer; text-align: center;
}
.tp-opt:hover { background: #F0F4F8; }
.tp-opt--selected { background: #133C65 !important; color: white; font-weight: 700; }
.dark .tp-opt { color: #E2E8F0; }
.dark .tp-opt:hover { background: #2D3F55; }
.dark .tp-opt--selected { background: #93B8D8 !important; color: #162033; }

.tp-footer { display: flex; justify-content: space-between; border-top: 1px solid #F0F4F8; padding-top: 8px; }
.dark .tp-footer { border-color: #3D5069; }
.tp-link { background: none; border: none; font-size: 12.5px; font-weight: 600; color: #133C65; cursor: pointer; padding: 2px 4px; }
.tp-link--muted { color: #7A90A0; }
.dark .tp-link { color: #93B8D8; }
.dark .tp-link--muted { color: #64748B; }

.tp-fade-enter-active, .tp-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.tp-fade-enter-from, .tp-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
