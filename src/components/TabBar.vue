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
  { id: 'smart', label: '智能', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'dashboard', label: '面板', icon: 'M3 3h7v7H3V3z M14 3h7v7h-7V3z M14 14h7v7h-7V7z M3 14h7v7H3V7z' },
  { id: 'knowledge', label: '知识库', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20 M8 7v6m4-3v3m4-5v5M6.5 2h11A2.5 2.5 0 0120 4.5v15a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 013 19.5v-15A2.5 2.5 0 016.5 2z' },
  { id: 'selflearning', label: '自学习', icon: 'M12 15v-2a3 3 0 003-3h2a5 5 0 01-5 5zM12 9V7a5 5 0 015 5h-2a3 3 0 00-3-3z' },
  { id: 'super', label: '超级', icon: 'M12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26' },
  { id: 'evolution', label: '进化', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
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
  padding: 4px 0;
  padding-bottom: max(4px, env(safe-area-inset-bottom));
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s;
  min-width: 52px;
  flex-shrink: 0;
}

.tab-item.active {
  color: var(--accent);
  background: rgba(99, 102, 241, 0.1);
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}

@media (min-width: 480px) {
  .tab-bar {
    justify-content: space-around;
    overflow-x: visible;
    padding: 6px 4px;
    padding-bottom: max(6px, env(safe-area-inset-bottom));
  }

  .tab-item {
    min-width: 48px;
    padding: 6px 8px;
  }
}
</style>
