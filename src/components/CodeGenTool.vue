<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import { renderMarkdown } from '../utils/markdown'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
  { value: 'html', label: 'HTML/CSS' },
]

const selectedLang = ref('python')
const requirement = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')

async function generate() {
  if (!requirement.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const prompt = `你是一个资深${languages.find(l=>l.value===selectedLang.value)?.label}开发者。请根据以下需求生成代码：

语言: ${languages.find(l=>l.value===selectedLang.value)?.label}
需求: ${requirement.value}

请只输出代码块（用\`\`\`包裹），加上简要的注释说明关键部分。代码要可直接运行、健壮、有错误处理。`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '生成失败'
  } finally {
    loading.value = false
  }
}

const quickPrompts = [
  '读写 JSON 文件',
  'HTTP GET 请求并解析',
  '字符串去重排序',
  '正则匹配邮箱提取',
  '多线程并发下载',
]

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="code-tool">
    <div class="tool-header">
      <h2>代码生成</h2>
    </div>

    <div class="lang-select">
      <button
        v-for="lang in languages"
        :key="lang.value"
        class="lang-chip"
        :class="{ active: selectedLang === lang.value }"
        @click="selectedLang = lang.value"
      >{{ lang.label }}</button>
    </div>

    <textarea
      v-model="requirement"
      class="req-input"
      placeholder="描述你需要的代码功能..."
      rows="3"
    />

    <div class="quick-prompts">
      <button
        v-for="p in quickPrompts"
        :key="p"
        class="prompt-chip"
        @click="requirement = p"
      >{{ p }}</button>
    </div>

    <button class="gen-btn" :disabled="!requirement.trim() || loading" @click="generate">
      {{ loading ? '生成中...' : '生成代码' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-content" v-html="renderMarkdown(result)" />
      <button class="copy-btn" @click="copyResult">复制代码</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.code-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  height: 100%;
}

.tool-header { display: flex; align-items: center; justify-content: space-between; }
.tool-header h2 { margin: 0; font-size: 18px; }

.lang-select { display: flex; flex-wrap: wrap; gap: 6px; }

.lang-chip {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.1s;
}

.lang-chip.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.req-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.quick-prompts { display: flex; flex-wrap: wrap; gap: 6px; }

.prompt-chip {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.prompt-chip:active { border-color: var(--accent); color: var(--text-secondary); }

.gen-btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.gen-btn:disabled { opacity: 0.5; }

.result-card {
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.result-content {
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 10px;
}

.result-content :deep(pre) {
  background: var(--bg-tertiary);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
}

.result-content :deep(code) { font-family: 'SF Mono', monospace; font-size: 12px; }

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
