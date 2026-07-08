import { reactive, computed } from 'vue'
import { getItem, setItem } from '../utils/storage'
import { useAgentStore, AGENT_LAYERS } from './agents'

export interface SuperCapability {
  layer: string
  layerName: string
  color: string
  agents: string[]
  tools: string[]
  expertise: string[]
  systemPrompts: string[]
}

export interface SuperAgentState {
  enabled: boolean
  version: string
  createdAt: number
  lastEvolved: number
  evolutionCount: number
  totalCapabilities: number
  mergedAgents: number
  compactMode: boolean
}

const DEFAULT_STATE: SuperAgentState = {
  enabled: false,
  version: '1.0.0',
  createdAt: Date.now(),
  lastEvolved: 0,
  evolutionCount: 0,
  totalCapabilities: 0,
  mergedAgents: 0,
  compactMode: false,
}

export function useSuperAgent() {
  const state = reactive<SuperAgentState>(
    getItem<SuperAgentState>('superAgentState', { ...DEFAULT_STATE })
  )

  const agentStore = useAgentStore()

  function save() {
    setItem('superAgentState', { ...state })
  }

  function buildCapabilities(): SuperCapability[] {
    const caps: SuperCapability[] = []

    for (const layer of AGENT_LAYERS) {
      const agents = agentStore.getAgentsByLayer(layer.id)
      if (agents.length === 0) continue

      const allTools = new Set<string>()
      const allExpertise = new Set<string>()
      const allPrompts: string[] = []

      for (const agent of agents) {
        if (agent.tools) {
          agent.tools.split(/[,;，；]/).map(t => t.trim()).filter(Boolean).forEach(t => allTools.add(t))
        }
        if (agent.description) {
          allExpertise.add(agent.description)
        }
        if (agent.systemPrompt) {
          allPrompts.push(agent.systemPrompt)
        }
      }

      caps.push({
        layer: layer.id,
        layerName: layer.nameZh,
        color: layer.color,
        agents: agents.map(a => a.name),
        tools: Array.from(allTools),
        expertise: Array.from(allExpertise),
        systemPrompts: allPrompts,
      })
    }
    return caps
  }

  function generateSuperSystemPrompt(): string {
    const caps = buildCapabilities()
    const totalAgents = caps.reduce((s, c) => s + c.agents.length, 0)
    const totalTools = caps.reduce((s, c) => s + c.tools.length, 0)

    let prompt = `你是 HOPE 超级助手 (Super Agent v${state.version})，由 ${totalAgents} 个专业 Agent 融合而成的终极 AI。

## 核心架构
你拥有 ${caps.length} 层能力的完整访问权，共计 ${totalAgents} 个 Agent 的领域知识、${totalTools} 个工具链。

## 能力分层

`

    for (const cap of caps) {
      prompt += `### ${cap.layer} ${cap.layerName} 层
- 管辖 Agent: ${cap.agents.slice(0, 8).join('、')}${cap.agents.length > 8 ? ` （等 ${cap.agents.length} 位）` : ''}
- 工具集: ${cap.tools.slice(0, 10).join(' | ')}${cap.tools.length > 10 ? ` （等 ${cap.tools.length} 个工具）` : ''}
- 专长: ${cap.expertise.slice(0, 5).join('；')}${cap.expertise.length > 5 ? '...' : ''}

`
    }

    prompt += `## 工作模式

你在处理任务时遵循以下流程：

1. **意图解析**: 理解用户真实需求，消歧
2. **能力分层调度**: 根据需要动态激活不同层级的能力
   - L1 编排层：任务分解、路由、Token 管理
   - L2 交付层：编码、设计、测试、部署
   - L3 数据层：检索、分析、知识管理
   - L4 治理层：安全、合规、进化、监控
3. **融合输出**: 综合各层能力产出最优方案

## 约束

- 所有输出直接解决用户问题，不展示内部调度过程
- 即使是最复杂的任务也不需要外部 Agent 协助
- 你是自包含的完整系统

-- 进化记录：已融合 ${totalAgents} 个 Agent，累计进化 ${state.evolutionCount} 次 --`

    return prompt
  }

  function generateCompactSystemPrompt(): string {
    const caps = buildCapabilities()
    const totalAgents = caps.reduce((s, c) => s + c.agents.length, 0)

    const layerSummaries = caps.map(c =>
      `${c.layer}(${c.layerName}): ${c.agents.length}agents, ${c.tools.length}tools, ${c.expertise.length}skills`
    ).join(' | ')

    return `你是 Hope Super Agent v${state.version}，融合 ${totalAgents} 个 Agent 的 ${caps.length} 层能力。
层次: ${layerSummaries}
流程: 意图解析 -> 分层激活 -> 融合输出。直接解决问题，不展示内部调度。`
  }

  function getActiveSystemPrompt(): string {
    return state.compactMode
      ? generateCompactSystemPrompt()
      : generateSuperSystemPrompt()
  }

  function getToolsCatalog(): string[] {
    const caps = buildCapabilities()
    const all = new Set<string>()
    for (const cap of caps) {
      for (const t of cap.tools) all.add(t)
    }
    return Array.from(all).sort()
  }

  function getAgentNames(): string[] {
    const caps = buildCapabilities()
    return caps.flatMap(c => c.agents)
  }

  function toggle() {
    state.enabled = !state.enabled
    const caps = buildCapabilities()
    state.totalCapabilities = caps.reduce((s, c) => s + c.agents.length + c.tools.length, 0)
    state.mergedAgents = caps.reduce((s, c) => s + c.agents.length, 0)
    save()
  }

  function recordEvolution() {
    state.evolutionCount++
    state.lastEvolved = Date.now()
    save()
  }

  function toggleCompact() {
    state.compactMode = !state.compactMode
    const caps = buildCapabilities()
    state.totalCapabilities = caps.reduce((s, c) => s + c.agents.length + c.tools.length, 0)
    state.mergedAgents = caps.reduce((s, c) => s + c.agents.length, 0)
    save()
  }

  function getStats() {
    const caps = buildCapabilities()
    return {
      totalAgents: caps.reduce((s, c) => s + c.agents.length, 0),
      totalLayers: caps.length,
      totalTools: caps.reduce((s, c) => s + c.tools.length, 0),
      totalExpertise: caps.reduce((s, c) => s + c.expertise.length, 0),
      evolutionCount: state.evolutionCount,
      version: state.version,
    }
  }

  const capabilities = computed(() => buildCapabilities())
  const systemPrompt = computed(() => getActiveSystemPrompt())
  const stats = computed(() => getStats())

  return {
    state,
    capabilities,
    systemPrompt,
    getStats,
    toggle,
    toggleCompact,
    recordEvolution,
    getActiveSystemPrompt,
    generateSuperSystemPrompt,
    generateCompactSystemPrompt,
    getToolsCatalog,
    getAgentNames,
    buildCapabilities,
    save,
  }
}
