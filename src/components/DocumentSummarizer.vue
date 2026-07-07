<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import { renderMarkdown } from '../utils/markdown'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const mode = ref<'text' | 'url'>('text')
const sourceContent = ref('')
const sourceUrl = ref('')
const summaryLength = ref<'short' | 'medium' | 'long'>('medium')
const result = ref('')
const loading = ref(false)
const error = ref('')

const lengthMap = { short: '1-2句话', medium: '3-5句话', long: '详细摘要（要点列表）' }

async function summarize() {
  const text = mode.value === 'text' ? sourceContent.value.trim() : sourceUrl.value.trim()
  if (!text) return

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    let prompt = ''
    if (mode.value === 'url') {
      prompt = `请分析以下网页链接的内容，给出${lengthMap[summaryLength.value]}的摘要。如果无法直接访问，请基于你的知识推测该链接可能包含的内容：

链接: ${text}

请输出：1. 内容摘要 2. 关键要点（如果有）`
    } else {
      prompt = `请对以下内容生成${lengthMap[summaryLength.value]}的摘要：

${text.slice(0, 8000)}

请提取核心要点，用简洁清晰的中文输出。`
    }

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '摘要生成失败'
  } finally {
    loading.value = false
  }
}

function clear() {
  sourceContent.value = ''
  sourceUrl.value = ''
  result.value = ''
}

function pasteFromClipboard() {
  navigator.clipboard.readText().then(t => { sourceContent.value = t }).catch(() => {})
}

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="summarizer">
    <div class="mode-switch">
      <button :class="{ active: mode === 'text' }" @click="mode = 'text'">粘贴文本</button>
      <button :class="{ active: mode === 'url' }" @click="mode = 'url'">网页链接</button>
    </div>

    <textarea
      v-if="mode === 'text'"
      v-model="sourceContent"
      class="source-input"
      :placeholder="'粘贴需要摘要的长文本...\n支持最多 8000 字'"
      rows="5"
    />

    <input
      v-else
      v-model="sourceUrl"
      class="source-input url-input"
      placeholder="输入网页 URL..."
    />

    <div class="controls">
      <div class="length-select">
        <span class="ctrl-label">摘要长度</span>
        <button
          v-for="(label, key) in lengthMap"
          :key="key"
          :class="{ active: summaryLength === key }"
          @click="summaryLength = key"
        >{{ { short: '简短', medium: '适中', long: '详细' }[key] }}</button>
      </div>
      <button v-if="mode === 'text'" class="paste-btn" @click="pasteFromClipboard">从剪贴板粘贴</button>
    </div>

    <div class="actions">
      <button class="primary-btn" :disabled="loading" @click="summarize">
        {{ loading ? '生成中...' : '生成摘要' }}
      </button>
      <button class="clear-btn" @click="clear">清空</button>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-content" v-html="renderMarkdown(result)" />
      <button class="copy-btn" @click="copyResult">复制摘要</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.summarizer {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  height: 100%;
}

.mode-switch {
  display: flex;
  gap: 6px;
}

.mode-switch button {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.mode-switch button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.source-input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  line-height: 1.6;
}

.url-input { resize: none; }

.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.length-select { display: flex; align-items: center; gap: 6px; }

.ctrl-label { font-size: 12px; color: var(--text-tertiary); }

.length-select button {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.length-select button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.paste-btn {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
}

.actions { display: flex; gap: 8px; }

.primary-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:disabled { opacity: 0.5; }

.clear-btn {
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.result-card {
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.result-content { font-size: 13px; line-height: 1.6; margin-bottom: 10px; }
.result-content :deep(h2), .result-content :deep(h3) { margin: 8px 0 4px; }
.result-content :deep(ul), .result-content :deep(ol) { padding-left: 16px; margin: 4px 0; }
.result-content :deep(li) { margin: 3px 0; }

.copy-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
