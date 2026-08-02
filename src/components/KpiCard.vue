<template>
  <div class="kpi-card" :class="variant ? `kpi-card--${variant}` : ''">
    <div v-if="$slots.icon" class="kpi-icon">
      <slot name="icon" />
    </div>
    <div class="kpi-body">
      <div class="kpi-value">{{ value }}</div>
      <div class="kpi-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  variant: { type: String, default: '' },
})
</script>

<style scoped>
.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(19, 60, 101, 0.06);
  border: 1px solid #E8EEF4;
  min-width: 0;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.kpi-card:hover {
  box-shadow: 0 4px 20px rgba(19, 60, 101, 0.1);
  transform: translateY(-1px);
}
.dark .kpi-card { background: #1D293D; border-color: #3D5069; }

.kpi-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #EEF4FA;
  color: #133C65;
}
.kpi-card--navy .kpi-icon  { background: #133C65; color: white; }
.kpi-card--green .kpi-icon { background: #DCFCE7; color: #166534; }
.kpi-card--red .kpi-icon   { background: #FEE2E2; color: #991B1B; }
.kpi-card--gold .kpi-icon  { background: #FEF3C7; color: #92400E; }
.kpi-card--yellow .kpi-icon { background: #FEF9C3; color: #854D0E; }

.kpi-body { min-width: 0; }

.kpi-value {
  font-size: 22px;
  font-weight: 800;
  color: #133C65;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.dark .kpi-value { color: #E2E8F0; }

.kpi-label {
  font-size: 12px;
  color: #5A7490;
  margin-top: 2px;
  line-height: 1.3;
}
.dark .kpi-label { color: #64748B; }
</style>
