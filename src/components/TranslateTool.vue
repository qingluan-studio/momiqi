<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const sourceText = ref('')
const targetLang = ref('en')
const result = ref('')
const loading = ref(false)
const error = ref('')

const langOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'ar', label: 'العربية' },
]

async function translate() {
  if (!sourceText.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const target = langOptions.find(l => l.value === targetLang.value)?.label
    const prompt = `请将以下文本翻译成${target}。只输出翻译结果，不要加任何解释或注释：

${sourceText.value}`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '翻译失败'
  } finally {
    loading.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="translate-tool">
    <div class="tool-header">
      <h2>翻译助手</h2>
    </div>

    <textarea
      v-model="sourceText"
      class="source-input"
      placeholder="输入要翻译的文字..."
      rows="4"
    />

    <div class="lang-select">
      <span class="lang-label">目标语言：</span>
      <select v-model="targetLang" class="lang-dropdown">
        <option v-for="l in langOptions" :key="l.value" :value="l.value">{{ l.label }}</option>
      </select>
    </div>

    <button class="translate-btn" :disabled="!sourceText.trim() || loading" @click="translate">
      {{ loading ? '翻译中...' : '翻译' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyResult">复制</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.translate-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  height: 100%;
}

.tool-header { display: flex; align-items: center; justify-content: space-between; }
.tool-header h2 { margin: 0; font-size: 18px; }

.source-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  line-height: 1.6;
}

.lang-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lang-label { font-size: 13px; color: var(--text-secondary); }

.lang-dropdown {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}

.translate-btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.translate-btn:disabled { opacity: 0.5; }

.result-card {
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.result-text { font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 10px; }

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
