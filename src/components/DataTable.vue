<template>
  <div class="data-card">
    <div v-if="title || $slots.header" class="card-header-row">
      <h3 class="card-title">{{ title }}</h3>
      <slot name="header" />
    </div>

    <div v-if="$slots.search || $slots.filters" class="filters-bar">
      <slot name="search" />
      <slot name="filters" />
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :class="{ 'td-right': col.align === 'right', [`col-${col.key}`]: true }" :style="col.width ? { width: col.width } : {}">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows || rows.length === 0">
            <td :colspan="columns.length" class="td-empty">
              <slot name="empty">
                {{ emptyText }}
              </slot>
            </td>
          </tr>
          <tr v-for="(row, i) in rows" :key="rowKey ? row[rowKey] : i">
            <td v-for="col in columns" :key="col.key" :class="{ 'td-right': col.align === 'right', 'td-muted': col.muted }">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="i">
                <span v-if="col.badge" :class="['badge', typeof col.badge === 'function' ? col.badge(row[col.key]) : '']">
                  {{ typeof col.badge === 'function' ? row[col.key] : (row[col.key] ?? '—') }}
                </span>
                <span v-else-if="col.html" v-html="row[col.key]"></span>
                <span v-else>{{ row[col.key] ?? '—' }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  emptyText: { type: String, default: 'No hay datos para mostrar.' },
})
</script>

<style scoped>
.data-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(19, 60, 101, 0.06);
  border: 1px solid #E8EEF4;
  overflow: hidden;
}
.dark .data-card { background: #1D293D; border-color: #3D5069; }

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E8EEF4;
}
.dark .card-header-row { border-color: #3D5069; }

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #133C65;
}
.dark .card-title { color: #E2E8F0; }

.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead tr { background: #F8FAFC; }
.dark .data-table thead tr { background: #162033; }

.data-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #5A7490;
  white-space: nowrap;
  border-bottom: 1px solid #E8EEF4;
}
.dark .data-table th { color: #64748B; border-color: #3D5069; }

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #F0F4F8;
  color: #1A2B3C;
}
.dark .data-table td { color: #E2E8F0; border-color: #2A3A50; }

.data-table tr:hover td { background: #F8FAFC; }
.dark .data-table tr:hover td { background: #1A2E47; }

.td-right { text-align: right; }
.td-muted { color: #7A90A0; }
.td-empty { text-align: center; padding: 32px 16px; color: #7A90A0; }

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid #E8EEF4;
}
.dark .card-footer { border-color: #3D5069; }

.filters-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid #E8EEF4;
  flex-wrap: wrap;
}
.dark .filters-bar { border-color: #3D5069; }
</style>
