<template>
  <div class="catalog-card">
    <h3 class="catalog-title">{{ titulo }}</h3>

    <div class="catalog-add">
      <input v-model="nuevoNombre" type="text" placeholder="Agregar nuevo..." @keyup.enter="agregar" />
      <button class="catalog-add-btn" :disabled="!nuevoNombre.trim() || saving" @click="agregar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    <p v-if="error" class="catalog-error">{{ error }}</p>

    <ul class="catalog-list">
      <li v-if="!loading && !items.length" class="catalog-empty">Sin elementos todavía</li>
      <li v-for="item in items" :key="item.id" class="catalog-item" :class="{ 'catalog-item--off': !item.activo }">
        <span class="catalog-item-name">{{ item.nombre }}</span>
        <div class="catalog-item-actions">
          <button class="mini-toggle" :class="{ 'mini-toggle--on': item.activo }" @click="toggle(item)">
            <span class="mini-thumb"></span>
          </button>
          <button class="catalog-remove-btn" title="Eliminar" @click="quitar(item)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCatalogosPersonal } from '../composables/useCatalogosPersonal.js'
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  tipo: { type: String, required: true },
  titulo: { type: String, required: true },
})

const { listByTipo, crear, toggleActivo, eliminar } = useCatalogosPersonal()
const { cooperativaId } = useAuth()

const items = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const nuevoNombre = ref('')

async function cargar() {
  loading.value = true
  const { data, error: err } = await listByTipo(props.tipo)
  if (err) error.value = err.message
  else items.value = data || []
  loading.value = false
}

async function agregar() {
  const nombre = nuevoNombre.value.trim()
  if (!nombre) return
  saving.value = true
  error.value = null
  const { error: err } = await crear(cooperativaId.value, props.tipo, nombre)
  saving.value = false
  if (err) { error.value = err.message; return }
  nuevoNombre.value = ''
  await cargar()
}

async function toggle(item) {
  const { error: err } = await toggleActivo(item.id, !item.activo)
  if (err) { error.value = err.message; return }
  item.activo = !item.activo
}

async function quitar(item) {
  if (!confirm(`¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) return
  const { error: err } = await eliminar(item.id)
  if (err) { error.value = err.message; return }
  items.value = items.value.filter((i) => i.id !== item.id)
}

onMounted(cargar)
</script>

<style scoped>
.catalog-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .catalog-card { background: #1D293D; border-color: #3D5069; }

.catalog-title { font-size: 13.5px; font-weight: 700; color: #133C65; }
.dark .catalog-title { color: #E2E8F0; }

.catalog-add { display: flex; gap: 6px; }
.catalog-add input {
  flex: 1; height: 32px; padding: 0 10px;
  border: 1.5px solid #D4E4F4; border-radius: 6px;
  font-size: 12.5px; font-family: inherit; background: #F8FAFC; color: #1A2B3C; outline: none;
}
.dark .catalog-add input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.catalog-add input:focus { border-color: #133C65; background: white; }

.catalog-add-btn {
  width: 32px; height: 32px; border-radius: 6px; border: none;
  background: #133C65; color: white; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.catalog-add-btn:hover:not(:disabled) { background: #0D2A47; }
.catalog-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.catalog-error { font-size: 12px; color: #C0392B; }

.catalog-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; max-height: 220px; overflow-y: auto; }
.catalog-empty { font-size: 12px; color: #7A90A0; padding: 6px 2px; }

.catalog-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 7px 4px; border-bottom: 1px solid #F0F4F8;
}
.dark .catalog-item { border-color: #2A3B57; }
.catalog-item:last-child { border-bottom: none; }
.catalog-item-name { font-size: 13px; color: #1A2B3C; }
.dark .catalog-item-name { color: #E2E8F0; }
.catalog-item--off .catalog-item-name { color: #A8B8C8; text-decoration: line-through; }

.catalog-item-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.catalog-remove-btn {
  width: 20px; height: 20px; border-radius: 5px; border: none; background: none;
  color: #B8C4CE; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, background 0.15s;
}
.catalog-remove-btn:hover { color: #C0392B; background: rgba(192,57,43,0.1); }

.mini-toggle {
  width: 32px; height: 18px; border-radius: 9px;
  background: #D4E4F4; border: none; cursor: pointer;
  position: relative; transition: background 0.2s; flex-shrink: 0;
}
.mini-toggle--on { background: #133C65; }
.mini-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 14px; height: 14px; border-radius: 50%;
  background: white; transition: transform 0.2s; display: block;
}
.mini-toggle--on .mini-thumb { transform: translateX(14px); }
</style>
