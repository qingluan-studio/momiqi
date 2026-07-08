<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSuperAgent } from '../stores/super-agent'
import { useSelfEvolution } from '../stores/self-evolution'
import { AGENT_LAYERS } from '../stores/agents'

const emit = defineEmits<{
  close: []
  switchToSuper: [prompt: string]
}>()

const superAgent = useSuperAgent()
const evolution = useSelfEvolution()

const activeTab = ref<'overview' | 'capabilities' | 'evolution' | 'backups' | 'weblearn' | 'log'>('overview')
const confirmToggle = ref(false)
const confirmEvolve = ref(false)
const searchQuery = ref('')
const evolutionDescription = ref('')

const theme = computed(() => superAgent.state.enabled ? '#22d3ee' : '#6b7280')

const capList = computed(() => superAgent.buildCapabilities())

const sortedHistory = computed(() =>
  [...evolution.state.history].sort((a, b) => b.timestamp - a.timestamp)
)

const sortedBackups = computed(() =>
  [...evolution.state.backups].sort((a, b) => b.timestamp - a.timestamp)
)

const sortedLearnings = computed(() =>
  [...evolution.state.webLearnings].sort((a, b) => b.timestamp - a.timestamp)
)

function handleToggleSuper() {
  if (!superAgent.state.enabled && !confirmToggle.value) {
    confirmToggle.value = true
    setTimeout(() => { confirmToggle.value = false }, 5000)
    return
  }
  superAgent.toggle()
  confirmToggle.value = false
}

function handleToggleEvolution() {
  if (!evolution.state.enabled) {
    evolution.createBackup('启用自我进化前自动备份')
  }
  evolution.toggleEvolution()
}

function handleEvolve() {
  if (!confirmEvolve.value) {
    confirmEvolve.value = true
    setTimeout(() => { confirmEvolve.value = false }, 5000)
    return
  }
  const desc = evolutionDescription.value || '手动触发进化'
  evolution.evolveCode(desc)
  superAgent.recordEvolution()
  evolutionDescription.value = ''
  confirmEvolve.value = false
}

function handleSearch() {
  if (!searchQuery.value.trim()) return
  evolution.autoSearchAndLearn(searchQuery.value.trim())
  searchQuery.value = ''
}

function handleApplyLearning(id: string) {
  evolution.applyLearning(id)
}

function handleRestore(id: string) {
  if (confirm('确定要恢复到该备份吗？此操作不可撤销。')) {
    evolution.restoreBackup(id)
  }
}

function handleRepair() {
  evolution.repairStability()
}

function handleSwitchToSuper() {
  emit('switchToSuper', superAgent.getActiveSystemPrompt())
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const stabilityColor = computed(() => {
  const s = evolution.state.stabilityScore
  if (s >= 80) return '#22c55e'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
})

const stabilityLabel = computed(() => {
  const s = evolution.state.stabilityScore
  if (s >= 90) return '极稳'
  if (s >= 80) return '稳定'
  if (s >= 60) return '波动'
  return '危险'
})

onMounted(() => {
  superAgent.buildCapabilities()
})
</script>

<template>
  <div class="sa-panel">
    <div class="sa-header">
      <div class="sa-title-row">
        <div class="sa-icon-wrapper" :style="{ background: `linear-gradient(135deg, ${theme}, #6366f1)` }">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>
        <div class="sa-title-info">
          <h2 class="sa-title">HOPE 超级助手</h2>
          <span class="sa-version">v{{ superAgent.state.version }} | {{ superAgent.getStats().totalAgents }} Agent 融合</span>
        </div>
      </div>

      <div class="sa-controls">
        <button
          class="sa-btn sa-btn-primary"
          :class="{ active: superAgent.state.enabled }"
          @click="handleToggleSuper"
        >
          <span class="sa-btn-dot" :class="{ on: superAgent.state.enabled }" />
          {{ superAgent.state.enabled ? (confirmToggle ? '再次确认关闭' : '已启用') : (confirmToggle ? '再次确认启用' : '已关闭') }}
        </button>
        <button class="sa-btn sa-btn-ghost" @click="emit('close')">关闭</button>
      </div>
    </div>

    <div class="sa-tabs">
      <button
        v-for="tab in [
          { id: 'overview', label: '总览' },
          { id: 'capabilities', label: '能力' },
          { id: 'evolution', label: '进化' },
          { id: 'backups', label: '备份' },
          { id: 'weblearn', label: '学习' },
          { id: 'log', label: '日志' },
        ]"
        :key="tab.id"
        class="sa-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id as any"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="sa-body">

      <div v-if="activeTab === 'overview'" class="sa-section">
        <div class="sa-stats-grid">
          <div class="sa-stat" style="--accent: #6366f1">
            <span class="sa-stat-val">{{ superAgent.getStats().totalAgents }}</span>
            <span class="sa-stat-label">融合 Agent</span>
          </div>
          <div class="sa-stat" style="--accent: #22d3ee">
            <span class="sa-stat-val">{{ evolution.state.totalEvolutions }}</span>
            <span class="sa-stat-label">进化次数</span>
          </div>
          <div class="sa-stat" style="--accent: #a78bfa">
            <span class="sa-stat-val">{{ evolution.state.backups.length }}</span>
            <span class="sa-stat-label">备份快照</span>
          </div>
          <div class="sa-stat" style="--accent: #34d399">
            <span class="sa-stat-val">{{ evolution.state.webLearnings.length }}</span>
            <span class="sa-stat-label">网络学习</span>
          </div>
        </div>

        <div class="sa-card">
          <div class="sa-card-header">
            <span class="sa-card-title">稳定性评分</span>
            <span class="sa-card-badge" :style="{ color: stabilityColor, borderColor: stabilityColor }">
              {{ stabilityLabel }} | {{ evolution.state.stabilityScore }}/100
            </span>
          </div>
          <div class="sa-progress-bar">
            <div class="sa-progress-fill" :style="{ width: evolution.state.stabilityScore + '%', background: stabilityColor }" />
          </div>
          <div class="sa-card-actions">
            <button class="sa-btn sa-btn-sm" @click="handleRepair">修复稳定性</button>
          </div>
        </div>

        <div class="sa-card">
          <div class="sa-card-header">
            <span class="sa-card-title">进化控制</span>
          </div>
          <div class="sa-switch-row">
            <div class="sa-switch-item">
              <span>自我进化</span>
              <button class="sa-toggle" :class="{ on: evolution.state.enabled }" @click="handleToggleEvolution">
                <span class="sa-toggle-knob" />
              </button>
            </div>
            <div class="sa-switch-item">
              <span>安全模式</span>
              <button class="sa-toggle" :class="{ on: evolution.state.safeMode }" @click="evolution.toggleSafeMode()">
                <span class="sa-toggle-knob" />
              </button>
            </div>
            <div class="sa-switch-item">
              <span>自动提交</span>
              <button class="sa-toggle" :class="{ on: evolution.state.autoCommit }" @click="evolution.toggleAutoCommit()">
                <span class="sa-toggle-knob" />
              </button>
            </div>
            <div class="sa-switch-item">
              <span>紧凑模式</span>
              <button class="sa-toggle" :class="{ on: superAgent.state.compactMode }" @click="superAgent.toggleCompact()">
                <span class="sa-toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        <div class="sa-card">
          <div class="sa-card-header">
            <span class="sa-card-title">手动进化</span>
          </div>
          <div class="sa-input-row">
            <input
              v-model="evolutionDescription"
              class="sa-input"
              placeholder="描述你想让 AI 学习或改进的内容..."
              @keyup.enter="handleEvolve"
            />
            <button
              class="sa-btn sa-btn-accent"
              :disabled="!evolution.state.enabled"
              @click="handleEvolve"
            >
              {{ confirmEvolve ? '确认进化' : '进化' }}
            </button>
          </div>
        </div>

        <div class="sa-card">
          <div class="sa-card-header">
            <span class="sa-card-title">切换到超级助手</span>
          </div>
          <p class="sa-card-desc">将当前对话的上下文切换为超级助手，获得融合全部 Agent 能力的统一对话体验。</p>
          <button class="sa-btn sa-btn-primary" @click="handleSwitchToSuper" style="width:100%;margin-top:8px">
            切换为超级助手模式
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'capabilities'" class="sa-section">
        <div v-for="cap in capList" :key="cap.layer" class="sa-cap-card" :style="{ borderLeftColor: cap.color }">
          <div class="sa-cap-header">
            <span class="sa-cap-layer" :style="{ color: cap.color }">{{ cap.layer }} {{ cap.layerName }}</span>
            <span class="sa-cap-count">{{ cap.agents.length }} Agent | {{ cap.tools.length }} 工具 | {{ cap.expertise.length }} 专长</span>
          </div>
          <div class="sa-cap-body">
            <div class="sa-cap-section">
              <span class="sa-cap-label">Agent</span>
              <div class="sa-cap-tags">
                <span v-for="name in cap.agents" :key="name" class="sa-tag sa-tag-agent">{{ name }}</span>
              </div>
            </div>
            <div class="sa-cap-section">
              <span class="sa-cap-label">工具</span>
              <div class="sa-cap-tags">
                <span v-for="tool in cap.tools" :key="tool" class="sa-tag sa-tag-tool">{{ tool }}</span>
              </div>
            </div>
            <div class="sa-cap-section">
              <span class="sa-cap-label">专长</span>
              <div class="sa-cap-tags">
                <span v-for="exp in cap.expertise" :key="exp" class="sa-tag sa-tag-exp">{{ exp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'evolution'" class="sa-section">
        <div class="sa-evo-search">
          <input
            v-model="searchQuery"
            class="sa-input"
            placeholder="搜索公开网页资源供 AI 学习..."
            @keyup.enter="handleSearch"
          />
          <button class="sa-btn sa-btn-accent" @click="handleSearch" :disabled="!searchQuery.trim()">
            搜索
          </button>
        </div>

        <div v-if="sortedHistory.length === 0" class="sa-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span>尚未触发进化，请开启自我进化开关</span>
        </div>

        <div v-for="entry in sortedHistory" :key="entry.id" class="sa-evo-entry">
          <div class="sa-evo-header">
            <span class="sa-evo-type" :class="entry.type">{{ entry.type === 'self_refactor' ? '重构' : entry.type === 'knowledge_update' ? '知识' : entry.type === 'web_learned' ? '学习' : entry.type === 'bug_fix' ? '修复' : entry.type === 'capability_merge' ? '融合' : '优化' }}</span>
            <span class="sa-evo-version">{{ entry.beforeVersion }} &rarr; {{ entry.afterVersion }}</span>
            <span class="sa-evo-time">{{ formatDate(entry.timestamp) }}</span>
          </div>
          <p class="sa-evo-desc">{{ entry.description }}</p>
          <div class="sa-evo-meta">
            <span v-if="entry.verified" class="sa-badge sa-badge-ok">已验证</span>
            <span v-else class="sa-badge sa-badge-warn">未验证</span>
            <span v-if="entry.reverted" class="sa-badge sa-badge-err">已回退</span>
            <span class="sa-evo-source">来源: {{ entry.source }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'backups'" class="sa-section">
        <div v-if="sortedBackups.length === 0" class="sa-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="12" r="3" />
          </svg>
          <span>暂无备份，启用自我进化后会自动创建</span>
        </div>

        <div v-for="backup in sortedBackups" :key="backup.id" class="sa-card">
          <div class="sa-card-header">
            <span class="sa-card-title">{{ backup.description }}</span>
            <span class="sa-card-badge" style="color: #22d3ee;border-color:#22d3ee">v{{ backup.version }}</span>
          </div>
          <div class="sa-card-meta">
            <span>{{ formatDate(backup.timestamp) }}</span>
            <span>校验: {{ backup.checksum }}</span>
            <span>{{ Object.keys(backup.codeSnapshot).length }} 项数据</span>
          </div>
          <button class="sa-btn sa-btn-sm sa-btn-danger" @click="handleRestore(backup.id)">恢复此备份</button>
        </div>
      </div>

      <div v-if="activeTab === 'weblearn'" class="sa-section">
        <div v-if="sortedLearnings.length === 0" class="sa-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          <span>暂无网络学习记录</span>
        </div>

        <div v-for="learning in sortedLearnings" :key="learning.id" class="sa-card">
          <div class="sa-card-header">
            <span class="sa-card-title">{{ learning.title }}</span>
            <span class="sa-card-badge" :class="{ 'sa-badge-applied': learning.applied, 'sa-badge-new': !learning.applied }">
              {{ learning.applied ? '已应用' : '待应用' }}
            </span>
          </div>
          <p class="sa-card-desc">{{ learning.keyInsight }}</p>
          <div class="sa-card-meta">
            <span>{{ formatDate(learning.timestamp) }}</span>
            <div class="sa-cap-tags" style="margin:0">
              <span v-for="tag in learning.tags" :key="tag" class="sa-tag sa-tag-tool">{{ tag }}</span>
            </div>
          </div>
          <button
            v-if="!learning.applied"
            class="sa-btn sa-btn-sm sa-btn-accent"
            @click="handleApplyLearning(learning.id)"
          >
            应用此学习
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'log'" class="sa-section">
        <div v-if="evolution.state.log.length === 0" class="sa-empty">
          <span>暂无日志</span>
        </div>
        <div v-for="(entry, i) in evolution.state.log.slice(0, 100)" :key="i" class="sa-log-entry">
          {{ entry }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.sa-panel {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.sa-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sa-title-info {
  display: flex;
  flex-direction: column;
}

.sa-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}

.sa-version {
  font-size: 11px;
  color: var(--text-tertiary);
}

.sa-controls {
  display: flex;
  gap: 8px;
}

.sa-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.sa-btn:active { transform: scale(0.97); }
.sa-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.sa-btn-primary {
  background: rgba(99,102,241,0.15);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.sa-btn-primary.active {
  background: rgba(34,211,238,0.15);
  color: #22d3ee;
  border-color: rgba(34,211,238,0.3);
}

.sa-btn-accent {
  background: rgba(99,102,241,0.15);
  color: #6366f1;
  border: 1px solid rgba(99,102,241,0.2);
}

.sa-btn-ghost {
  background: transparent;
  color: var(--text-tertiary);
}

.sa-btn-sm {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 6px;
}

.sa-btn-danger {
  background: rgba(239,68,68,0.1);
  color: #ef4444;
  border: 1px solid rgba(239,68,68,0.2);
}

.sa-btn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.sa-btn-dot.on { background: #22d3ee; }

.sa-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
  overflow-x: auto;
}

.sa-tab {
  flex: 1;
  padding: 10px 4px;
  border: none;
  background: none;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  white-space: nowrap;
  min-width: 0;
}

.sa-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.sa-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.sa-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sa-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.sa-stat {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent, #6366f1);
}

.sa-stat-val {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.sa-stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.sa-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border-color);
}

.sa-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sa-card-title {
  font-size: 14px;
  font-weight: 600;
}

.sa-card-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid;
}

.sa-card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.sa-card-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 6px;
  flex-wrap: wrap;
}

.sa-card-actions {
  margin-top: 10px;
}

.sa-progress-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0;
}

.sa-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease, background 0.3s;
}

.sa-switch-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sa-switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
}

.sa-toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: var(--bg-tertiary);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.sa-toggle.on { background: #22d3ee; }

.sa-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.sa-toggle.on .sa-toggle-knob { transform: translateX(20px); }

.sa-input-row {
  display: flex;
  gap: 8px;
}

.sa-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.sa-input:focus { border-color: var(--accent); }

.sa-evo-search {
  display: flex;
  gap: 8px;
}

.sa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.sa-evo-entry {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
}

.sa-evo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.sa-evo-type {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.sa-evo-type.self_refactor { background: rgba(99,102,241,0.15); color: #6366f1; }
.sa-evo-type.web_learned { background: rgba(34,211,238,0.15); color: #22d3ee; }
.sa-evo-type.knowledge_update { background: rgba(34,197,94,0.15); color: #22c55e; }
.sa-evo-type.bug_fix { background: rgba(239,68,68,0.15); color: #ef4444; }
.sa-evo-type.tool_add { background: rgba(168,85,247,0.15); color: #a855f7; }
.sa-evo-type.capability_merge { background: rgba(245,158,11,0.15); color: #f59e0b; }
.sa-evo-type.prompt_optimize { background: rgba(34,197,94,0.15); color: #22c55e; }

.sa-evo-version {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
}

.sa-evo-time {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-left: auto;
}

.sa-evo-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 6px;
}

.sa-evo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sa-evo-source {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-left: auto;
}

.sa-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
}

.sa-badge-ok { background: rgba(34,197,94,0.15); color: #22c55e; }
.sa-badge-warn { background: rgba(245,158,11,0.15); color: #f59e0b; }
.sa-badge-err { background: rgba(239,68,68,0.15); color: #ef4444; }

.sa-badge-applied { color: #22c55e !important; border-color: #22c55e !important; }
.sa-badge-new { color: #f59e0b !important; border-color: #f59e0b !important; }

.sa-cap-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-left-width: 3px;
}

.sa-cap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.sa-cap-layer {
  font-size: 14px;
  font-weight: 700;
}

.sa-cap-count {
  font-size: 10px;
  color: var(--text-tertiary);
}

.sa-cap-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sa-cap-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sa-cap-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sa-cap-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sa-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.sa-tag-agent { background: rgba(99,102,241,0.1); color: #818cf8; border: 1px solid rgba(99,102,241,0.15); }
.sa-tag-tool { background: rgba(34,211,238,0.1); color: #22d3ee; border: 1px solid rgba(34,211,238,0.15); }
.sa-tag-exp { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.15); }

.sa-log-entry {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 6px 10px;
  border-left: 2px solid var(--border-color);
  font-family: monospace;
  line-height: 1.5;
}
</style>
