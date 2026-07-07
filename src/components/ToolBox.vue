<script setup lang="ts">
import { ref } from 'vue'
import PromptLibrary from './PromptLibrary.vue'
import DocumentSummarizer from './DocumentSummarizer.vue'
import ContentGenerator from './ContentGenerator.vue'
import RegexTool from './RegexTool.vue'
import SqlTool from './SqlTool.vue'
import NamingTool from './NamingTool.vue'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const subTab = ref('prompts')

const subTabs = [
  { id: 'prompts', label: 'Prompt' },
  { id: 'summary', label: '摘要' },
  { id: 'content', label: '文案' },
  { id: 'regex', label: '正则' },
  { id: 'sql', label: 'SQL' },
  { id: 'naming', label: '命名' },
]
</script>

<template>
  <div class="tool-box">
    <div class="sub-nav">
      <button
        v-for="t in subTabs"
        :key="t.id"
        :class="{ active: subTab === t.id }"
        @click="subTab = t.id"
      >{{ t.label }}</button>
    </div>

    <div class="sub-content">
      <PromptLibrary v-if="subTab === 'prompts'" :settings="settings" />
      <DocumentSummarizer v-if="subTab === 'summary'" :settings="settings" />
      <ContentGenerator v-if="subTab === 'content'" :settings="settings" />
      <RegexTool v-if="subTab === 'regex'" :settings="settings" />
      <SqlTool v-if="subTab === 'sql'" :settings="settings" />
      <NamingTool v-if="subTab === 'naming'" :settings="settings" />
    </div>
  </div>
</template>

<style scoped>
.tool-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sub-nav {
  display: flex;
  gap: 2px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.sub-nav button {
  padding: 5px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.sub-nav button.active {
  background: var(--bg-secondary);
  color: var(--accent);
  font-weight: 600;
}

.sub-content {
  flex: 1;
  overflow: hidden;
}
</style>
