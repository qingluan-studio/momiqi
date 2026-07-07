<script setup lang="ts">
defineProps<{
  active: string
}>()

defineEmits<{
  change: [tab: string]
}>()

const tabs = [
  { id: 'chat', label: '对话', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { id: 'vision', label: '识图', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z' },
  { id: 'code', label: '代码', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6' },
  { id: 'tools', label: '工具', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { id: 'knowledge', label: '知识库', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20 M8 7v6m4-3v3m4-5v5M6.5 2h11A2.5 2.5 0 0120 4.5v15a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 013 19.5v-15A2.5 2.5 0 016.5 2z' },
]
</script>

<template>
  <nav class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: active === tab.id }"
      @click="$emit('change', tab.id)"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path :d="tab.icon" />
      </svg>
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 8px;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s;
  min-width: 56px;
}

.tab-item.active {
  color: var(--accent);
  background: rgba(99, 102, 241, 0.1);
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
}
</style>
