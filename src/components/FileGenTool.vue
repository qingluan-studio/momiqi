<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const input = ref('')
const format = ref('markdown')
const result = ref('')
const loading = ref(false)
const error = ref('')

const formats = [
  { value: 'markdown', label: 'Markdown', ext: '.md' },
  { value: 'json', label: 'JSON', ext: '.json' },
  { value: 'csv', label: 'CSV', ext: '.csv' },
  { value: 'yaml', label: 'YAML', ext: '.yaml' },
  { value: 'html', label: 'HTML', ext: '.html' },
  { value: 'xml', label: 'XML', ext: '.xml' },
  { value: 'latex', label: 'LaTeX', ext: '.tex' },
  { value: 'sql', label: 'SQL DDL', ext: '.sql' },
]

const samples: Record<string, string> = {
  markdown: '# 项目说明\n\n## 简介\n这是一个演示项目。\n\n## 功能\n- 用户登录\n- 数据展示',
  json: '{ "name": "张三", "age": 28, "skills": ["Python", "React"] }',
  csv: '姓名,年龄,城市\n张三,28,北京\n李四,32,上海',
  yaml: 'server:\n  host: localhost\n  port: 8080\n  debug: true',
  html: '<div class="card"><h2>标题</h2><p>内容段落。</p></div>',
  xml: '<users><user><name>张三</name><role>admin</role></user></users>',
  latex: '\\documentclass{article}\n\\title{论文标题}',
  sql: 'CREATE TABLE users (id INT PRIMARY KEY);',
}

async function generate() {
  if (!input.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    const label = formats.find(f => f.value === format.value)?.label
    const prompt = `你是一个数据格式转换专家。请将以下内容转换为${label}格式。

原始内容:
${input.value}

只在代码块(\`\`\`${format.value})中给出转换后的结果，不要添加额外说明。`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    const match = res.content.match(/```[\w]*\n?([\s\S]*?)```/) || [null, res.content]
    result.value = match[1] || res.content
  } catch (err: any) {
    error.value = err.message || '生成失败'
  } finally {
    loading.value = false
  }
}

function fillSample() {
  input.value = samples[format.value] || ''
}

function download() {
  const ext = formats.find(f => f.value === format.value)?.ext || '.txt'
  const blob = new Blob([result.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `export${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

function copyResult() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}
</script>

<template>
  <div class="filegen-tool">
    <h3 class="sec-title">多格式文件生成</h3>

    <div class="format-select">
      <button
        v-for="f in formats"
        :key="f.value"
        :class="{ active: format === f.value }"
        @click="format = f.value"
      >{{ f.label }}</button>
    </div>

    <textarea
      v-model="input"
      class="input-area"
      placeholder="粘贴或输入内容，AI 将转换为指定格式..."
      rows="4"
    />

    <div class="action-row">
      <button class="sample-btn" @click="fillSample">示例数据</button>
      <button class="gen-btn" :disabled="!input.trim() || loading" @click="generate">
        {{ loading ? '转换中...' : '生成 ' + (formats.find(f => f.value === format)?.label || '') }}
      </button>
    </div>

    <div v-if="result" class="result-card">
      <pre class="result-pre">{{ result }}</pre>
      <div class="result-actions">
        <button class="act-btn" @click="copyResult">复制</button>
        <button class="act-btn primary" @click="download">下载文件</button>
      </div>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.filegen-tool { padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; height: 100%; }
.sec-title { margin: 0; font-size: 16px; }
.format-select { display: flex; flex-wrap: wrap; gap: 4px; }
.format-select button {
  padding: 4px 9px; border-radius: 6px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-secondary); font-size: 11px; cursor: pointer;
}
.format-select button.active { border-color: var(--accent); color: var(--accent); background: rgba(99,102,241,0.1); }
.input-area {
  width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-primary); font-size: 13px;
  resize: vertical; box-sizing: border-box; line-height: 1.6; font-family: 'SF Mono', 'Fira Code', monospace;
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
.result-card { padding: 12px; background: var(--bg-secondary); border-radius: 12px; }
.result-pre { font-size: 12px; line-height: 1.5; white-space: pre-wrap; margin: 0; max-height: 300px; overflow: auto; margin-bottom: 8px; }
.result-actions { display: flex; gap: 8px; }
.act-btn {
  padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border-color);
  background: var(--bg-primary); color: var(--text-secondary); font-size: 12px; cursor: pointer;
}
.act-btn.primary { border-color: var(--accent); color: var(--accent); }
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
