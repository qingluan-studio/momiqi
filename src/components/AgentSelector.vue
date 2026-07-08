<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAgentStore, type SubAgent, AGENT_LAYERS } from '../stores/agents'

const emit = defineEmits<{
  select: [agent: SubAgent]
  toggleDefault: []
}>()

const store = useAgentStore()
const showCreate = ref(false)
const searchQuery = ref('')
const collapsedLayers = ref<Set<string>>(new Set())
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

function toggleLayer(layerId: string) {
  if (collapsedLayers.value.has(layerId)) {
    collapsedLayers.value.delete(layerId)
  } else {
    collapsedLayers.value.add(layerId)
  }
}

function isLayerCollapsed(layerId: string): boolean {
  return collapsedLayers.value.has(layerId)
}

const filteredAgents = computed(() => {
  if (!searchQuery.value.trim()) {
    return null // null means show all by layers
  }
  return store.searchAgents(searchQuery.value)
})

const layerAgentCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const layer of AGENT_LAYERS) {
    counts[layer.id] = store.getAgentsByLayer(layer.id).length
  }
  return counts
})

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
      <h3>AI Agent 矩阵 <span class="count-badge">{{ store.agents.length }}</span></h3>
      <button class="add-agent-btn" @click="showCreate = !showCreate">
        {{ showCreate ? '取消' : '+ 自定义' }}
      </button>
    </div>

    <div class="search-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="searchQuery"
        class="search-input"
        placeholder="搜索 Agent（名称/角色/工具）..."
      />
      <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
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
      <!-- Default Assistant -->
      <button class="agent-card default-card" @click="$emit('toggleDefault')">
        <div class="agent-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div class="agent-body">
          <div>
            <div class="agent-name">通用助手</div>
            <div class="agent-desc">多服务智能路由，不限定角色</div>
          </div>
          <span class="layer-tag" style="background: rgba(99,102,241,0.15);color:#818cf8;">默认</span>
        </div>
      </button>

      <!-- Search Results -->
      <template v-if="filteredAgents">
        <div v-if="filteredAgents.length === 0" class="empty-result">
          未找到匹配 "{{ searchQuery }}" 的 Agent
        </div>
        <button
          v-for="agent in filteredAgents"
          :key="agent.id"
          class="agent-card"
          @click="$emit('select', agent)"
        >
          <div class="agent-icon" :style="agent.layer ? { background: AGENT_LAYERS.find(l => l.id === agent.layer) ? `rgba(${l2rgb(AGENT_LAYERS.find(l => l.id === agent.layer)!.color)},0.15)` : 'var(--bg-tertiary)' } : 'var(--bg-tertiary)'">
            <span class="agent-emoji">{{ agent.icon }}</span>
          </div>
          <div class="agent-body">
            <div>
              <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-desc">{{ agent.description }}</div>
            </div>
            <span v-if="agent.layer" class="layer-tag" :style="layerStyle(agent.layer)">{{ AGENT_LAYERS.find(l => l.id === agent.layer)?.nameZh || agent.layer }}</span>
          </div>
        </button>
      </template>

      <!-- Layer Groups -->
      <template v-else>
        <div v-for="layer in AGENT_LAYERS" :key="layer.id" class="layer-group">
          <button class="layer-header" @click="toggleLayer(layer.id)">
            <span class="layer-emoji">{{ layer.emoji }}</span>
            <span class="layer-name">{{ layer.nameZh }}</span>
            <span class="layer-count">{{ layerAgentCounts[layer.id] }}</span>
            <span class="layer-subname">{{ layer.name }}</span>
            <svg class="layer-arrow" :class="{ collapsed: isLayerCollapsed(layer.id) }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div v-if="!isLayerCollapsed(layer.id)" class="layer-agents">
            <button
              v-for="agent in store.getAgentsByLayer(layer.id)"
              :key="agent.id"
              class="agent-card"
              @click="$emit('select', agent)"
            >
              <div class="agent-icon" :style="{ background: `rgba(${l2rgb(layer.color)},0.12)` }">
                <span class="agent-emoji">{{ agent.icon }}</span>
              </div>
              <div class="agent-body">
                <div>
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-desc">{{ agent.role || agent.description }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
function l2rgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function layerStyle(layerId: string): Record<string, string> {
  const layer = AGENT_LAYERS.find(l => l.id === layerId)
  if (!layer) return {}
  return {
    background: `rgba(${l2rgb(layer.color)},0.15)`,
    color: layer.color,
  }
}
</script>

<style scoped>
.agent-selector {
  padding: 16px;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.selector-header h3 {
  margin: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  font-size: 11px;
  background: rgba(99,102,241,0.15);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.add-agent-btn {
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.search-box:focus-within {
  border-color: var(--accent);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  flex-shrink: 0;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
  flex-shrink: 0;
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

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
}

.agent-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}

.agent-card:hover {
  border-color: var(--accent);
  background: rgba(99,102,241,0.04);
  transform: translateX(2px);
}

.default-card {
  border-color: rgba(99,102,241,0.3);
  background: rgba(99,102,241,0.06);
}

.agent-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.agent-emoji {
  font-size: 16px;
  line-height: 1;
}

.agent-body {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.agent-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.agent-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.layer-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Layer Groups */
.layer-group {
  margin-bottom: 2px;
}

.layer-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  transition: background 0.15s;
  margin-top: 4px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.layer-header:hover {
  background: var(--bg-tertiary);
}

.layer-emoji {
  font-size: 15px;
}

.layer-name {
  flex-shrink: 0;
}

.layer-subname {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 400;
  flex: 1;
}

.layer-count {
  font-size: 10px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  padding: 1px 7px;
  border-radius: 8px;
  font-weight: 500;
}

.layer-arrow {
  flex-shrink: 0;
  transition: transform 0.2s;
  color: var(--text-tertiary);
}

.layer-arrow.collapsed {
  transform: rotate(-90deg);
}

.layer-agents {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 0 4px 8px;
}

.empty-result {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-tertiary);
  font-size: 13px;
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
