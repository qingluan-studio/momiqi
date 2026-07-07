<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const context = ref('')
const category = ref('variable')
const lang = ref('zh')
const result = ref('')
const loading = ref(false)
const error = ref('')

const categories = [
  { value: 'variable', label: '变量名' },
  { value: 'function', label: '函数/方法' },
  { value: 'class', label: '类名' },
  { value: 'project', label: '项目名' },
  { value: 'api', label: 'API 端点' },
  { value: 'db', label: '数据库表/字段' },
]

const languages = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
]

async function generate() {
  if (!context.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const catLabel = categories.find(c => c.value === category.value)?.label || '命名'
    const prompt = `你是命名专家。请为以下场景生成${lang.value === 'zh' ? '中英双语' : 'English'}的${catLabel}命名建议。

场景描述: ${context.value}

请输出5个命名建议，每个包含：
1. 推荐名称
2. 理由（为什么这样命名）
3. 使用场景说明`

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

const quickContexts = [
  '用户登录验证中间件',
  '商品库存管理系统',
  'RESTful API 获取用户列表',
  '微信支付回调处理',
  '文件上传工具函数',
  '数据导出报表模块',
]
</script>

<template>
  <div class="naming-tool">
    <h3 class="sec-title">命名建议器</h3>

    <div class="category-select">
      <button
        v-for="c in categories"
        :key="c.value"
        :class="{ active: category === c.value }"
        @click="category = c.value"
      >{{ c.label }}</button>
    </div>

    <div class="lang-select">
      <button
        v-for="l in languages"
        :key="l.value"
        :class="{ active: lang === l.value }"
        @click="lang = l.value"
      >{{ l.label }}</button>
    </div>

    <textarea
      v-model="context"
      class="ctx-input"
      placeholder="描述你的项目/模块/功能..."
      rows="2"
    />

    <div class="quick-list">
      <button v-for="q in quickContexts" :key="q" @click="context = q">{{ q }}</button>
    </div>

    <button class="gen-btn" :disabled="!context.trim() || loading" @click="generate">
      {{ loading ? '思考中...' : '生成命名建议' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyResult">复制</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.naming-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: 100%;
}

.sec-title { margin: 0; font-size: 16px; }

.category-select, .lang-select { display: flex; flex-wrap: wrap; gap: 5px; }
.category-select button, .lang-select button {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
}
.category-select button.active, .lang-select button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.ctx-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
}

.quick-list { display: flex; flex-wrap: wrap; gap: 5px; }
.quick-list button {
  padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border-color);
  background: transparent; color: var(--text-tertiary); font-size: 11px; cursor: pointer;
}
.quick-list button:active { border-color: var(--accent); }

.gen-btn {
  padding: 12px; border-radius: 10px; border: none;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
}
.gen-btn:disabled { opacity: 0.5; }

.result-card { padding: 14px; background: var(--bg-secondary); border-radius: 12px; }
.result-text { font-size: 13px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 8px; }
.copy-btn {
  padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border-color);
  background: var(--bg-primary); color: var(--text-secondary); font-size: 12px; cursor: pointer;
}
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
