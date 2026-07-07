<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const description = ref('')
const sampleText = ref('')
const flags = ref('g')
const result = ref('')
const loading = ref(false)
const error = ref('')

const flagOptions = [
  { value: 'g', label: 'g 全局' },
  { value: 'gi', label: 'gi 全局+忽略大小写' },
  { value: 'gm', label: 'gm 全局+多行' },
  { value: 'gim', label: 'gim 全局+忽略大小写+多行' },
  { value: '', label: '无标志' },
]

async function generate() {
  if (!description.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const prompt = `你是正则表达式专家。请根据以下描述生成正则表达式。
描述: ${description.value}${sampleText.value ? `\n示例文本: ${sampleText.value}` : ''}
标志需求: ${flags.value || '默认'}

请输出：
1. 正则表达式（用 \`\`\` 包裹）
2. 解释说明（每个部分的作用）
3. 匹配示例`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '生成失败'
  } finally {
    loading.value = false
  }
}

const quickDescs = [
  '匹配中国大陆手机号',
  '匹配邮箱地址',
  '提取URL中的域名',
  '匹配IPv4地址',
  '匹配中文字符',
  '去除HTML标签',
]

function copyRegex() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="regex-tool">
    <h3 class="sec-title">正则表达式生成器</h3>

    <textarea
      v-model="description"
      class="desc-input"
      placeholder="描述你需要的正则表达式，例如：匹配6-16位只含数字和字母的密码"
      rows="2"
    />

    <input
      v-model="sampleText"
      class="sample-input"
      placeholder="示例文本（可选，帮助更准确地生成）"
    />

    <div class="controls">
      <div class="flag-select">
        <button
          v-for="f in flagOptions"
          :key="f.value"
          :class="{ active: flags === f.value }"
          @click="flags = f.value"
        >{{ f.label }}</button>
      </div>
    </div>

    <div class="quick-list">
      <button v-for="q in quickDescs" :key="q" @click="description = q">{{ q }}</button>
    </div>

    <button class="gen-btn" :disabled="!description.trim() || loading" @click="generate">
      {{ loading ? '生成中...' : '生成正则' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyRegex">复制结果</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.regex-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: 100%;
}

.sec-title { margin: 0; font-size: 16px; }

.desc-input, .sample-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  box-sizing: border-box;
  resize: vertical;
  line-height: 1.5;
}

.flag-select { display: flex; flex-wrap: wrap; gap: 5px; }
.flag-select button {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}
.flag-select button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.quick-list { display: flex; flex-wrap: wrap; gap: 5px; }
.quick-list button {
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}
.quick-list button:active { border-color: var(--accent); }

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
