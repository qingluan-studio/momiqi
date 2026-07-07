<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const query = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    const prompt = `请根据以下查询，扮演联网搜索引擎的角色。你需要综合你的训练知识，提供最新的信息摘要。

查询: ${query.value}

请输出：
1. 核心结论（2-3句话摘要）
2. 关键信息点（用 - 列表格式，至少5条）
3. 相关建议或下一步（如有）
4. 注明信息来源（基于训练知识的估计时间）`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '搜索失败'
  } finally {
    loading.value = false
  }
}

const trending = [
  '最新 AI 大模型排行榜 2026',
  'React 19 新特性详解',
  'Python 性能优化最佳实践',
  '云原生架构设计模式',
  '前端安全防护策略',
  '如何学习 Rust 编程语言',
]

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="search-tool">
    <h3 class="sec-title">联网智能搜索</h3>

    <div class="search-box">
      <input
        v-model="query"
        class="search-input"
        placeholder="输入搜索关键词..."
        @keyup.enter="search"
      />
      <button class="search-btn" :disabled="!query.trim() || loading" @click="search">
        {{ loading ? '搜索中' : '搜索' }}
      </button>
    </div>

    <div class="trending-list">
      <span class="trending-label">热门搜索：</span>
      <button v-for="t in trending" :key="t" @click="query = t; search()">{{ t }}</button>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyResult">复制结果</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.search-tool {
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; height: 100%;
}

.sec-title { margin: 0; font-size: 16px; }

.search-box { display: flex; gap: 8px; }
.search-input {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  border: 1px solid var(--border-color); background: var(--bg-secondary);
  color: var(--text-primary); font-size: 14px; box-sizing: border-box;
}
.search-input:focus { outline: none; border-color: var(--accent); }
.search-btn {
  padding: 10px 18px; border-radius: 12px; border: none;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
  flex-shrink: 0;
}
.search-btn:disabled { opacity: 0.5; }

.trending-list { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.trending-label { font-size: 11px; color: var(--text-tertiary); }
.trending-list button {
  padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border-color);
  background: transparent; color: var(--text-tertiary); font-size: 11px; cursor: pointer;
}
.trending-list button:active { border-color: var(--accent); }

.result-card { padding: 14px; background: var(--bg-secondary); border-radius: 12px; }
.result-text { font-size: 13px; line-height: 1.7; white-space: pre-wrap; margin-bottom: 8px; }
.copy-btn {
  padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border-color);
  background: var(--bg-primary); color: var(--text-secondary); font-size: 12px; cursor: pointer;
}
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
