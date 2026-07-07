<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const raw = ref('')
const mode = ref('encode')
const result = ref('')
const loading = ref(false)
const error = ref('')

const modes = [
  { value: 'encode', label: 'Base64 编码' },
  { value: 'decode', label: 'Base64 解码' },
  { value: 'urlencode', label: 'URL 编码' },
  { value: 'urldecode', label: 'URL 解码' },
  { value: 'md5', label: 'MD5 哈希' },
  { value: 'sha256', label: 'SHA256 哈希' },
]

async function execute() {
  if (!raw.value.trim()) return
  loading.value = true
  error.value = ''

  const modeLabel = modes.find(m => m.value === mode.value)?.label
  const prompt = `请对以下内容进行${modeLabel}。只输出结果，不要任何说明。

操作: ${modeLabel}
内容: ${raw.value}

输出结果:`

  try {
    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content.trim()
  } catch (err: any) {
    error.value = err.message || '处理失败'
  } finally {
    loading.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="encode-tool">
    <h3 class="sec-title">编解码工具</h3>

    <div class="mode-select">
      <button v-for="m in modes" :key="m.value" :class="{ active: mode === m.value }" @click="mode = m.value">
        {{ m.label }}
      </button>
    </div>

    <textarea
      v-model="raw"
      class="raw-input"
      placeholder="输入原文或编码串..."
      rows="4"
    />

    <button class="gen-btn" :disabled="!raw.trim() || loading" @click="execute">
      {{ loading ? '处理中...' : '执行' }}
    </button>

    <div v-if="result" class="result-card">
      <code class="result-code">{{ result }}</code>
      <button class="copy-btn" @click="copyResult">复制</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.encode-tool { padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; height: 100%; }
.sec-title { margin: 0; font-size: 16px; }
.mode-select { display: flex; flex-wrap: wrap; gap: 4px; }
.mode-select button {
  padding: 4px 9px; border-radius: 6px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-secondary); font-size: 11px; cursor: pointer;
}
.mode-select button.active { border-color: var(--accent); color: var(--accent); background: rgba(99,102,241,0.1); }
.raw-input {
  width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-primary); font-size: 12px;
  resize: vertical; box-sizing: border-box; line-height: 1.5; font-family: 'SF Mono', monospace;
}
.gen-btn {
  padding: 12px; border-radius: 10px; border: none;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
}
.gen-btn:disabled { opacity: 0.5; }
.result-card { padding: 14px; background: var(--bg-secondary); border-radius: 12px; }
.result-code { font-size: 12px; font-family: 'SF Mono', monospace; word-break: break-all; }
.copy-btn { margin-top: 8px; padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-secondary); font-size: 12px; cursor: pointer; display: inline-block; }
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
