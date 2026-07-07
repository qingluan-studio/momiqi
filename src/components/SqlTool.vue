<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const requirement = ref('')
const dialect = ref('mysql')
const result = ref('')
const loading = ref(false)
const error = ref('')

const dialects = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mssql', label: 'SQL Server' },
]

async function generate() {
  if (!requirement.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const dialectName = dialects.find(d => d.value === dialect.value)?.label
    const prompt = `你是SQL专家。请根据以下需求生成${dialectName}的SQL查询。

需求: ${requirement.value}

请输出：
1. 完整的SQL语句（用\`\`\`sql包裹）
2. 查询逻辑说明
3. 性能注意事项（如有索引建议等）`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '生成失败'
  } finally {
    loading.value = false
  }
}

const quickReqs = [
  '查询最近7天注册的用户，按日期分组统计',
  '找到每个部门工资最高的前3名员工',
  '计算每个商品类别的总销售额，按销售额降序',
  '更新过期的订单状态为已取消',
  '创建用户和订单的联表查询，包含用户名的订单列表',
]

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="sql-tool">
    <h3 class="sec-title">SQL 查询生成器</h3>

    <div class="dialect-select">
      <button
        v-for="d in dialects"
        :key="d.value"
        :class="{ active: dialect === d.value }"
        @click="dialect = d.value"
      >{{ d.label }}</button>
    </div>

    <textarea
      v-model="requirement"
      class="req-input"
      placeholder="描述你的查询需求..."
      rows="3"
    />

    <div class="quick-list">
      <button v-for="q in quickReqs" :key="q" @click="requirement = q">{{ q }}</button>
    </div>

    <button class="gen-btn" :disabled="!requirement.trim() || loading" @click="generate">
      {{ loading ? '生成中...' : '生成 SQL' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyResult">复制结果</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.sql-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: 100%;
}

.sec-title { margin: 0; font-size: 16px; }

.dialect-select { display: flex; gap: 5px; }
.dialect-select button {
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}
.dialect-select button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.req-input {
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
  line-height: 1.6;
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
