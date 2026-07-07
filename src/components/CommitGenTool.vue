<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const diff = ref('')
const type = ref('feat')
const result = ref('')
const loading = ref(false)
const error = ref('')

const types = [
  { value: 'feat', label: 'feat 新功能' },
  { value: 'fix', label: 'fix 修复' },
  { value: 'refactor', label: 'refactor 重构' },
  { value: 'chore', label: 'chore 杂务' },
  { value: 'docs', label: 'docs 文档' },
  { value: 'style', label: 'style 样式' },
  { value: 'perf', label: 'perf 性能' },
  { value: 'test', label: 'test 测试' },
]

async function generate() {
  if (!diff.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const prompt = `你是Git提交信息专家。请根据以下代码变更生成一条规范的commit message（Conventional Commits格式: ${type.value}）。

代码变更:
${diff.value}

请输出：
1. 主体行 (type: 简洁描述, 不超过50字符)
2. 正文 (详细说明，每行不超过72字符)
3. 用中文写说明`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '生成失败'
  } finally {
    loading.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="commit-tool">
    <h3 class="sec-title">Commit 信息生成</h3>

    <div class="type-select">
      <button
        v-for="t in types"
        :key="t.value"
        :class="{ active: type === t.value }"
        @click="type = t.value"
      >{{ t.label }}</button>
    </div>

    <textarea
      v-model="diff"
      class="diff-input"
      placeholder="粘贴你的代码变更，AI 将生成规范的 commit message..."
      rows="5"
    />

    <button class="gen-btn" :disabled="!diff.trim() || loading" @click="generate">
      {{ loading ? '生成中...' : '生成 Commit 信息' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyResult">复制</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.commit-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: 100%;
}

.sec-title { margin: 0; font-size: 16px; }

.type-select { display: flex; flex-wrap: wrap; gap: 5px; }
.type-select button {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  cursor: pointer;
}
.type-select button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.diff-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.6;
}

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
.result-text { font-size: 13px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 8px; }
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
