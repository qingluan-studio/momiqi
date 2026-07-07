<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import { renderMarkdown } from '../utils/markdown'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const mode = ref<'generate' | 'review'>('generate')
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
const codeInput = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')

async function generate() {
  if (!requirement.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const langLabel = languages.find(l=>l.value===selectedLang.value)?.label
    const prompt = `你是一个资深${langLabel}开发者。请根据以下需求生成代码：

语言: ${langLabel}
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

async function reviewCode() {
  const code = codeInput.value.trim()
  if (!code) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const langLabel = languages.find(l=>l.value===selectedLang.value)?.label
    const prompt = `你是一个资深代码审查专家。请审查以下${langLabel}代码，从以下维度给出改进建议：

1. 逻辑正确性：是否有 bug 或逻辑错误
2. 安全性：是否有安全漏洞
3. 性能：是否有性能瓶颈
4. 可维护性：代码结构、命名是否合理
5. 最佳实践：是否符合 ${langLabel} 社区最佳实践

请按以上5个维度逐条分析，给出具体的改进代码示例。

待审查代码：
\`\`\`${selectedLang.value}
${code.slice(0, 6000)}
\`\`\``

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '审查失败'
  } finally {
    loading.value = false
  }
}

function execute() {
  if (mode.value === 'generate') generate()
  else reviewCode()
}

function pasteCode() {
  navigator.clipboard.readText().then(t => { codeInput.value = t }).catch(() => {})
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
    <div class="mode-switch">
      <button :class="{ active: mode === 'generate' }" @click="mode = 'generate'">生成</button>
      <button :class="{ active: mode === 'review' }" @click="mode = 'review'">审查</button>
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

    <template v-if="mode === 'generate'">
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
    </template>

    <template v-else>
      <div class="code-input-area">
        <textarea
          v-model="codeInput"
          class="code-editor"
          placeholder="粘贴需要审查的代码..."
          rows="8"
        />
        <button class="paste-btn" @click="pasteCode">从剪贴板粘贴</button>
      </div>
    </template>

    <button
      class="gen-btn"
      :disabled="(mode === 'generate' ? !requirement.trim() : !codeInput.trim()) || loading"
      @click="execute"
    >
      {{ loading ? '处理中...' : (mode === 'generate' ? '生成代码' : '开始审查') }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-content" v-html="renderMarkdown(result)" />
      <button class="copy-btn" @click="copyResult">复制结果</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.code-tool {
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

.lang-select { display: flex; flex-wrap: wrap; gap: 5px; }

.lang-chip {
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.1s;
}

.lang-chip.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.req-input, .code-editor {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  resize: vertical;
  font-family: 'SF Mono', 'Fira Code', monospace;
  box-sizing: border-box;
  line-height: 1.5;
}

.code-input-area { position: relative; }

.paste-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.quick-prompts { display: flex; flex-wrap: wrap; gap: 5px; }

.prompt-chip {
  padding: 3px 9px;
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
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
}

.result-content :deep(code) { font-family: 'SF Mono', monospace; font-size: 12px; }
.result-content :deep(h2), .result-content :deep(h3) { margin: 10px 0 4px; font-size: 14px; }
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
