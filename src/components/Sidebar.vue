<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChatSession } from '../types'
import { formatTime, truncateText, generateId } from '../utils/markdown'

const props = defineProps<{
  chat: ReturnType<typeof import('../stores/chat').useChat>
  sessions: ChatSession[]
  currentId: string
}>()

const emit = defineEmits<{
  close: []
  settings: []
  select: [id: string]
  delete: [id: string]
  newChat: []
  togglePin: [id: string]
}>()

const search = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const importFileInput = ref<HTMLInputElement | null>(null)

const sortedSessions = computed(() => {
  const arr = [...props.sessions]
  arr.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updatedAt - a.updatedAt
  })
  return arr
})

const filteredSessions = computed(() => {
  if (!search.value.trim()) return sortedSessions.value
  const q = search.value.toLowerCase()
  return sortedSessions.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.messages.some(m => m.content.toLowerCase().includes(q))
  )
})

function exportData() {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) data[key] = JSON.parse(localStorage.getItem(key) || 'null')
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-toolkit-backup-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData() {
  fileInput.value?.click()
}

function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
      location.reload()
    } catch {
      alert('文件格式错误')
    }
  }
  reader.readAsText(file)
}

function openImportChat() {
  importFileInput.value?.click()
}

function handleImportChat(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    const messages: { role: 'user' | 'assistant'; content: string }[] = []
    const lines = text.split('\n')
    let currentRole: 'user' | 'assistant' | null = null
    let currentContent = ''
    let title = '导入的对话'

    for (const line of lines) {
      if (line.startsWith('## 我')) {
        if (currentRole && currentContent.trim()) {
          messages.push({ role: currentRole as 'user' | 'assistant', content: currentContent.trim() })
        }
        currentRole = 'user'
        currentContent = ''
        continue
      }
      if (line.startsWith('## AI') || line.startsWith('## DeepSeek') || line.startsWith('## Gemini') || line.startsWith('## Groq') || line.startsWith('## Kimi')) {
        if (currentRole && currentContent.trim()) {
          messages.push({ role: currentRole as 'user' | 'assistant', content: currentContent.trim() })
        }
        currentRole = 'assistant'
        currentContent = ''
        continue
      }
      if (line.startsWith('# ')) {
        title = line.slice(2).trim() || title
        continue
      }
      if (line === '---') continue
      currentContent += line + '\n'
    }
    if (currentRole && currentContent.trim()) {
      messages.push({ role: currentRole as 'user' | 'assistant', content: currentContent.trim() })
    }

    if (messages.length === 0) {
      alert('未识别到对话内容，请确认文件格式为 Markdown 导出的对话记录。')
      return
    }

    const session = props.chat.createSession('deepseek', 'deepseek-chat')
    session.title = title
    for (const m of messages) {
      props.chat.addMessage(session.id, {
        id: generateId(),
        role: m.role,
        content: m.content,
        timestamp: Date.now(),
      })
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>对话历史</h2>
      <button class="icon-btn" @click="$emit('close')" aria-label="关闭">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <button class="new-chat-btn" @click="$emit('newChat')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      新建对话
    </button>

    <div class="search-box">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input v-model="search" placeholder="搜索对话..." class="search-input" />
    </div>

    <div class="session-list">
      <div
        v-for="s in filteredSessions"
        :key="s.id"
        class="session-item"
        :class="{ active: s.id === currentId, pinned: s.pinned }"
        @click="$emit('select', s.id)"
      >
        <button class="pin-btn" :class="{ on: s.pinned }" @click.stop="$emit('togglePin', s.id)" :aria-label="s.pinned ? '取消置顶' : '置顶'">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </button>
        <div class="session-info">
          <div class="session-title">{{ truncateText(s.title, 25) }}</div>
          <div class="session-time">{{ formatTime(s.updatedAt) }}</div>
        </div>
        <button
          class="del-btn"
          @click.stop="$emit('delete', s.id)"
          aria-label="删除对话"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
      <div v-if="filteredSessions.length === 0" class="empty-list">
        {{ search ? '无匹配结果' : '暂无对话记录' }}
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="footer-btn" @click="$emit('settings')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        设置
      </button>
      <div class="backup-row">
        <button class="backup-btn" @click="exportData">备份</button>
        <button class="backup-btn" @click="importData">恢复</button>
        <button class="backup-btn" @click="openImportChat">导入</button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display:none"
          @change="handleImport"
        />
        <input
          ref="importFileInput"
          type="file"
          accept=".md"
          style="display:none"
          @change="handleImportChat"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 10;
  padding-bottom: env(safe-area-inset-bottom);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.new-chat-btn:active {
  border-color: var(--accent);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.search-input::placeholder { color: var(--text-tertiary); }

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  -webkit-overflow-scrolling: touch;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.1s;
}

.session-item:active, .session-item.active {
  background: var(--bg-hover);
}

.pin-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.pin-btn.on { opacity: 1; color: var(--accent); }

.session-item:active .pin-btn { opacity: 1; }

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.del-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.session-item:active .del-btn {
  opacity: 1;
}

.empty-list {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  width: 100%;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.footer-btn:active {
  background: var(--bg-hover);
}

.backup-row {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  padding: 0 4px;
}

.backup-btn {
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.backup-btn:active { border-color: var(--accent); color: var(--accent); }
</style>
