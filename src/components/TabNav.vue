<template>
  <div class="tabs-wrap">
    <nav class="tabs-nav" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        role="tab"
        class="tab-btn"
        :class="{ 'tab-btn--active': modelValue === tab.key }"
        :aria-selected="modelValue === tab.key"
        @click="$emit('update:modelValue', tab.key)"
      >
        <span v-if="tab.icon" class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count != null" class="tab-count">{{ tab.count }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, required: true },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tabs-wrap::-webkit-scrollbar { display: none; }

.tabs-nav {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(19, 60, 101, 0.06);
  border: 1px solid #E8EEF4;
  flex-wrap: nowrap;
}
.dark .tabs-nav { background: #1D293D; border-color: #3D5069; }

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #5A7490;
  background: transparent;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.tab-btn:hover { background: #F4F6F8; color: #133C65; }
.dark .tab-btn:hover { background: #243553; color: #93B8D8; }

.tab-btn--active {
  background: #133C65;
  color: white;
  box-shadow: 0 2px 8px rgba(19, 60, 101, 0.2);
}

.tab-icon { display: flex; align-items: center; }

.tab-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
  background: rgba(19, 60, 101, 0.1);
  color: #133C65;
}
.tab-btn--active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}
</style>
