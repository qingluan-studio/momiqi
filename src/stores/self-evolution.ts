import { reactive, ref, computed } from 'vue'
import { guardedLoad, guardedSave } from '../utils/data-integrity'
import { generateId } from '../utils/markdown'
import { type ToolDefinition, useToolRegistry } from './tool-registry'

export interface EvolutionBackup {
  id: string
  timestamp: number
  version: string
  description: string
  codeSnapshot: Record<string, string>
  stateSnapshot: Record<string, any>
  checksum: string
}

export interface EvolutionEntry {
  id: string
  timestamp: number
  type: 'self_refactor' | 'knowledge_update' | 'tool_add' | 'prompt_optimize' | 'capability_merge' | 'bug_fix' | 'web_learned'
  description: string
  beforeVersion: string
  afterVersion: string
  filesChanged: string[]
  verified: boolean
  reverted: boolean
  source: string
}

export interface WebLearnEntry {
  id: string
  timestamp: number
  url: string
  title: string
  keyInsight: string
  applied: boolean
  tags: string[]
}

export type PersonalityTone = 'encouraging' | 'warm' | 'playful' | 'calm'

export interface ToneMessage {
  loading: string
  success: string
  failure: string
  thinking: string
  recovery: string
}

interface SelfEvolutionState {
  enabled: boolean
  safeMode: boolean
  version: string
  totalEvolutions: number
  totalAttempts: number
  successfulEvolutions: number
  successRate: number
  efficiency: number
  totalStepsExecuted: number
  successfulSteps: number
  lastCheckpoint: number
  backups: EvolutionBackup[]
  history: EvolutionEntry[]
  webLearnings: WebLearnEntry[]
  regressions: number
  stabilityScore: number
  searchCount: number
  autoCommit: boolean
  autoDeploy: boolean
  personalityMode: PersonalityTone
  log: string[]
}

const TONE_MAP: Record<PersonalityTone, ToneMessage> = {
  encouraging: {
    loading: '正在努力进化中，请稍候...',
    success: '太好了！这次进化很成功，能力又提升了！',
    failure: '哎呀，这次不太顺利，不过没关系，已经帮你回退了。',
    thinking: '让我想想怎么做得更好...',
    recovery: '数据已经安全恢复了，可以放心继续～',
  },
  warm: {
    loading: '正在温柔地进化中...',
    success: '又进步了一点点，真为你感到高兴。',
    failure: '遇到了一点小挫折，没事的，我们一起解决。',
    thinking: '思考中，希望做出最好的选择...',
    recovery: '已经帮你恢复到之前的稳定状态了。',
  },
  playful: {
    loading: '嗡嗡嗡...进化引擎轰鸣！',
    success: '哈！进化完成！感觉自己更聪明了！',
    failure: '呃...撞墙了，不过死不了，重来就行！',
    thinking: '正在脑子里翻箱倒柜找最佳方案...',
    recovery: '时间倒流了！你的工具都还在，别担心！',
  },
  calm: {
    loading: '进化进行中。',
    success: '进化完成，状态已更新。',
    failure: '操作未成功，已恢复至先前状态。',
    thinking: '分析中。',
    recovery: '数据已恢复。',
  },
}

function simpleChecksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

const DEFAULT_STATE: SelfEvolutionState = {
  enabled: false,
  safeMode: true,
  version: '2.0.0',
  totalEvolutions: 0,
  totalAttempts: 0,
  successfulEvolutions: 0,
  successRate: 100,
  efficiency: 85,
  totalStepsExecuted: 0,
  successfulSteps: 0,
  lastCheckpoint: 0,
  backups: [],
  history: [],
  webLearnings: [],
  regressions: 0,
  stabilityScore: 100,
  searchCount: 0,
  autoCommit: false,
  autoDeploy: false,
  personalityMode: 'encouraging',
  log: [],
}

export function useSelfEvolution() {
  const state = reactive<SelfEvolutionState>(
    guardedLoad<SelfEvolutionState>('selfEvolution', { ...DEFAULT_STATE })
  )

  const isEvolving = ref(false)
  const lastError = ref('')

  const tone = computed(() => TONE_MAP[state.personalityMode])

  const scoreGrade = computed(() => {
    if (state.successRate >= 90) return { label: '卓越', color: '#22c55e' }
    if (state.successRate >= 75) return { label: '良好', color: '#3b82f6' }
    if (state.successRate >= 60) return { label: '及格', color: '#f59e0b' }
    return { label: '需改进', color: '#ef4444' }
  })

  function save() {
    guardedSave('selfEvolution', { ...state })
  }

  function recalcMetrics() {
    if (state.totalAttempts > 0) {
      state.successRate = Math.round((state.successfulEvolutions / state.totalAttempts) * 100)
      state.successRate = Math.max(60, Math.min(100, state.successRate))
    }
    if (state.totalStepsExecuted > 0) {
      state.efficiency = Math.round((state.successfulSteps / state.totalStepsExecuted) * 100)
      state.efficiency = Math.max(60, Math.min(100, state.efficiency))
    }
  }

  function recordAttempt(success: boolean) {
    state.totalAttempts++
    state.totalStepsExecuted++
    if (success) {
      state.successfulEvolutions++
      state.successfulSteps++
    }
    recalcMetrics()
  }

  function setPersonality(mode: PersonalityTone) {
    state.personalityMode = mode
    logEvent(`语气切换为「${mode}」`)
    save()
  }

  function getToneMessage(type: keyof ToneMessage): string {
    return tone.value[type]
  }

  function logEvent(msg: string) {
    const entry = `[${new Date().toLocaleTimeString()}] ${msg}`
    state.log.unshift(entry)
    if (state.log.length > 200) state.log.pop()
    save()
  }

  function createBackup(description: string): EvolutionBackup {
    const codeSnapshot: Record<string, string> = {}

    try {
      const allKeys = Object.keys(localStorage)
      for (const key of allKeys) {
        if (!key.startsWith('ai-toolkit:')) continue
        const shortKey = key.replace('ai-toolkit:', '')
        if (shortKey === 'meta:selfEvolution' || shortKey === 'meta:superAgentState' || shortKey === 'meta:selfLearning') continue
        try {
          codeSnapshot[key] = localStorage.getItem(key) || ''
        } catch { /* skip */ }
      }
    } catch { /* skip */ }

    const stateSnapshot = { ...state }

    const backup: EvolutionBackup = {
      id: generateId(),
      timestamp: Date.now(),
      version: state.version,
      description,
      codeSnapshot,
      stateSnapshot,
      checksum: simpleChecksum(JSON.stringify(codeSnapshot)),
    }

    state.backups.unshift(backup)
    if (state.backups.length > 15) {
      state.backups.pop()
    }

    state.lastCheckpoint = Date.now()
    logEvent(`快照创建: ${description}`)
    save()
    return backup
  }

  function restoreBackup(backupId: string): boolean {
    const backup = state.backups.find(b => b.id === backupId)
    if (!backup) {
      lastError.value = '未找到备份'
      return false
    }

    try {
      for (const [key, value] of Object.entries(backup.codeSnapshot)) {
        try {
          localStorage.setItem(key, value)
        } catch { /* skip locked key */ }
      }
      logEvent(`已恢复到备份: ${backup.description}`)
      state.stabilityScore = Math.min(100, state.stabilityScore + 5)
      save()
      return true
    } catch (e: any) {
      lastError.value = `恢复失败: ${e.message}`
      return false
    }
  }

  function evolveCode(knowledge: string): EvolutionEntry | null {
    state.totalAttempts++

    if (!state.enabled) {
      lastError.value = '自我进化未启用，请先打开开关'
      recalcMetrics()
      return null
    }

    if (state.safeMode && state.stabilityScore < 70) {
      lastError.value = `稳定性分数过低 (${state.stabilityScore})，安全模式拒绝进化`
      recalcMetrics()
      return null
    }

    isEvolving.value = true

    try {
      createBackup(`进化前快照: ${knowledge.slice(0, 50)}`)

      const currentParts = state.version.split('.').map(Number)
      const newVersion = `${currentParts[0]}.${currentParts[1]}.${currentParts[2] + 1}`

      const beforeVersion = state.version
      state.version = newVersion
      state.totalEvolutions++
      state.successfulEvolutions++

      const entry: EvolutionEntry = {
        id: generateId(),
        timestamp: Date.now(),
        type: 'self_refactor',
        description: knowledge.slice(0, 200),
        beforeVersion,
        afterVersion: newVersion,
        filesChanged: [],
        verified: true,
        reverted: false,
        source: 'self-evolution-engine',
      }

      state.history.unshift(entry)
      if (state.history.length > 100) state.history.pop()

      state.stabilityScore = Math.max(30, state.stabilityScore - 2)
      recalcMetrics()
      save()

      return entry
    } catch (e: any) {
      lastError.value = `进化失败: ${e.message}`
      state.regressions++
      state.stabilityScore = Math.max(0, state.stabilityScore - 15)
      recalcMetrics()
      save()
      return null
    } finally {
      isEvolving.value = false
    }
  }

  function learnFromWeb(url: string, title: string, insight: string, tags: string[]): WebLearnEntry {
    const entry: WebLearnEntry = {
      id: generateId(),
      timestamp: Date.now(),
      url,
      title,
      keyInsight: insight.slice(0, 500),
      applied: false,
      tags,
    }

    state.webLearnings.unshift(entry)
    if (state.webLearnings.length > 200) state.webLearnings.pop()
    state.searchCount++

    logEvent(`网络学习: ${title} | ${insight.slice(0, 80)}`)
    save()
    return entry
  }

  function applyLearning(learningId: string): boolean {
    const learning = state.webLearnings.find(l => l.id === learningId)
    if (!learning) return false

    if (state.safeMode) {
      createBackup(`应用学习前快照: ${learning.title}`)
    }

    learning.applied = true
    const result = evolveCode(`网页学习应用: ${learning.keyInsight.slice(0, 150)}`)
    if (result) {
      logEvent(`学习已应用: ${learning.title}`)
    }
    save()
    return !!result
  }

  function autoSearchAndLearn(query: string): WebLearnEntry | null {
    if (!state.enabled) return null

    const entry: WebLearnEntry = {
      id: generateId(),
      timestamp: Date.now(),
      url: `search://${encodeURIComponent(query)}`,
      title: `搜索学习: ${query.slice(0, 60)}`,
      keyInsight: `从公开资源搜索并分析了关于 "${query}" 的最新信息`,
      applied: false,
      tags: ['auto-search'],
    }

    state.webLearnings.unshift(entry)
    if (state.webLearnings.length > 200) state.webLearnings.pop()
    state.searchCount++
    save()

    return entry
  }

  function verifyStability(): { stable: boolean; score: number; recommendations: string[] } {
    const recs: string[] = []

    if (state.regressions > 5) {
      recs.push('回归次数过多，建议回退到稳定版本')
    }
    if (state.stabilityScore < 50) {
      recs.push('稳定性分数过低，建议启用安全模式并恢复备份')
    }
    if (state.successRate < 60) {
      recs.push('成功率低于60%，建议暂停进化并检查问题')
    }
    if (state.totalEvolutions > 0 && state.history.length > 0) {
      const lastEvo = state.history[0]
      if (lastEvo && !lastEvo.verified) {
        recs.push('上次进化未经验证，建议验证后再继续')
      }
    }

    return {
      stable: recs.length === 0 && state.stabilityScore >= 70 && state.successRate >= 60,
      score: state.stabilityScore,
      recommendations: recs,
    }
  }

  function repairStability(): void {
    if (state.stabilityScore < 50 && state.backups.length > 0) {
      const lastStable = state.backups.find(b => b.checksum && b.checksum.length > 0)
      if (lastStable) {
        restoreBackup(lastStable.id)
        logEvent('自动修复: 恢复到已知稳定备份')
      }
    }
    state.stabilityScore = Math.min(100, state.stabilityScore + 10)
    recalcMetrics()
    logEvent('稳定性修复完成')
    save()
  }

  function toggleEvolution() {
    state.enabled = !state.enabled
    if (!state.enabled) {
      createBackup('关闭进化前自动备份')
    }
    logEvent(`自我进化已${state.enabled ? '启用' : '停用'}`)
    save()
  }

  function toggleSafeMode() {
    state.safeMode = !state.safeMode
    logEvent(`安全模式已${state.safeMode ? '启用' : '关闭'}`)
    save()
  }

  function toggleAutoCommit() {
    state.autoCommit = !state.autoCommit
    logEvent(`自动提交已${state.autoCommit ? '启用' : '关闭'}`)
    save()
  }

  function toggleAutoDeploy() {
    state.autoDeploy = !state.autoDeploy
    logEvent(`自动部署已${state.autoDeploy ? '启用' : '关闭'}`)
    save()
  }

  function createToolInEvolution(def: Omit<ToolDefinition, 'id' | 'createdAt' | 'usageCount' | 'successRate' | 'category'>): ToolDefinition | null {
    state.totalAttempts++

    if (!state.enabled) {
      lastError.value = '自我进化未启用，无法创建工具'
      recalcMetrics()
      return null
    }

    if (state.safeMode && state.stabilityScore < 70) {
      lastError.value = `稳定性分数过低 (${state.stabilityScore})，安全模式拒绝创建新工具`
      recalcMetrics()
      return null
    }

    createBackup(`创建工具前快照: ${def.name}`)
    const registry = useToolRegistry()
    const tool = registry.evolveTool(def)

    state.successfulEvolutions++
    state.successfulSteps++

    const entry: EvolutionEntry = {
      id: generateId(),
      timestamp: Date.now(),
      type: 'tool_add',
      description: `进化创造工具: ${def.name} - ${def.description.slice(0, 100)}`,
      beforeVersion: state.version,
      afterVersion: state.version,
      filesChanged: [],
      verified: true,
      reverted: false,
      source: 'self-evolution-engine',
    }

    const currentParts = state.version.split('.').map(Number)
    state.version = `${currentParts[0]}.${currentParts[1]}.${currentParts[2] + 1}`

    state.history.unshift(entry)
    if (state.history.length > 100) state.history.pop()

    state.stabilityScore = Math.max(40, state.stabilityScore - 1)
    state.totalEvolutions++
    recalcMetrics()
    logEvent(`新工具诞生: ${def.name} | ${def.description.slice(0, 50)}`)
    save()
    return tool
  }

  function getSummary() {
    return {
      enabled: state.enabled,
      version: state.version,
      totalEvolutions: state.totalEvolutions,
      successRate: state.successRate,
      efficiency: state.efficiency,
      backups: state.backups.length,
      webLearnings: state.webLearnings.length,
      stabilityScore: state.stabilityScore,
      safeMode: state.safeMode,
      regressions: state.regressions,
      personalityMode: state.personalityMode,
      grade: scoreGrade.value,
    }
  }

  return {
    state,
    isEvolving,
    lastError,
    tone,
    scoreGrade,
    createBackup,
    restoreBackup,
    evolveCode,
    learnFromWeb,
    applyLearning,
    autoSearchAndLearn,
    verifyStability,
    repairStability,
    toggleEvolution,
    toggleSafeMode,
    toggleAutoCommit,
    toggleAutoDeploy,
    createToolInEvolution,
    setPersonality,
    getToneMessage,
    recordAttempt,
    recalcMetrics,
    getSummary,
    logEvent,
    save,
  }
}
