<script setup lang="ts">
import { ref, computed } from 'vue'
import { getItem, setItem } from '../utils/storage'
import { generateId } from '../utils/markdown'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

interface PromptTemplate {
  id: string
  title: string
  content: string
  category: string
  createdAt: number
}

const templates = ref<PromptTemplate[]>(getItem<PromptTemplate[]>('prompts', []))
const showAdd = ref(false)
const editTitle = ref('')
const editContent = ref('')
const editCategory = ref('通用')
const result = ref('')
const resultLoading = ref(false)
const editingId = ref<string | null>(null)

const categories = ['通用', '代码', '写作', '翻译', '分析', '创意', '自定义']

function save() {
  setItem('prompts', templates.value)
}

function addPrompt() {
  if (!editTitle.value.trim() || !editContent.value.trim()) return
  templates.value.unshift({
    id: generateId(),
    title: editTitle.value.trim(),
    content: editContent.value.trim(),
    category: editCategory.value,
    createdAt: Date.now(),
  })
  editTitle.value = ''
  editContent.value = ''
  editCategory.value = '通用'
  showAdd.value = false
  save()
}

function deletePrompt(id: string) {
  const idx = templates.value.findIndex(t => t.id === id)
  if (idx >= 0) {
    templates.value.splice(idx, 1)
    save()
  }
}

async function runPrompt(template: PromptTemplate) {
  resultLoading.value = true
  result.value = ''
  try {
    const res = await chatWithFallback([{ role: 'user', content: template.content }])
    result.value = res.content
  } catch (err: any) {
    result.value = '错误: ' + (err.message || '执行失败')
  } finally {
    resultLoading.value = false
  }
}

const defaultPrompts: PromptTemplate[] = [
  { id: 'builtin-1', title: '代码审查', content: '请审查以下代码，指出潜在的问题和改进建议：\n\n', category: '代码', createdAt: 0 },
  { id: 'builtin-2', title: '中英翻译', content: '请将以下中文翻译成英文，保持专业术语准确：\n\n', category: '翻译', createdAt: 0 },
  { id: 'builtin-3', title: '文章总结', content: '请用3-5句话总结以下内容的核心要点：\n\n', category: '分析', createdAt: 0 },
  { id: 'builtin-4', title: '周报生成', content: '根据以下工作内容，帮我生成一份简洁的周报：\n\n本周完成：\n下周计划：\n问题与风险：\n\n输出格式：Markdown', category: '写作', createdAt: 0 },
]

const allPrompts = computed(() => {
  const userIds = new Set(templates.value.map(t => t.id))
  const builtins = defaultPrompts.filter(p => !userIds.has(p.id))
  return [...templates.value, ...builtins]
})
</script>

<template>
  <div class="prompt-tool">
    <div class="tool-header">
      <h2>Prompt 模板</h2>
      <button class="add-btn" @click="showAdd = !showAdd; editingId = null">
        {{ showAdd ? '取消' : '+ 新建' }}
      </button>
    </div>

    <form v-if="showAdd" class="add-form" @submit.prevent="addPrompt">
      <input v-model="editTitle" class="form-input" placeholder="模板名称" />
      <textarea v-model="editContent" class="form-textarea" placeholder="Prompt 内容..." rows="3" />
      <select v-model="editCategory" class="form-select">
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <button type="submit" class="form-btn">保存模板</button>
    </form>

    <div class="prompt-list">
      <div
        v-for="t in allPrompts"
        :key="t.id"
        class="prompt-card"
        @click="runPrompt(t)"
      >
        <div class="card-top">
          <span class="card-title">{{ t.title }}</span>
          <span class="card-cat">{{ t.category }}</span>
        </div>
        <div class="card-preview">{{ t.content.slice(0, 80) }}...</div>
        <button
          v-if="t.id.startsWith('builtin-')"
          class="card-action save-action"
          @click.stop="editTitle = t.title; editContent = t.content; editCategory = t.category; showAdd = true"
        >收藏</button>
        <button
          v-else
          class="card-action del-action"
          @click.stop="deletePrompt(t.id)"
        >删除</button>
      </div>
    </div>

    <div v-if="result" class="result-card">
      <div v-if="resultLoading" class="loading-text">执行中...</div>
      <div v-else class="result-text" v-text="result" />
    </div>
  </div>
</template>

<style scoped>
.prompt-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  height: 100%;
}

.tool-header { display: flex; align-items: center; justify-content: space-between; }
.tool-header h2 { margin: 0; font-size: 18px; }

.add-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-textarea { resize: vertical; }

.form-btn {
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.prompt-list { display: flex; flex-direction: column; gap: 8px; }

.prompt-card {
  padding: 12px 14px;
  background: var(--bg-secondary);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
}

.prompt-card:active { opacity: 0.8; }

.card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }

.card-title { font-size: 14px; font-weight: 600; }
.card-cat { font-size: 10px; padding: 2px 8px; border-radius: 6px; background: rgba(99,102,241,0.1); color: var(--accent); }
.card-preview { font-size: 12px; color: var(--text-tertiary); }

.card-action {
  position: absolute;
  top: 10px;
  right: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  font-size: 11px;
  cursor: pointer;
}

.save-action { color: var(--accent); }
.del-action { color: #ef4444; }

.result-card {
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.loading-text { font-size: 13px; color: var(--text-tertiary); }
.result-text { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
</style>
