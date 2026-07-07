<script setup lang="ts">
import { ref, computed } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'
import { useChat } from '../stores/chat'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const knowledgeStore = useKnowledgeStore()
const chatStore = useChat()

const subTab = ref('notes')
const title = ref('')
const content = ref('')
const category = ref('通用')
const searchQuery = ref('')
const noteDetail = ref<string | null>(null)
const loading = ref(false)
const learnLoading = ref(false)
const learnStatus = ref('')

const filteredNotes = computed(() => {
  if (searchQuery.value) return knowledgeStore.searchNotes(searchQuery.value)
  if (subTab.value === 'auto') return knowledgeStore.getAutoLearned()
  return knowledgeStore.notes
})

const detailNote = computed(() => {
  if (!noteDetail.value) return null
  return knowledgeStore.notes.find(n => n.id === noteDetail.value)
})

function saveNote() {
  if (!title.value.trim() || !content.value.trim()) return
  knowledgeStore.addNote(title.value, content.value, category.value)
  title.value = ''
  content.value = ''
  category.value = '通用'
}

function deleteNote(id: string) {
  knowledgeStore.deleteNote(id)
  if (noteDetail.value === id) noteDetail.value = null
}

function backToList() {
  noteDetail.value = null
}

async function autoLearn() {
  const allSessions = [...chatStore.sessions].filter(s => s.messages.length > 0)
  if (allSessions.length === 0) {
    learnStatus.value = '暂无对话记录可提取'
    return
  }

  learnLoading.value = true
  learnStatus.value = ''

  try {
    const existingTitles = new Set(knowledgeStore.getAutoLearned().map(n => n.title))
    let extracted = 0

    for (const session of allSessions.slice(0, 5)) {
      const userMsgs = session.messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .slice(0, 10)

      if (userMsgs.length < 2) continue

      const prompt = `从以下对话中提取最多3条核心知识点，每条用 "## 标题" 后跟简要说明的格式。中文输出。不要重复。

对话主题: ${session.title}
对话内容:
${userMsgs.join('\n')}

提取格式:
## 知识点标题
简要说明一行即可`

      const res = await chatWithFallback([{ role: 'user', content: prompt }])
      const blocks = res.content.split('## ').filter(b => b.trim())
      for (const block of blocks.slice(1)) {
        const lines = block.split('\n')
        const learnTitle = lines[0]?.trim() || ''
        const learnContent = lines.slice(1).join('\n').trim()
        if (learnTitle && learnContent && !existingTitles.has(learnTitle)) {
          knowledgeStore.addNote(learnTitle, learnContent, '通用', 'auto-learn', session.id)
          existingTitles.add(learnTitle)
          extracted++
        }
      }
    }
    learnStatus.value = extracted > 0 ? `成功提取 ${extracted} 条知识点` : '未找到新知识点'
  } catch (err: any) {
    learnStatus.value = err.message || '提取失败'
  } finally {
    learnLoading.value = false
  }
}

function exportAll() {
  const md = filteredNotes.value.map(n =>
    `# ${n.title}\n\n分类: ${n.category} | 来源: ${n.source === 'auto-learn' ? '自动学习' : '手动'}\n\n${n.content}\n`
  ).join('\n---\n\n')
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'knowledge_export.md'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="knowledge-base">
    <div class="sub-nav">
      <button :class="{ active: subTab === 'notes' }" @click="subTab = 'notes'">笔记</button>
      <button :class="{ active: subTab === 'auto' }" @click="subTab = 'auto'">自动学习</button>
      <button :class="{ active: subTab === 'add' }" @click="subTab = 'add'">新建</button>
    </div>

    <div class="sub-content">
      <!-- 笔记列表 -->
      <div v-if="subTab === 'notes' || subTab === 'auto'" class="list-panel">
        <div class="search-bar">
          <input v-model="searchQuery" placeholder="搜索知识..." class="search-input" />
        </div>

        <div v-if="subTab === 'auto'" class="learn-area">
          <button class="learn-btn" :disabled="learnLoading" @click="autoLearn">
            {{ learnLoading ? '提取中...' : '从对话中学习' }}
          </button>
          <span v-if="learnStatus" class="learn-status">{{ learnStatus }}</span>
        </div>

        <div v-if="filteredNotes.length > 0" class="list-toolbar">
          <span class="count">{{ filteredNotes.length }} 条</span>
          <button class="export-note-btn" @click="exportAll">导出</button>
        </div>

        <div v-if="filteredNotes.length === 0" class="empty">
          {{ subTab === 'auto' ? '暂无自动学习的知识点，点击上方按钮提取' : '暂无笔记' }}
        </div>

        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-item"
          @click="noteDetail = note.id"
        >
          <div class="note-title">{{ note.title }}</div>
          <div class="note-meta">
            <span class="note-cat">{{ note.category }}</span>
            <span class="note-src">{{ note.source === 'auto-learn' ? '自动' : '手动' }}</span>
            <span class="note-date">{{ new Date(note.createdAt).toLocaleDateString('zh') }}</span>
          </div>
        </div>
      </div>

      <!-- 笔记详情 -->
      <div v-else-if="noteDetail && detailNote" class="detail-panel">
        <button class="back-btn" @click="backToList">← 返回</button>
        <h3>{{ detailNote.title }}</h3>
        <div class="detail-meta">
          {{ detailNote.category }} · {{ new Date(detailNote.createdAt).toLocaleString('zh') }}
        </div>
        <div class="detail-content">{{ detailNote.content }}</div>
        <button class="del-btn" @click="deleteNote(detailNote.id)">删除此条</button>
      </div>

      <!-- 新建笔记 -->
      <div v-else class="add-panel">
        <input v-model="title" class="add-input" placeholder="笔记标题" />
        <div class="cat-select">
          <button
            v-for="c in knowledgeStore.categories"
            :key="c"
            :class="{ active: category === c }"
            @click="category = c"
          >{{ c }}</button>
        </div>
        <textarea v-model="content" class="add-textarea" placeholder="笔记内容..." rows="6" />
        <button class="save-btn" :disabled="!title.trim() || !content.trim()" @click="saveNote">
          保存笔记
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-base { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

.sub-nav {
  display: flex; gap: 2px; padding: 6px 10px;
  border-bottom: 1px solid var(--border-color); flex-shrink: 0;
}
.sub-nav button {
  padding: 5px 14px; border-radius: 8px; border: none;
  background: transparent; color: var(--text-tertiary); font-size: 12px; cursor: pointer;
}
.sub-nav button.active { background: var(--bg-secondary); color: var(--accent); font-weight: 600; }

.sub-content { flex: 1; overflow-y: auto; }

.list-panel { padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }

.search-input {
  width: 100%; padding: 8px 12px; border-radius: 10px;
  border: 1px solid var(--border-color); background: var(--bg-secondary);
  color: var(--text-primary); font-size: 13px; box-sizing: border-box;
}
.search-input:focus { outline: none; border-color: var(--accent); }

.learn-area { display: flex; align-items: center; gap: 8px; }
.learn-btn {
  padding: 8px 16px; border-radius: 8px; border: none;
  background: var(--accent); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
}
.learn-btn:disabled { opacity: 0.5; }
.learn-status { font-size: 12px; color: var(--text-tertiary); }

.list-toolbar {
  display: flex; align-items: center; justify-content: space-between;
}

.count { font-size: 12px; color: var(--text-tertiary); }

.export-note-btn {
  padding: 4px 10px; border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent; color: var(--text-secondary); font-size: 11px; cursor: pointer;
}

.empty { text-align: center; color: var(--text-tertiary); padding: 40px 0; font-size: 13px; }

.note-item {
  padding: 10px 12px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); cursor: pointer;
}
.note-item:active { border-color: var(--accent); }
.note-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.note-meta { display: flex; gap: 8px; font-size: 11px; color: var(--text-tertiary); }
.note-cat { color: var(--accent); }

.detail-panel { padding: 14px; }
.back-btn { padding: 4px 8px; border: none; background: transparent; color: var(--accent); font-size: 13px; cursor: pointer; margin-bottom: 10px; }
.detail-panel h3 { margin: 0 0 4px; font-size: 17px; }
.detail-meta { font-size: 12px; color: var(--text-tertiary); margin-bottom: 14px; }
.detail-content { font-size: 14px; line-height: 1.7; white-space: pre-wrap; color: var(--text-primary); margin-bottom: 14px; }
.del-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #ef4444; background: transparent; color: #ef4444; font-size: 12px; cursor: pointer; }

.add-panel { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.add-input {
  padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; box-sizing: border-box;
}
.add-input:focus { outline: none; border-color: var(--accent); }
.cat-select { display: flex; flex-wrap: wrap; gap: 5px; }
.cat-select button {
  padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-secondary); font-size: 11px; cursor: pointer;
}
.cat-select button.active { border-color: var(--accent); color: var(--accent); background: rgba(99,102,241,0.1); }
.add-textarea {
  padding: 10px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-primary); font-size: 13px;
  resize: vertical; box-sizing: border-box; line-height: 1.6;
}
.add-textarea:focus { outline: none; border-color: var(--accent); }
.save-btn {
  padding: 12px; border-radius: 10px; border: none; background: var(--accent);
  color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
}
.save-btn:disabled { opacity: 0.5; }
</style>
