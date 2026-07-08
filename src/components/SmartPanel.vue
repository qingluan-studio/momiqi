<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToolRegistry } from '../stores/tool-registry'
import { usePlanner } from '../stores/planner'
import { useHumanSimulator, type HumanScript } from '../stores/human-simulator'
import { useSelfEvolution, type PersonalityTone } from '../stores/self-evolution'
import { useSuperAgent } from '../stores/super-agent'
import { exportAllData, importAllData } from '../utils/data-integrity'
import { generateId } from '../utils/markdown'

const emit = defineEmits<{
  close: []
  switchToSuper: [prompt: string]
}>()

const tools = useToolRegistry()
const planner = usePlanner()
const human = useHumanSimulator()
const evolution = useSelfEvolution()
const superAgent = useSuperAgent()

const activeTab = ref<'tools' | 'planner' | 'human' | 'evolve'>('evolve')

const newToolName = ref('')
const newToolDesc = ref('')
const showEvolveToolForm = ref(false)
const lastEvolveMsg = ref('')
const lastEvolveResult = ref<'idle' | 'success' | 'fail'>('idle')

const planGoal = ref('')
const showNewPlanForm = ref(false)
const selectedTplId = ref('')
const planCategory = ref('')
const stepDesc = ref('')
const stepPriority = ref<'critical' | 'high' | 'medium' | 'low'>('medium')
const stepMinutes = ref(5)
const showAddStep = ref(false)
const planStepTarget = ref('')

const scriptName = ref('')
const scriptCategory = ref<HumanScript['category']>('custom')
const quickActionType = ref<'click' | 'input' | 'scroll' | 'wait' | 'eval'>('click')
const quickActionDesc = ref('')
const quickActionSelector = ref('')
const quickActionValue = ref('')

const searchInput = ref('')
const searchResults = ref<any[]>([])
const showExportConfirm = ref(false)

const stats = computed(() => tools.getStats())
const summary = computed(() => evolution.getSummary())

const toolList = computed(() => {
  const all = [...tools.tools.value]
  return all.sort((a, b) => b.usageCount - a.usageCount)
})

const metricColor = computed(() => {
  const r = evolution.state.successRate
  if (r >= 90) return '#22c55e'
  if (r >= 75) return '#3b82f6'
  if (r >= 60) return '#f59e0b'
  return '#ef4444'
})

const effColor = computed(() => {
  const e = evolution.state.efficiency
  if (e >= 90) return '#22c55e'
  if (e >= 75) return '#3b82f6'
  if (e >= 60) return '#f59e0b'
  return '#ef4444'
})

function handleEvolveTool() {
  if (!newToolName.value.trim() || !newToolDesc.value.trim()) return
  const result = evolution.createToolInEvolution({
    name: newToolName.value.trim(),
    description: newToolDesc.value.trim(),
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    version: '1.0.0',
    source: 'evolution',
    params: [
      { name: 'input', type: 'string', description: '输入参数', required: true },
    ],
  })
  if (result) {
    lastEvolveMsg.value = `太棒了！新工具「${newToolName.value}」已经诞生，进化引擎正在欢呼！`
    lastEvolveResult.value = 'success'
    newToolName.value = ''
    newToolDesc.value = ''
    showEvolveToolForm.value = false
  } else {
    lastEvolveMsg.value = evolution.lastError.value || '嗯...创建失败了，可能是稳定性还不够。'
    lastEvolveResult.value = 'fail'
  }
  setTimeout(() => { lastEvolveResult.value = 'idle' }, 5000)
}

function handleEvolve() {
  if (!searchInput.value.trim()) return
  const result = evolution.evolveCode(searchInput.value.trim())
  if (result) {
    lastEvolveMsg.value = `进化成功！版本跃升至 ${result.afterVersion}，我们越来越强了～`
    lastEvolveResult.value = 'success'
    superAgent.recordEvolution()
  } else {
    lastEvolveMsg.value = evolution.lastError.value || '唔...这次进化没能完成，但不影响已有功能。'
    lastEvolveResult.value = 'fail'
  }
  searchInput.value = ''
  setTimeout(() => { lastEvolveResult.value = 'idle' }, 6000)
}

function handleCreatePlan() {
  if (!planGoal.value.trim()) return
  if (selectedTplId.value) {
    planner.createPlanFromTemplate(selectedTplId.value, planGoal.value.trim())
  } else {
    planner.createPlan('我的计划', planGoal.value.trim(), planCategory.value || '通用')
  }
  planGoal.value = ''
  selectedTplId.value = ''
  showNewPlanForm.value = false
}

function handleAddStep(planId: string) {
  if (!stepDesc.value.trim()) return
  planner.addStep(planId, {
    description: stepDesc.value.trim(),
    priority: stepPriority.value,
    dependsOn: [],
    assignedTool: '',
    assignedToolName: '',
    estimatedMinutes: stepMinutes.value,
    maxRetries: 3,
  })
  stepDesc.value = ''
  showAddStep.value = false
}

function handleStartPlan(id: string) { planner.startPlan(id) }
function handleCompleteStep(planId: string, stepId: string) {
  planner.updateStepStatus(planId, stepId, 'completed', '完成了！')
  planner.autoAdvance(planId)
}
function handleRetryStep(planId: string, stepId: string) { planner.retryStep(planId, stepId) }

function handleCreateScript() {
  if (!scriptName.value.trim()) return
  human.createScript(scriptName.value.trim(), '新建的自动化脚本', scriptCategory.value)
  scriptName.value = ''
}

function handleAddQuickAction(scriptId: string) {
  const action = human.createQuickAction(quickActionType.value, quickActionDesc.value, {
    selector: quickActionSelector.value,
    value: quickActionValue.value,
    duration: 500,
  })
  human.addAction(scriptId, action)
  quickActionDesc.value = ''
  quickActionSelector.value = ''
  quickActionValue.value = ''
}

function handleRunScript(scriptId: string) { human.runScript(scriptId) }
function handleSearchTools() { searchResults.value = tools.suggestTools(searchInput.value) }

function handleExport() {
  const json = exportAllData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `momiqi-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showExportConfirm.value = false
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importAllData(reader.result as string)
      if (result.ok) {
        alert(`恢复成功！已导入 ${result.count} 项数据。刷新页面后生效。`)
      } else {
        alert('导入失败: ' + result.errors.join(', '))
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

function setPersonality(mode: PersonalityTone) {
  evolution.setPersonality(mode)
}

onMounted(() => {
  tools.initBuiltinTools()
  planner.initTemplates()
  human.initBuiltinScripts()
})
</script>

<template>
  <div class="smart-panel">
    <div class="panel-header">
      <h2>智能工坊</h2>
      <div class="header-actions">
        <button class="icon-btn" @click="showExportConfirm = !showExportConfirm" title="数据备份">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        </button>
        <button class="icon-btn" @click="$emit('close')" title="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>

    <div v-if="showExportConfirm" class="export-bar">
      <span>数据安全备份</span>
      <button class="btn-sm accent" @click="handleExport">导出全部数据</button>
      <button class="btn-sm" @click="handleImport">从文件恢复</button>
      <button class="btn-xs" @click="showExportConfirm = false">关闭</button>
    </div>

    <div class="tab-row">
      <button v-for="t in [
        { id: 'evolve', label: '进化', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
        { id: 'tools', label: '工具', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6' },
        { id: 'planner', label: '规划', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { id: 'human', label: '人手', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
      ]" :key="t.id"
        class="ptab" :class="{ active: activeTab === t.id }" @click="activeTab = t.id">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="t.icon" /></svg>
        <span>{{ t.label }}</span>
      </button>
    </div>

    <div class="panel-body">

      <!-- ===== 进化面板 ===== -->
      <div v-if="activeTab === 'evolve'" class="section">
        <div class="evo-dashboard">
          <div class="metric-card">
            <div class="metric-value" :style="{ color: metricColor }">{{ evolution.state.successRate }}%</div>
            <div class="metric-label">成功率</div>
            <div class="metric-bar"><div class="metric-fill" :style="{ width: evolution.state.successRate + '%', background: metricColor }" /></div>
          </div>
          <div class="metric-card">
            <div class="metric-value" :style="{ color: effColor }">{{ evolution.state.efficiency }}%</div>
            <div class="metric-label">效率</div>
            <div class="metric-bar"><div class="metric-fill" :style="{ width: evolution.state.efficiency + '%', background: effColor }" /></div>
          </div>
          <div class="metric-card">
            <div class="metric-value" :style="{ color: evolution.state.stabilityScore >= 70 ? '#22c55e' : '#ef4444' }">{{ evolution.state.stabilityScore }}</div>
            <div class="metric-label">稳定性</div>
            <div class="metric-bar"><div class="metric-fill" :style="{ width: evolution.state.stabilityScore + '%', background: evolution.state.stabilityScore >= 70 ? '#22c55e' : '#ef4444' }" /></div>
          </div>
        </div>

        <div class="stats-badge">
          <span>版本 v{{ evolution.state.version }}</span>
          <span class="dot">·</span>
          <span>进化 {{ evolution.state.totalEvolutions }} 次</span>
          <span class="dot">·</span>
          <span>{{ evolution.state.successfulEvolutions }} 次成功</span>
          <span class="dot">·</span>
          <span>{{ evolution.state.backups.length }} 份备份</span>
          <span class="dot">·</span>
          <span>评级 {{ summary.grade?.label || '-' }}</span>
        </div>

        <div class="switch-row">
          <label class="switch-label">
            <input type="checkbox" :checked="evolution.state.enabled" @change="evolution.toggleEvolution()" />
            <span>进化引擎</span>
          </label>
          <label class="switch-label">
            <input type="checkbox" :checked="evolution.state.safeMode" @change="evolution.toggleSafeMode()" />
            <span>安全模式</span>
          </label>
          <label class="switch-label">
            <input type="checkbox" :checked="evolution.state.autoCommit" @change="evolution.toggleAutoCommit()" />
            <span>自动提交</span>
          </label>
          <label class="switch-label">
            <input type="checkbox" :checked="evolution.state.autoDeploy" @change="evolution.toggleAutoDeploy()" />
            <span>自动部署</span>
          </label>
        </div>

        <div class="sub-section">
          <h4 class="sub-title">语气风格</h4>
          <div class="tone-row">
            <button v-for="t in [
              { id: 'encouraging', label: '鼓励型', desc: '加油打气、正能量满满' },
              { id: 'warm', label: '温暖型', desc: '温柔体贴、如沐春风' },
              { id: 'playful', label: '活泼型', desc: '轻松幽默、活力十足' },
              { id: 'calm', label: '冷静型', desc: '言简意赅、沉稳专业' },
            ]" :key="t.id"
              class="tone-btn" :class="{ active: evolution.state.personalityMode === t.id }"
              @click="setPersonality(t.id as PersonalityTone)">
              <span class="tone-label">{{ t.label }}</span>
              <span class="tone-desc">{{ t.desc }}</span>
            </button>
          </div>
        </div>

        <div class="action-bar">
          <input v-model="searchInput" class="input-sm" :placeholder="evolution.getToneMessage('thinking')"
            @keyup.enter="handleEvolve" />
          <button class="btn-sm accent" @click="handleEvolve" :disabled="!searchInput || !evolution.state.enabled">
            进化
          </button>
        </div>

        <div v-if="lastEvolveResult !== 'idle'" class="evolve-msg" :class="lastEvolveResult">
          <svg v-if="lastEvolveResult === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <span>{{ lastEvolveMsg }}</span>
        </div>

        <div class="history-list">
          <div v-for="h in evolution.state.history.slice(0, 20)" :key="h.id" class="history-item">
            <span class="evo-type" :class="h.type">
              {{ h.type === 'tool_add' ? '工具诞生' : h.type === 'self_refactor' ? '代码重构' : h.type === 'knowledge_update' ? '知识更新' : h.type === 'web_learned' ? '网络学习' : h.type === 'bug_fix' ? '修复' : '其他' }}
            </span>
            <span class="evo-desc">{{ h.description.slice(0, 50) }}</span>
            <span class="evo-ver">{{ h.afterVersion }}</span>
          </div>
          <p v-if="evolution.state.history.length === 0" class="hint">还没有进化记录，在上方输入目标然后点「进化」</p>
        </div>

        <div v-if="evolution.state.backups.length > 0" class="sub-section">
          <h4 class="sub-title">安全备份 ({{ evolution.state.backups.length }} 份)</h4>
          <div v-for="b in evolution.state.backups.slice(0, 5)" :key="b.id" class="mini-card">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            <span class="mini-title">{{ b.description.slice(0, 25) }}</span>
            <span class="mini-meta">{{ new Date(b.timestamp).toLocaleString() }}</span>
            <button class="btn-xs accent" @click="evolution.restoreBackup(b.id)">恢复</button>
          </div>
        </div>
      </div>

      <!-- ===== 工具面板 ===== -->
      <div v-if="activeTab === 'tools'" class="section">
        <div class="stats-badge">
          <span>内置 {{ stats.builtin }} 个</span>
          <span class="dot">·</span>
          <span>进化 {{ stats.evolved }} 个</span>
          <span class="dot">·</span>
          <span>执行 {{ stats.totalExecutions }} 次</span>
        </div>

        <div class="action-bar">
          <input v-model="searchInput" class="input-sm" placeholder="搜索工具..."
            @keyup.enter="handleSearchTools" />
          <button class="btn-sm accent" @click="handleSearchTools">搜索</button>
          <button class="btn-sm" @click="showEvolveToolForm = !showEvolveToolForm">创造</button>
        </div>

        <div v-if="searchResults.length > 0" class="result-list">
          <div v-for="t in searchResults" :key="t.id" class="result-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path :d="t.icon" /></svg>
            <div class="result-info">
              <span class="result-name">{{ t.name }}</span>
              <span class="result-desc">{{ t.description }}</span>
            </div>
            <span class="badge-sm" :class="t.category">{{ t.category === 'evolved' ? '进化' : t.category === 'builtin' ? '内置' : '用户' }}</span>
            <span class="usage-count">x{{ t.usageCount }}</span>
          </div>
        </div>

        <div v-if="showEvolveToolForm" class="form-card">
          <h4>进化创造新工具</h4>
          <p class="hint">在进化引擎中，你可以创造全新的工具。描述它做什么，我来帮你实现。</p>
          <input v-model="newToolName" class="input" placeholder="工具名称 *" />
          <textarea v-model="newToolDesc" class="input textarea" placeholder="这个工具能做什么？越具体越好 *" rows="2" />
          <button class="btn" @click="handleEvolveTool" :disabled="!newToolName || !newToolDesc || !evolution.state.enabled">
            诞生吧，新工具！
          </button>
        </div>

        <div class="tool-grid">
          <div v-for="t in toolList" :key="t.id" class="tool-card">
            <div class="tool-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path :d="t.icon" /></svg>
            </div>
            <div class="tool-body">
              <div class="tool-name">{{ t.name }} <span class="tool-ver">v{{ t.version }}</span></div>
              <div class="tool-desc">{{ t.description }}</div>
              <div class="tool-meta">
                <span class="badge-sm" :class="t.category">{{ t.category === 'evolved' ? '进化' : t.category === 'builtin' ? '内置' : '用户' }}</span>
                <span>调用 {{ t.usageCount }} 次</span>
                <span>成功率 {{ t.successRate }}%</span>
              </div>
            </div>
            <button class="del-btn" v-if="t.category === 'evolved' || t.category === 'user'" @click="tools.removeTool(t.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ===== 规划面板 ===== -->
      <div v-if="activeTab === 'planner'" class="section">
        <div class="action-bar">
          <input v-model="planGoal" class="input-sm" placeholder="输入目标，AI 自动拆解为执行步骤..."
            @keyup.enter="handleCreatePlan" />
          <button class="btn-sm accent" @click="handleCreatePlan" :disabled="!planGoal">创建</button>
          <button class="btn-sm" @click="showNewPlanForm = !showNewPlanForm">模板</button>
        </div>

        <div v-if="showNewPlanForm" class="form-card">
          <h4>选择模板</h4>
          <select v-model="selectedTplId" class="input">
            <option value="">-- 自由创建 --</option>
            <option v-for="t in planner.state.templates" :key="t.id" :value="t.id">{{ t.name }} - {{ t.description }}</option>
          </select>
          <input v-model="planCategory" class="input" placeholder="分类 (如：开发/调试/创作)" />
        </div>

        <div v-if="planner.completedPlans.value.length > 0" class="sub-section">
          <h4 class="sub-title">已完成 ({{ planner.completedPlans.value.length }})</h4>
          <div v-for="p in planner.completedPlans.value.slice(0, 5)" :key="p.id" class="mini-card">
            <span class="mini-title">{{ p.title }}</span>
            <span class="mini-meta">{{ p.steps.length }} 步</span>
            <span class="badge-sm done">完成</span>
          </div>
        </div>

        <div v-if="planner.state.plans.length === 0 && !showNewPlanForm" class="empty">
          <p>输入目标任务，AI 会帮你拆解为可执行的步骤</p>
          <p class="hint">支持依赖关系、自动推进、失败重试</p>
        </div>

        <div class="plan-list">
          <div v-for="p in planner.state.plans" :key="p.id" class="plan-card" :class="p.status">
            <div class="plan-header">
              <h4>{{ p.title }}</h4>
              <div class="plan-actions">
                <button v-if="p.status === 'draft'" class="btn-xs accent" @click="handleStartPlan(p.id)">开干</button>
                <button v-if="p.status === 'active'" class="btn-xs" @click="planner.pausePlan(p.id)">暂停</button>
                <button v-if="p.status === 'paused'" class="btn-xs accent" @click="handleStartPlan(p.id)">继续</button>
                <button class="btn-xs danger" @click="planner.cancelPlan(p.id)">取消</button>
              </div>
            </div>

            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: p.progress + '%' }" />
            </div>

            <div class="step-list">
              <div v-for="s in p.steps" :key="s.id" class="step-item" :class="s.status">
                <span class="step-status">
                  <svg v-if="s.status === 'completed'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <svg v-else-if="s.status === 'in_progress'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <svg v-else-if="s.status === 'failed'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  <span v-else class="step-dot"></span>
                </span>
                <div class="step-info">
                  <span class="step-desc">{{ s.description }}</span>
                  <span class="step-meta">
                    <span class="prio" :class="s.priority">{{ s.priority }}</span>
                    <span>{{ s.estimatedMinutes }}分钟</span>
                    <span v-if="s.retryCount > 0">重试{{ s.retryCount }}/{{ s.maxRetries }}</span>
                  </span>
                </div>
                <div class="step-rt" v-if="p.status === 'active'">
                  <button v-if="s.status === 'in_progress'" class="btn-xs accent" @click="handleCompleteStep(p.id, s.id)">搞定</button>
                  <button v-if="s.status === 'failed' && s.retryCount < s.maxRetries" class="btn-xs" @click="handleRetryStep(p.id, s.id)">再来</button>
                </div>
              </div>
            </div>

            <div v-if="p.status === 'active'" class="add-step-row">
              <button class="btn-xs" @click="showAddStep = !showAddStep; planStepTarget = p.id">+ 加一步</button>
              <div v-if="showAddStep && planStepTarget === p.id" class="inline-form">
                <input v-model="stepDesc" class="input-xs" placeholder="描述" @keyup.enter="handleAddStep(p.id)" />
                <select v-model="stepPriority" class="input-xs">
                  <option value="critical">紧急</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
                <input v-model="stepMinutes" class="input-xs number" type="number" min="1" max="240" placeholder="分钟" />
                <button class="btn-xs accent" @click="handleAddStep(p.id)" :disabled="!stepDesc">确认</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 人手面板 ===== -->
      <div v-if="activeTab === 'human'" class="section">
        <div class="switch-row">
          <label class="switch-label">
            <input type="checkbox" v-model="human.state.allowDangerousEval" />
            <span>允许脚本执行</span>
          </label>
          <span class="hint">仅在信任站点使用</span>
        </div>

        <div class="action-bar">
          <input v-model="scriptName" class="input-sm" placeholder="新建脚本..."
            @keyup.enter="handleCreateScript" />
          <select v-model="scriptCategory" class="input-xs">
            <option value="custom">自定义</option>
            <option value="form_fill">表单填充</option>
            <option value="data_collect">数据采集</option>
            <option value="navigation">导航</option>
            <option value="testing">测试</option>
          </select>
          <button class="btn-sm accent" @click="handleCreateScript" :disabled="!scriptName">创建</button>
        </div>

        <div class="script-list">
          <div v-for="s in human.scripts.value" :key="s.id" class="script-card">
            <div class="script-header">
              <h4>{{ s.name }}</h4>
              <span class="badge-sm">{{ s.category }}</span>
              <button class="btn-xs accent" @click="handleRunScript(s.id)">执行</button>
              <button class="btn-xs danger" @click="human.deleteScript(s.id)">删</button>
            </div>
            <div class="script-meta">
              {{ s.actions.length }} 步 · 执行 {{ s.runCount }} 次 · {{ s.averageDuration.toFixed(0) }}ms
            </div>
            <div class="action-list">
              <div v-for="(a, i) in s.actions" :key="i" class="action-item">
                <span class="tag">{{ a.type }}</span>
                <span class="action-desc">{{ a.description }}</span>
                <button class="del-xs" @click="human.removeAction(s.id, i)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>
            <div class="add-action-row">
              <select v-model="quickActionType" class="input-xs">
                <option value="click">点击</option>
                <option value="input">输入</option>
                <option value="scroll">滚动</option>
                <option value="wait">等待</option>
                <option value="eval">脚本</option>
              </select>
              <input v-model="quickActionDesc" class="input-xs" placeholder="描述" />
              <input v-if="quickActionType === 'click' || quickActionType === 'input'" v-model="quickActionSelector" class="input-xs" placeholder="选择器" />
              <input v-if="quickActionType === 'input'" v-model="quickActionValue" class="input-xs" placeholder="输入值" />
              <button class="btn-xs" @click="handleAddQuickAction(s.id)" :disabled="!quickActionDesc">+</button>
            </div>
          </div>
        </div>

        <div v-if="human.recentResults.value.length > 0" class="sub-section">
          <h4 class="sub-title">执行记录</h4>
          <div v-for="r in human.recentResults.value.slice(0, 10)" :key="r.scriptId + r.duration" class="mini-card">
            <span :class="r.success ? 's-ok' : 's-fail'">{{ r.success ? 'OK' : 'FAIL' }}</span>
            <span class="mini-title">{{ r.scriptName || r.scriptId.slice(0, 6) }}</span>
            <span class="mini-meta">{{ r.actionsExecuted }}/{{ r.actionsTotal }} · {{ r.duration.toFixed(0) }}ms</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smart-panel {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: 17px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.export-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.08);
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.btn-sm, .btn-xs {
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-sm.accent, .btn-xs.accent {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.btn-sm.accent:disabled, .btn-xs.accent:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-xs {
  padding: 3px 10px;
  font-size: 11px;
  border-radius: 6px;
}

.btn-xs.danger {
  background: transparent;
  border-color: var(--danger);
  color: var(--danger);
}

.tab-row {
  display: flex;
  padding: 6px 10px;
  gap: 2px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.ptab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.ptab.active {
  color: var(--accent);
  background: rgba(99, 102, 241, 0.12);
}

.ptab span { display: none; }
.ptab.active span { display: inline; }

@media (min-width: 380px) {
  .ptab span { display: inline; }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.section { padding: 12px; }

/* ===== 进化面板指标 ===== */
.evo-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.metric-card {
  text-align: center;
  padding: 12px 8px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.metric-label {
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 2px 0 6px;
}

.metric-bar {
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.stats-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.08);
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.dot { color: var(--text-tertiary); }

.switch-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-secondary);
}

.switch-label input { accent-color: var(--accent); }

/* ===== 语气风格 ===== */
.tone-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

@media (min-width: 420px) {
  .tone-row { grid-template-columns: repeat(4, 1fr); }
}

.tone-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s;
}

.tone-btn.active {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.08);
  color: var(--text-primary);
}

.tone-label { font-size: 13px; font-weight: 600; }
.tone-desc { font-size: 10px; color: var(--text-tertiary); }

.sub-section { margin-top: 14px; }
.sub-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary); }

/* ===== 进化消息 ===== */
.evolve-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  animation: fadeIn 0.3s ease;
}

.evolve-msg.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
.evolve-msg.fail { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 通用组件 ===== */
.action-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.input-sm {
  flex: 1;
  min-width: 100px;
  padding: 7px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.input-sm:focus { border-color: var(--accent); }

.input, .textarea {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  margin-bottom: 8px;
}

.textarea { resize: vertical; font-family: inherit; }

.form-card {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 12px;
}

.form-card h4 { font-size: 13px; font-weight: 600; margin-bottom: 6px; }

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
}

.btn:disabled { opacity: 0.5; }

.result-list { margin-bottom: 12px; }

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: var(--bg-secondary);
  margin-bottom: 4px;
}

.result-info { flex: 1; min-width: 0; }
.result-name { font-size: 13px; font-weight: 500; display: block; }
.result-desc { font-size: 11px; color: var(--text-tertiary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.usage-count { font-size: 11px; color: var(--text-tertiary); min-width: 30px; text-align: right; }

.tool-grid { display: flex; flex-direction: column; gap: 6px; }

.tool-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.tool-icon-wrap {
  flex-shrink: 0;
  padding: 6px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
}

.tool-body { flex: 1; min-width: 0; }
.tool-name { font-size: 13px; font-weight: 600; }
.tool-ver { font-size: 10px; color: var(--text-tertiary); font-weight: 400; }
.tool-desc { font-size: 11px; color: var(--text-secondary); margin: 2px 0; }
.tool-meta { display: flex; gap: 6px; font-size: 10px; color: var(--text-tertiary); margin-top: 4px; flex-wrap: wrap; }

.del-btn {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
}

.badge-sm {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.badge-sm.builtin { background: rgba(99,102,241,0.15); color: var(--accent); }
.badge-sm.evolved { background: rgba(34,211,238,0.15); color: #22d3ee; }
.badge-sm.user { background: rgba(250,204,21,0.15); color: #facc15; }
.badge-sm.done { background: rgba(34,197,94,0.15); color: #22c55e; }

.empty { text-align: center; padding: 30px 20px; color: var(--text-tertiary); }
.hint { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; }

.mini-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 4px;
  font-size: 12px;
}

.mini-title { flex: 1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mini-meta { font-size: 10px; color: var(--text-tertiary); }

.plan-list { display: flex; flex-direction: column; gap: 10px; }

.plan-card { padding: 12px; background: var(--bg-secondary); border-radius: 10px; }
.plan-card.active { border: 1px solid var(--accent); }

.plan-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.plan-header h4 { font-size: 14px; font-weight: 600; }
.plan-actions { display: flex; gap: 4px; }

.progress-bar { height: 3px; background: var(--bg-tertiary); border-radius: 2px; margin-bottom: 8px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s; }

.step-list { display: flex; flex-direction: column; gap: 4px; }
.step-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 8px; border-radius: 6px; background: var(--bg-tertiary); }
.step-item.completed { opacity: 0.6; }
.step-item.failed { background: rgba(239,68,68,0.08); }

.step-status { flex-shrink: 0; padding-top: 2px; }
.step-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--text-tertiary); }
.step-info { flex: 1; min-width: 0; }
.step-desc { font-size: 12px; display: block; }
.step-meta { display: flex; gap: 6px; font-size: 10px; color: var(--text-tertiary); margin-top: 2px; flex-wrap: wrap; }

.prio { padding: 0 4px; border-radius: 3px; font-size: 9px; text-transform: uppercase; }
.prio.critical { background: rgba(239,68,68,0.2); color: #ef4444; }
.prio.high { background: rgba(249,115,22,0.2); color: #f97316; }
.prio.medium { background: rgba(234,179,8,0.2); color: #eab308; }
.prio.low { background: rgba(100,116,139,0.2); color: #64748b; }

.step-rt { flex-shrink: 0; }
.add-step-row { margin-top: 8px; }

.inline-form { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
.input-xs { padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-tertiary); color: var(--text-primary); font-size: 11px; outline: none; min-width: 60px; }
.input-xs.number { width: 50px; min-width: 50px; }

.history-list { display: flex; flex-direction: column; gap: 4px; }

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 12px;
}

.evo-type {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.evo-type.tool_add { background: rgba(34,211,238,0.15); color: #22d3ee; }
.evo-type.self_refactor { background: rgba(168,85,247,0.15); color: #a855f7; }
.evo-type.knowledge_update { background: rgba(34,197,94,0.15); color: #22c55e; }
.evo-type.web_learned { background: rgba(249,115,22,0.15); color: #f97316; }
.evo-type.bug_fix { background: rgba(239,68,68,0.15); color: #ef4444; }

.evo-desc { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.evo-ver { font-size: 10px; color: var(--text-tertiary); font-family: monospace; }

/* ===== 人手模拟 ===== */
.script-list { display: flex; flex-direction: column; gap: 10px; }

.script-card { padding: 10px; background: var(--bg-secondary); border-radius: 10px; }
.script-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
.script-header h4 { font-size: 13px; font-weight: 600; }
.script-meta { font-size: 10px; color: var(--text-tertiary); margin-bottom: 6px; }

.action-list { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
.action-item { display: flex; align-items: center; gap: 6px; padding: 3px 6px; background: var(--bg-tertiary); border-radius: 5px; font-size: 11px; }

.tag {
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 600;
  background: rgba(99,102,241,0.15);
  color: var(--accent);
  text-transform: uppercase;
  flex-shrink: 0;
}

.action-desc { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.del-xs { flex-shrink: 0; border: none; background: transparent; color: var(--text-tertiary); cursor: pointer; padding: 2px; }
.add-action-row { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }

.s-ok { color: #22c55e; font-size: 10px; font-weight: 600; min-width: 24px; }
.s-fail { color: #ef4444; font-size: 10px; font-weight: 600; min-width: 24px; }
</style>
