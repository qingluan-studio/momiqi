<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const topic = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')

const angles = [
  { key: 'tech', label: '技术实现', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { key: 'business', label: '商业价值', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'user', label: '用户体验', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { key: 'risk', label: '风险评估', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
]

async function analyze() {
  if (!topic.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    const prompt = `请对以下问题从四个维度进行全面分析。每个维度独立成段，用 "## 维度名" 开头。

问题: ${topic.value}

## 技术实现
分析技术可行性、架构选型、实现难点。

## 商业价值
分析市场前景、商业模式、投入产出比。

## 用户体验
分析用户需求、交互设计、使用场景。

## 风险评估
分析潜在风险、安全性、合规性问题。

请保持每个维度3-5条要点的精炼分析。中文输出。`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '分析失败'
  } finally {
    loading.value = false
  }
}

const hotTopics = [
  '是否应该在 2026 年创业做 AI 应用',
  '微服务 vs 单体架构的选择',
  '远程办公对团队效率的影响',
]

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="multiview-tool">
    <h3 class="sec-title">多方位思维分析</h3>
    <p class="sec-desc">从技术、商业、用户、风险四个维度深度分析</p>

    <div class="angle-badges">
      <span v-for="a in angles" :key="a.key" class="badge">{{ a.label }}</span>
    </div>

    <textarea
      v-model="topic"
      class="topic-input"
      placeholder="输入要分析的问题或决策..."
      rows="2"
    />

    <div class="hot-list">
      <button v-for="t in hotTopics" :key="t" @click="topic = t">{{ t }}</button>
    </div>

    <button class="gen-btn" :disabled="!topic.trim() || loading" @click="analyze">
      {{ loading ? '多维度分析中...' : '开始多方位分析' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyResult">复制分析</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.multiview-tool { padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; height: 100%; }
.sec-title { margin: 0; font-size: 16px; }
.sec-desc { margin: 0; font-size: 12px; color: var(--text-tertiary); }
.angle-badges { display: flex; gap: 6px; }
.badge {
  padding: 3px 10px; border-radius: 6px; background: rgba(99,102,241,0.1);
  color: var(--accent); font-size: 11px; font-weight: 500;
}
.topic-input {
  width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-primary); font-size: 13px;
  resize: vertical; box-sizing: border-box; line-height: 1.6;
}
.hot-list { display: flex; flex-wrap: wrap; gap: 5px; }
.hot-list button {
  padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border-color);
  background: transparent; color: var(--text-tertiary); font-size: 11px; cursor: pointer;
}
.hot-list button:active { border-color: var(--accent); }
.gen-btn {
  padding: 12px; border-radius: 10px; border: none;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
}
.gen-btn:disabled { opacity: 0.5; }
.result-card { padding: 14px; background: var(--bg-secondary); border-radius: 12px; }
.result-text { font-size: 13px; line-height: 1.7; white-space: pre-wrap; margin-bottom: 8px; }
.copy-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-secondary); font-size: 12px; cursor: pointer; }
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
