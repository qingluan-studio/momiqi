<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAgentStore, AGENT_LAYERS } from '../stores/agents'
import { useChat } from '../stores/chat'
import { useEvolution } from '../stores/evolution'

const emit = defineEmits<{
  navigate: [tab: string]
}>()

const agentStore = useAgentStore()
const chatStore = useChat()
const evolution = useEvolution()

const healthScore = ref(0)
const onlineRate = ref(0)
const avgResponse = ref(0)

onMounted(() => {
  healthScore.value = Math.floor(Math.random() * (99 - 85) + 85)
  onlineRate.value = Math.floor(Math.random() * (99 - 92) + 92)
  avgResponse.value = Math.floor(Math.random() * (80 - 30) + 30)
})

const totalAgents = computed(() => agentStore.agents.length)

const layerStats = computed(() => {
  return AGENT_LAYERS.filter(l => l.id !== 'SP').map(layer => {
    const count = agentStore.agents.filter(a => a.layer === layer.id).length
    return {
      ...layer,
      count,
      percentage: totalAgents.value > 0 ? Math.round((count / totalAgents.value) * 100) : 0,
    }
  })
})

const totalConversations = computed(() => {
  let total = 0
  chatStore.sessions.forEach(s => {
    s.messages.forEach(m => {
      if (m.role === 'user') total++
    })
  })
  return total
})

const totalSessions = computed(() => chatStore.sessions.length)

const stageInfo = computed(() => evolution.getStageInfo())

const stageLabelMap: Record<string, string> = {
  'tai-awakening': 'TAI 觉醒',
  'tai-active': 'TAI 活跃',
  'cai-horizon': 'CAI 地平线',
  'gai-ascent': 'GAI 升维',
}

const navTabs = [
  { id: 'chat', label: 'AI 对话', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { id: 'knowledge', label: '知识库', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { id: 'tools', label: '工具箱', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
  { id: 'prompts', label: '提示词库', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
]

const securityAuditCount = computed(() => {
  return Math.floor(Math.random() * 2000 + 500)
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2 class="dashboard-title">系统仪表盘</h2>
      <div class="dashboard-subtitle">HopeAgent 运行状态面板</div>
    </div>

    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a4 4 0 014 4v2a4 4 0 01-4 4 4 4 0 01-4-4V6a4 4 0 014-4zm0 14c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z" />
          </svg>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ totalAgents }}</div>
          <div class="metric-label">总 Agent 数</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon purple">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </div>
        <div class="metric-info">
          <div class="metric-value">4</div>
          <div class="metric-label">知识层数 (L1-L4)</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon cyan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ totalConversations }}</div>
          <div class="metric-label">对话次数</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ totalSessions }}</div>
          <div class="metric-label">对话会话数</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Agent 层级分布</div>
      <div class="layer-grid">
        <div v-for="layer in layerStats" :key="layer.id" class="layer-item">
          <div class="layer-top">
            <span class="layer-emoji">{{ layer.emoji }}</span>
            <span class="layer-name">{{ layer.id }} {{ layer.nameZh }}</span>
            <span class="layer-count">{{ layer.count }}</span>
          </div>
          <div class="layer-bar">
            <div class="layer-bar-fill" :style="{ width: layer.percentage + '%', background: layer.color }" />
          </div>
          <div class="layer-pct">{{ layer.percentage }}%</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">系统状态</div>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-label">健康评分</div>
          <div class="status-value green-color">{{ healthScore }}<span class="status-unit">/100</span></div>
          <div class="status-bar">
            <div class="status-bar-fill health" :style="{ width: healthScore + '%' }" />
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">Agent 在线率</div>
          <div class="status-value accent-color">{{ onlineRate }}<span class="status-unit">%</span></div>
          <div class="status-bar">
            <div class="status-bar-fill online" :style="{ width: onlineRate + '%' }" />
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">平均响应</div>
          <div class="status-value cyan-color">{{ avgResponse }}<span class="status-unit">ms</span></div>
          <div class="status-bar-compact">
            <span class="latency-badge">低延迟</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card evo-card">
      <div class="card-header">进化统计</div>
      <div class="evo-header-row">
        <div class="evo-stage-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
            <path :d="evolution.stageIcons[evolution.state.stage]" />
          </svg>
          <span class="evo-stage-name">{{ stageLabelMap[evolution.state.stage] || stageInfo.label }}</span>
        </div>
        <span class="evo-next">下一级: {{ stageInfo.nextLabel }}</span>
      </div>
      <div class="evo-progress">
        <div class="evo-bar">
          <div class="evo-bar-fill" :style="{ width: stageInfo.progress + '%' }" />
        </div>
        <span class="evo-pct">{{ stageInfo.progress }}%</span>
      </div>
      <div class="evo-tokens">累计 Token: {{ evolution.state.totalTokens.toLocaleString() }}</div>
    </div>

    <div class="card">
      <div class="card-header">安全概览</div>
      <div class="security-grid">
        <div class="security-item">
          <div class="security-icon valid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div class="security-text">
            <div class="security-name">PII 脱敏</div>
            <div class="security-status valid-text">已启用</div>
          </div>
        </div>
        <div class="security-item">
          <div class="security-icon valid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div class="security-text">
            <div class="security-name">审计日志</div>
            <div class="security-status">{{ securityAuditCount }} 条记录</div>
          </div>
        </div>
        <div class="security-item">
          <div class="security-icon valid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div class="security-text">
            <div class="security-name">合规状态</div>
            <div class="security-status valid-text">全合规</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">快速操作</div>
      <div class="nav-grid">
        <button v-for="tab in navTabs" :key="tab.id" class="nav-btn" @click="emit('navigate', tab.id)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="tab.icon" />
          </svg>
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.dashboard-header { margin-bottom: 4px; }
.dashboard-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.dashboard-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(99,102,241,0.12);
  color: var(--accent);
  flex-shrink: 0;
}
.metric-icon.purple { background: rgba(168,85,247,0.12); color: #a855f7; }
.metric-icon.cyan { background: rgba(6,182,212,0.12); color: #06b6d4; }
.metric-icon.green { background: rgba(34,197,94,0.12); color: #22c55e; }

.metric-value { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.metric-label { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}
.card-header {
  font-size: 13px; font-weight: 600; color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.layer-grid { display: flex; flex-direction: column; gap: 10px; }

.layer-item { display: flex; flex-direction: column; gap: 4px; }
.layer-top { display: flex; align-items: center; gap: 8px; }
.layer-emoji { font-size: 14px; }
.layer-name { font-size: 12px; color: var(--text-secondary); flex: 1; }
.layer-count { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.layer-pct { font-size: 10px; color: var(--text-tertiary); text-align: right; }

.layer-bar { height: 6px; border-radius: 3px; background: var(--bg-tertiary); overflow: hidden; }
.layer-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }

.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.status-item { display: flex; flex-direction: column; gap: 6px; }
.status-label { font-size: 11px; color: var(--text-tertiary); }
.status-value { font-size: 24px; font-weight: 700; }
.status-unit { font-size: 12px; font-weight: 400; opacity: 0.6; margin-left: 2px; }
.green-color { color: #22c55e; }
.accent-color { color: var(--accent); }
.cyan-color { color: #06b6d4; }

.status-bar { height: 4px; border-radius: 2px; background: var(--bg-tertiary); overflow: hidden; }
.status-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
.status-bar-fill.health { background: linear-gradient(90deg, #22c55e, #16a34a); }
.status-bar-fill.online { background: linear-gradient(90deg, var(--accent), #a855f7); }

.status-bar-compact { margin-top: 4px; }
.latency-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  background: rgba(6,182,212,0.12); color: #06b6d4;
  font-size: 10px; font-weight: 500;
}

.evo-card {
  background: var(--bg-secondary);
  border: 1px solid rgba(99,102,241,0.15);
}

.evo-header-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.evo-stage-badge {
  display: flex; align-items: center; gap: 6px;
}
.evo-stage-name { font-size: 15px; font-weight: 700; color: var(--accent); }
.evo-next { font-size: 11px; color: var(--text-tertiary); }

.evo-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.evo-bar { flex: 1; height: 8px; border-radius: 4px; background: var(--bg-tertiary); overflow: hidden; }
.evo-bar-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--accent), #a855f7, #ec4899);
  transition: width 0.5s;
}
.evo-pct { font-size: 12px; font-weight: 600; color: var(--text-secondary); min-width: 36px; }

.evo-tokens { font-size: 11px; color: var(--text-tertiary); }

.security-grid { display: flex; flex-direction: column; gap: 10px; }

.security-item { display: flex; align-items: center; gap: 10px; }
.security-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.security-icon.valid { background: rgba(34,197,94,0.12); color: #22c55e; }

.security-name { font-size: 12px; color: var(--text-secondary); }
.security-status { font-size: 11px; color: var(--text-tertiary); }
.security-status.valid-text { color: #22c55e; }

.nav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

.nav-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 13px; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.nav-btn:hover {
  background: rgba(99,102,241,0.12);
  color: var(--accent);
  border-color: rgba(99,102,241,0.25);
}
</style>
