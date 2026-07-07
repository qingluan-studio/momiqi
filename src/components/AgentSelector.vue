<script setup lang="ts">
import { ref } from 'vue'
import { useAgentStore, type SubAgent } from '../stores/agents'

const emit = defineEmits<{
  select: [agent: SubAgent]
  toggleDefault: []
}>()

const store = useAgentStore()
const showCreate = ref(false)
const newName = ref('')
const newDesc = ref('')
const newPrompt = ref('')
const newIcon = ref('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z')

const iconOptions = [
  { label: '对话', d: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { label: '代码', d: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  { label: '笔', d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { label: '图', d: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: '书', d: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { label: '火箭', d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012.59-3.38C14.18 5.55 18 3 18 3c0 3.72-2.62 7.35-4.41 9.41A22 22 0 0112 15z' },
]

function handleCreate() {
  if (!newName.value.trim() || !newPrompt.value.trim()) return
  store.addAgent(newName.value, newDesc.value || newName.value, newPrompt.value, newIcon.value)
  newName.value = ''
  newDesc.value = ''
  newPrompt.value = ''
  showCreate.value = false
}

function handleDelete(id: string) {
  store.removeAgent(id)
}
</script>

<template>
  <div class="agent-selector">
    <div class="selector-header">
      <h3>选择 AI 子代理</h3>
      <button class="add-agent-btn" @click="showCreate = !showCreate">
        {{ showCreate ? '取消' : '+ 自定义' }}
      </button>
    </div>

    <Transition name="fade">
      <div v-if="showCreate" class="create-form">
        <input v-model="newName" class="form-input" placeholder="代理名称" />
        <input v-model="newDesc" class="form-input" placeholder="简短描述" />
        <div class="icon-picker">
          <button
            v-for="icon in iconOptions"
            :key="icon.label"
            :class="{ active: newIcon === icon.d }"
            @click="newIcon = icon.d"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path :d="icon.d" />
            </svg>
          </button>
        </div>
        <textarea v-model="newPrompt" class="form-textarea" placeholder="System Prompt（定义代理的角色和能力）..." rows="3" />
        <button class="form-btn" @click="handleCreate">创建代理</button>
      </div>
    </Transition>

    <div class="agent-list">
      <button
        class="agent-card default-card"
        @click="$emit('toggleDefault')"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
        <div>
          <div class="agent-name">通用助手</div>
          <div class="agent-desc">多服务智能路由，不限定角色</div>
        </div>
      </button>

      <button
        v-for="agent in store.agents"
        :key="agent.id"
        class="agent-card"
        @click="$emit('select', agent)"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path :d="agent.icon" />
        </svg>
        <div class="agent-info">
          <div class="agent-name">{{ agent.name }}</div>
          <div class="agent-desc">{{ agent.description }}</div>
        </div>
        <button
          v-if="!agent.isBuiltin"
          class="del-agent-btn"
          @click.stop="handleDelete(agent.id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </button>
    </div>
  </div>
</template>

<style scoped>
.agent-selector {
  padding: 16px;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selector-header h3 { margin: 0; font-size: 16px; }

.add-agent-btn {
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 12px;
  cursor: pointer;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-textarea { resize: vertical; }

.icon-picker { display: flex; gap: 4px; }
.icon-picker button {
  width: 32px; height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.icon-picker button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

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

.agent-list { display: flex; flex-direction: column; gap: 6px; }

.agent-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.1s;
}

.agent-card:active, .agent-card:hover { border-color: var(--accent); }

.default-card { border-color: var(--accent); background: rgba(99,102,241,0.05); }

.agent-info { flex: 1; min-width: 0; }

.agent-name { font-size: 14px; font-weight: 600; }

.agent-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.del-agent-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
