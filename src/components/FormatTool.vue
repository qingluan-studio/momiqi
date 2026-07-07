<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const raw = ref('')
const lang = ref('json')
const result = ref('')
const loading = ref(false)
const error = ref('')

const langs = [
  { value: 'json', label: 'JSON', placeholder: '{"name":"张三","age":28,"tags":["AI","Web"]}' },
  { value: 'yaml', label: 'YAML', placeholder: 'server:\n  host: localhost\n  port: 8080' },
  { value: 'toml', label: 'TOML', placeholder: '[package]\nname = "app"\nversion = "1.0"' },
]

async function formatValidate() {
  if (!raw.value.trim()) return
  loading.value = true
  error.value = ''

  const langLabel = langs.find(l => l.value === lang.value)?.label
  const prompt = `你是${langLabel}格式专家。请对以下内容进行格式化和验证。

原始内容:
${raw.value}

请输出：
1. 验证结果（格式是否正确、是否有错误）
2. 格式化后的内容（如有错误请修正）
3. 用\`\`\`${lang.value}包裹格式化结果`

  try {
    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '处理失败'
  } finally {
    loading.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}

function insertSample() {
  raw.value = langs.find(l => l.value === lang.value)?.placeholder || ''
}
</script>

<template>
  <div class="fmt-tool">
    <h3 class="sec-title">格式化/校验工具</h3>

    <div class="lang-select">
      <button v-for="l in langs" :key="l.value" :class="{ active: lang === l.value }" @click="lang = l.value">
        {{ l.label }}
      </button>
    </div>

    <textarea
      v-model="raw"
      class="raw-input"
      :placeholder="langs.find(l => l.value === lang)?.placeholder"
      rows="5"
    />

    <div class="action-row">
      <button class="sample-btn" @click="insertSample">示例</button>
      <button class="gen-btn" :disabled="!raw.trim() || loading" @click="formatValidate">
        {{ loading ? '处理中...' : '格式化校验' }}
      </button>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyResult">复制</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.fmt-tool { padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; height: 100%; }
.sec-title { margin: 0; font-size: 16px; }
.lang-select { display: flex; gap: 5px; }
.lang-select button {
  padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-secondary); font-size: 11px; cursor: pointer;
}
.lang-select button.active { border-color: var(--accent); color: var(--accent); background: rgba(99,102,241,0.1); }
.raw-input {
  width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-primary); font-size: 12px;
  resize: vertical; box-sizing: border-box; line-height: 1.5; font-family: 'SF Mono', monospace;
}
.action-row { display: flex; gap: 8px; }
.sample-btn {
  padding: 10px 16px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-secondary); font-size: 13px; cursor: pointer;
}
.gen-btn {
  flex: 1; padding: 10px; border-radius: 10px; border: none;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
}
.gen-btn:disabled { opacity: 0.5; }
.result-card { padding: 14px; background: var(--bg-secondary); border-radius: 12px; }
.result-text { font-size: 13px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 8px; }
.copy-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-secondary); font-size: 12px; cursor: pointer; }
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
