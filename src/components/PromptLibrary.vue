<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePrompts } from '../stores/prompts'
import type { PromptTemplate } from '../types'

const emit = defineEmits<{ close: []; select: [content: string] }>()

const store = usePrompts()
const activeCategory = ref<string>('全部')
const showNewForm = ref(false)
const newTitle = ref('')
const newContent = ref('')
const newCategory = ref<'创作' | '编程' | '翻译' | '分析' | '效率' | '通用'>('通用')

const allCategories = computed(() => ['全部', ...store.categories])

const filtered = computed(() =>
  activeCategory.value === '全部'
    ? store.templates
    : store.templates.filter(t => t.category === activeCategory.value)
)

function selectTemplate(t: PromptTemplate) {
  emit('select', t.content)
  emit('close')
}

function saveNew() {
  if (!newTitle.value.trim() || !newContent.value.trim()) return
  store.addTemplate({
    title: newTitle.value.trim(),
    content: newContent.value.trim(),
    category: newCategory.value,
  })
  newTitle.value = ''
  newContent.value = ''
  showNewForm.value = false
}

</script>

<template>
  <div class="prompt-overlay" @click.self="$emit('close')">
    <div class="prompt-panel">
      <div class="pp-header">
        <h3>Prompt 模板</h3>
        <button class="icon-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="pp-categories">
        <button
          v-for="cat in allCategories"
          :key="cat"
          class="cat-btn"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >{{ cat }}</button>
      </div>

      <div class="pp-list">
        <div
          v-for="t in filtered"
          :key="t.id"
          class="pp-item"
          @click="selectTemplate(t)"
        >
          <div class="pp-item-header">
            <span class="pp-item-title">{{ t.title }}</span>
            <span class="pp-item-cat">{{ t.category }}</span>
            <button
              v-if="!t.isBuiltin"
              class="pp-del-btn"
              @click.stop="store.deleteTemplate(t.id)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
          <div class="pp-item-preview">{{ t.content.slice(0, 80) }}{{ t.content.length > 80 ? '...' : '' }}</div>
        </div>
      </div>

      <div class="pp-footer">
        <button v-if="!showNewForm" class="add-btn" @click="showNewForm = true">+ 新建模板</button>
        <div v-else class="new-form">
          <input v-model="newTitle" placeholder="模板名称" class="form-input" />
          <select v-model="newCategory" class="form-select">
            <option v-for="c in store.categories" :key="c" :value="c">{{ c }}</option>
          </select>
          <textarea v-model="newContent" placeholder="模板内容，用 {{变量}} 做占位符" class="form-textarea" rows="4" />
          <div class="form-actions">
            <button class="btn-cancel" @click="showNewForm = false">取消</button>
            <button class="btn-save" @click="saveNew">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.prompt-panel {
  background: var(--bg-secondary);
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.pp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.pp-header h3 { margin: 0; font-size: 16px; }

.icon-btn {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: transparent; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.pp-categories {
  display: flex;
  gap: 6px;
  padding: 10px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-bottom: 1px solid var(--border-color);
}

.cat-btn {
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.cat-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.pp-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  -webkit-overflow-scrolling: touch;
}

.pp-item {
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.pp-item:active { background: var(--bg-hover); }

.pp-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.pp-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.pp-item-cat {
  font-size: 10px;
  color: var(--text-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
}

.pp-del-btn {
  width: 22px; height: 22px; border: none; border-radius: 4px;
  background: transparent; color: var(--text-tertiary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.pp-item-preview {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pp-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.add-btn {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px dashed var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.new-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input, .form-select, .form-textarea {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.form-textarea { resize: vertical; font-family: inherit; }

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 6px 16px; border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent; color: var(--text-secondary);
  font-size: 13px; cursor: pointer;
}

.btn-save {
  padding: 6px 16px; border-radius: 8px; border: none;
  background: var(--accent); color: #fff;
  font-size: 13px; cursor: pointer;
}
</style>
