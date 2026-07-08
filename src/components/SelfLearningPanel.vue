<script setup lang="ts">
import { computed } from 'vue'
import { useSelfLearning, type Insight, type Pattern, type TimelineEvent } from '../stores/self-learning'

defineEmits<{
  generateReport: []
}>()

const selfLearning = useSelfLearning()
const state = selfLearning.state

const coreMetrics = computed(() => [
  { label: '会话数', value: state.totalSessions, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', color: '#6366f1' },
  { label: '交互数', value: state.totalInteractions.toLocaleString(), icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: '#a855f7' },
  { label: '洞察数', value: state.totalInsights, icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: '#06b6d4' },
  { label: '模式数', value: state.totalPatterns, icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', color: '#22c55e' },
])

const rates = computed(() => [
  { label: '学习速率', value: (state.learningRate * 100).toFixed(0) + '%', sub: '自驱动优化效率', color: '#6366f1' },
  { label: '有用率', value: (state.usefulnessRate * 100).toFixed(0) + '%', sub: '洞察采纳比例', color: '#22c55e' },
  { label: '高峰时段', value: state.peakHours, sub: '交互密集窗口', color: '#f59e0b' },
])

const timelineLabels: Record<TimelineEvent['type'], string> = {
  milestone: '里程碑',
  breakthrough: '突破',
  improvement: '优化',
  discovery: '发现',
}

const timelineColors: Record<TimelineEvent['type'], string> = {
  milestone: '#a855f7',
  breakthrough: '#f59e0b',
  improvement: '#22c55e',
  discovery: '#06b6d4',
}

const impactLabels: Record<Insight['impact'], string> = {
  high: '高影响',
  medium: '中影响',
  low: '低影响',
}

const impactColors: Record<Insight['impact'], string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}月前`
}
</script>

<template>
  <div class="self-learning">
    <div class="header">
      <div class="header-left">
        <h2 class="title">自学习系统</h2>
        <div class="subtitle">持续进化，日臻完善</div>
      </div>
      <button class="report-btn" @click="$emit('generateReport')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span>生成报告</span>
      </button>
    </div>

    <div class="metrics-row">
      <div v-for="m in coreMetrics" :key="m.label" class="metric-card">
        <div class="metric-top">
          <span class="metric-label">{{ m.label }}</span>
          <span class="metric-value">{{ m.value }}</span>
        </div>
        <div class="metric-icon" :style="{ background: m.color + '20', color: m.color }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="m.icon" />
          </svg>
        </div>
      </div>
    </div>

    <div class="rates-row">
      <div v-for="r in rates" :key="r.label" class="rate-card">
        <div class="rate-label">{{ r.label }}</div>
        <div class="rate-value" :style="{ color: r.color }">{{ r.value }}</div>
        <div class="rate-sub">{{ r.sub }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>最近洞察</h3>
        <span class="section-count">{{ state.insights.length }} 条</span>
      </div>
      <div class="insight-list">
        <div v-for="insight in state.insights.slice(0, 6)" :key="insight.id" class="insight-item">
          <div class="insight-left">
            <div class="insight-dot" :style="{ background: impactColors[insight.impact] }" />
            <div class="insight-body">
              <div class="insight-title">{{ insight.title }}</div>
              <div class="insight-desc">{{ insight.description }}</div>
              <div class="insight-meta">
                <span class="insight-source">{{ insight.source }}</span>
                <span class="insight-time">{{ formatTime(insight.timestamp) }}</span>
                <span class="insight-impact-tag" :style="{ background: impactColors[insight.impact] + '20', color: impactColors[insight.impact] }">
                  {{ impactLabels[insight.impact] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>发现模式</h3>
        <span class="section-count">{{ state.patterns.length }} 个</span>
      </div>
      <div class="pattern-list">
        <div v-for="pattern in state.patterns" :key="pattern.id" class="pattern-item">
          <div class="pattern-header">
            <span class="pattern-category">{{ pattern.category }}</span>
            <span class="pattern-confidence">{{ (pattern.confidence * 100).toFixed(0) }}% 置信</span>
          </div>
          <div class="pattern-name">{{ pattern.name }}</div>
          <div class="pattern-desc">{{ pattern.description }}</div>
          <div class="pattern-footer">
            <span class="pattern-freq">频率: {{ pattern.frequency }}次/周期</span>
            <span class="pattern-time">{{ formatTime(pattern.discoveredAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>进化时间线</h3>
        <span class="section-count">{{ state.timeline.length }} 事件</span>
      </div>
      <div class="timeline">
        <div v-for="(event, idx) in state.timeline" :key="event.id" class="timeline-item">
          <div class="timeline-line">
            <div class="timeline-dot" :style="{ background: timelineColors[event.type] }" />
            <div v-if="idx < state.timeline.length - 1" class="timeline-connector" />
          </div>
          <div class="timeline-content">
            <div class="timeline-type" :style="{ color: timelineColors[event.type] }">
              {{ timelineLabels[event.type] }}
            </div>
            <div class="timeline-title">{{ event.title }}</div>
            <div class="timeline-desc">{{ event.description }}</div>
            <div class="timeline-time">{{ formatTime(event.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-cards">
      <div class="section half">
        <div class="section-header">
          <h3>Top 技能</h3>
        </div>
        <div class="top-list">
          <div v-for="skill in state.topSkills" :key="skill.name" class="top-item">
            <div class="top-rank" :class="{ 'top-rank-gold': state.topSkills.indexOf(skill) === 0 }">
              {{ state.topSkills.indexOf(skill) + 1 }}
            </div>
            <div class="top-body">
              <div class="top-name">{{ skill.name }}</div>
              <div class="top-stats">{{ skill.usage }} 次 / {{ (skill.successRate * 100).toFixed(0) }}% 成功率</div>
            </div>
            <div class="top-bar-wrap">
              <div class="top-bar">
                <div class="top-bar-fill" :style="{ width: skill.successRate * 100 + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section half">
        <div class="section-header">
          <h3>Top Agent</h3>
        </div>
        <div class="top-list">
          <div v-for="agent in state.topAgents" :key="agent.name" class="top-item">
            <div class="top-rank" :class="{ 'top-rank-gold': state.topAgents.indexOf(agent) === 0 }">
              {{ state.topAgents.indexOf(agent) + 1 }}
            </div>
            <div class="top-body">
              <div class="top-name">{{ agent.name }}</div>
              <div class="top-stats">{{ agent.tasks }} 任务 / {{ (agent.efficiency * 100).toFixed(0) }}% 效率</div>
            </div>
            <div class="top-bar-wrap">
              <div class="top-bar">
                <div class="top-bar-fill agent-bar" :style="{ width: agent.efficiency * 100 + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.self-learning {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  overflow-y: auto;
}

.header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2px;
}
.header-left { display: flex; flex-direction: column; gap: 2px; }
.title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.subtitle { font-size: 12px; color: var(--text-tertiary); }

.report-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px;
  border: 1px solid rgba(99,102,241,0.25);
  background: rgba(99,102,241,0.1);
  color: var(--accent);
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: background 0.15s;
}
.report-btn:hover { background: rgba(99,102,241,0.2); }

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex; align-items: center; justify-content: space-between;
}
.metric-top { display: flex; flex-direction: column; gap: 2px; }
.metric-label { font-size: 10px; color: var(--text-tertiary); }
.metric-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.metric-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}

.rates-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.rate-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.rate-label { font-size: 11px; color: var(--text-tertiary); }
.rate-value { font-size: 20px; font-weight: 700; }
.rate-sub { font-size: 10px; color: var(--text-tertiary); }

.section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
}

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.section-header h3 {
  font-size: 13px; font-weight: 600; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.section-count { font-size: 11px; color: var(--text-tertiary); }

.insight-list { display: flex; flex-direction: column; gap: 10px; }
.insight-item { padding-bottom: 10px; border-bottom: 1px solid var(--border-color); }
.insight-item:last-child { padding-bottom: 0; border-bottom: none; }

.insight-left { display: flex; gap: 10px; }
.insight-dot {
  width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0;
}
.insight-body { flex: 1; min-width: 0; }
.insight-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.insight-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
.insight-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.insight-source { font-size: 10px; color: var(--text-tertiary); }
.insight-time { font-size: 10px; color: var(--text-tertiary); }
.insight-impact-tag { font-size: 9px; padding: 1px 6px; border-radius: 4px; font-weight: 500; }

.pattern-list { display: flex; flex-direction: column; gap: 8px; }
.pattern-item {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 10px 12px;
}

.pattern-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}
.pattern-category { font-size: 10px; color: var(--accent); font-weight: 500; }
.pattern-confidence { font-size: 10px; color: #22c55e; }

.pattern-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
.pattern-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 6px; }
.pattern-footer { display: flex; align-items: center; justify-content: space-between; }
.pattern-freq { font-size: 10px; color: var(--text-tertiary); }
.pattern-time { font-size: 10px; color: var(--text-tertiary); }

.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; gap: 10px; }

.timeline-line {
  display: flex; flex-direction: column; align-items: center;
  width: 16px; flex-shrink: 0;
}
.timeline-dot {
  width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0;
}
.timeline-connector {
  width: 2px; flex: 1; min-height: 20px; background: var(--bg-tertiary);
}

.timeline-content {
  flex: 1; padding-bottom: 12px;
}
.timeline-type { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
.timeline-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
.timeline-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 3px; }
.timeline-time { font-size: 10px; color: var(--text-tertiary); }

.bottom-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.half { padding: 12px; }

.top-list { display: flex; flex-direction: column; gap: 8px; }
.top-item { display: flex; align-items: center; gap: 8px; }

.top-rank {
  width: 22px; height: 22px; border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-size: 11px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.top-rank-gold { background: rgba(245,158,11,0.15); color: #f59e0b; }

.top-body { flex: 1; min-width: 0; }
.top-name { font-size: 12px; font-weight: 500; color: var(--text-primary); }
.top-stats { font-size: 10px; color: var(--text-tertiary); margin-top: 1px; }

.top-bar-wrap { width: 60px; flex-shrink: 0; }
.top-bar { height: 4px; border-radius: 2px; background: var(--bg-tertiary); overflow: hidden; }
.top-bar-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), #a855f7);
}
.top-bar-fill.agent-bar { background: linear-gradient(90deg, #06b6d4, #22c55e); }
</style>
