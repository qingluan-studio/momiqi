import { reactive, computed } from 'vue'
import { guardedLoad, guardedSave } from '../utils/data-integrity'
import { generateId } from '../utils/markdown'

export interface ToolParam {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  required: boolean
  default?: any
  enum?: string[]
}

export interface ToolDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: 'builtin' | 'evolved' | 'community' | 'user'
  params: ToolParam[]
  createdAt: number
  version: string
  source: string
  usageCount: number
  successRate: number
}

export interface ToolExecutionResult {
  success: boolean
  data?: any
  error?: string
  duration: number
  toolId: string
  toolName: string
}

interface ToolRegistryState {
  tools: ToolDefinition[]
  executionHistory: ToolExecutionResult[]
  totalExecutions: number
  allowEvolvedTools: boolean
}

const BUILTIN_TOOLS: Omit<ToolDefinition, 'id' | 'createdAt' | 'usageCount' | 'successRate'>[] = [
  {
    name: '文本处理',
    description: '文本格式化、编码解码、正则匹配、Markdown转换',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    category: 'builtin',
    params: [
      { name: 'input', type: 'string', description: '输入文本', required: true },
      { name: 'operation', type: 'string', description: '操作类型', required: true, enum: ['encode', 'decode', 'format', 'regex', 'markdown'] },
      { name: 'options', type: 'object', description: '操作选项', required: false },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '代码生成',
    description: '根据描述生成代码片段，支持 30+ 语言',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    category: 'builtin',
    params: [
      { name: 'prompt', type: 'string', description: '代码描述', required: true },
      { name: 'language', type: 'string', description: '编程语言', required: false, enum: ['typescript', 'python', 'go', 'rust', 'java', 'sql', 'bash', 'html', 'css'] },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '图片理解',
    description: '分析图片内容，OCR 文字提取，场景识别',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    category: 'builtin',
    params: [
      { name: 'imageUrl', type: 'string', description: '图片URL', required: true },
      { name: 'prompt', type: 'string', description: '分析指令', required: false },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '联网搜索',
    description: '搜索公开网络资源，获取最新信息',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    category: 'builtin',
    params: [
      { name: 'query', type: 'string', description: '搜索关键词', required: true },
      { name: 'count', type: 'number', description: '结果数量', required: false, default: 5 },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '文档总结',
    description: '对长文本进行摘要、要点提取、结构化分析',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    category: 'builtin',
    params: [
      { name: 'content', type: 'string', description: '文档内容', required: true },
      { name: 'style', type: 'string', description: '摘要风格', required: false, enum: ['brief', 'detailed', 'bullets', 'mindmap'] },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '网页分析',
    description: '抓取并分析网页内容，提取关键信息',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    category: 'builtin',
    params: [
      { name: 'url', type: 'string', description: '网页URL', required: true },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '翻译',
    description: '多语言互译，支持 100+ 语言',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
    category: 'builtin',
    params: [
      { name: 'text', type: 'string', description: '待翻译文本', required: true },
      { name: 'from', type: 'string', description: '源语言', required: false },
      { name: 'to', type: 'string', description: '目标语言', required: false, default: '中文' },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: 'SQL生成',
    description: '自然语言转 SQL，支持 MySQL/PG/SQLite',
    icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M9 11h6',
    category: 'builtin',
    params: [
      { name: 'description', type: 'string', description: '查询描述', required: true },
      { name: 'dialect', type: 'string', description: '数据库方言', required: false, default: 'mysql', enum: ['mysql', 'postgresql', 'sqlite', 'mssql'] },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '音频转录',
    description: '语音转文字，支持多语言识别',
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    category: 'builtin',
    params: [
      { name: 'audioData', type: 'string', description: 'Base64音频数据', required: true },
      { name: 'language', type: 'string', description: '语言', required: false, default: 'zh' },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '时间管理',
    description: '时区转换、倒计时、日期计算、提醒设置',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    category: 'builtin',
    params: [
      { name: 'operation', type: 'string', description: '操作类型', required: true, enum: ['timezone', 'countdown', 'calc', 'format'] },
      { name: 'value', type: 'string', description: '参数值', required: true },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '二维码',
    description: '生成/解析二维码',
    icon: 'M12 4v1m6 11h2m-6 0h-2m4 0h-2m-6-4h2m6 0h-2M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z',
    category: 'builtin',
    params: [
      { name: 'data', type: 'string', description: '编码数据', required: true },
      { name: 'action', type: 'string', description: '操作', required: false, default: 'generate', enum: ['generate', 'decode'] },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
  {
    name: '颜色工具',
    description: '颜色格式互转、调色板生成、对比度计算',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    category: 'builtin',
    params: [
      { name: 'value', type: 'string', description: '颜色值', required: true },
      { name: 'format', type: 'string', description: '输出格式', required: false, enum: ['hex', 'rgb', 'hsl', 'palette'] },
    ],
    version: '1.0.0',
    source: 'builtin',
  },
]

const DEFAULT_STATE: ToolRegistryState = {
  tools: [],
  executionHistory: [],
  totalExecutions: 0,
  allowEvolvedTools: true,
}

export function useToolRegistry() {
  const state = reactive<ToolRegistryState>(
    guardedLoad<ToolRegistryState>('toolRegistry', { ...DEFAULT_STATE })
  )

  const tools = computed(() => state.tools)

  const builtinTools = computed(() =>
    state.tools.filter((t) => t.category === 'builtin')
  )

  const evolvedTools = computed(() =>
    state.tools.filter((t) => t.category === 'evolved')
  )

  const userTools = computed(() =>
    state.tools.filter((t) => t.category === 'user')
  )

  function save() {
    guardedSave('toolRegistry', { ...state })
  }

  function initBuiltinTools() {
    if (builtinTools.value.length > 0) return
    for (const tpl of BUILTIN_TOOLS) {
      const tool: ToolDefinition = {
        ...tpl,
        id: generateId(),
        createdAt: Date.now(),
        usageCount: 0,
        successRate: 100,
      }
      state.tools.push(tool)
    }
    save()
  }

  function createTool(def: Omit<ToolDefinition, 'id' | 'usageCount' | 'successRate'>): ToolDefinition {
    const tool: ToolDefinition = {
      ...def,
      id: generateId(),
      createdAt: Date.now(),
      usageCount: 0,
      successRate: 100,
    }
    const existing = state.tools.find((t) => t.name === def.name)
    if (existing) {
      Object.assign(existing, { ...def, id: existing.id, usageCount: existing.usageCount, successRate: existing.successRate })
      save()
      return existing
    }
    state.tools.push(tool)
    save()
    return tool
  }

  function removeTool(id: string) {
    const idx = state.tools.findIndex((t) => t.id === id)
    if (idx === -1) return
    const tool = state.tools[idx]
    if (tool.category === 'builtin') return
    state.tools.splice(idx, 1)
    save()
  }

  function updateTool(id: string, updates: Partial<ToolDefinition>) {
    const tool = state.tools.find((t) => t.id === id)
    if (!tool) return
    Object.assign(tool, updates)
    save()
  }

  function getTool(id: string): ToolDefinition | undefined {
    return state.tools.find((t) => t.id === id)
  }

  function getToolByName(name: string): ToolDefinition | undefined {
    return state.tools.find((t) => t.name === name)
  }

  function recordExecution(result: ToolExecutionResult) {
    const tool = state.tools.find((t) => t.id === result.toolId)
    if (tool) {
      if (result.success) {
        tool.usageCount++
        tool.successRate = tool.usageCount === 0 ? 100 :
          Math.round(((tool.successRate * (tool.usageCount - 1) + 100) / tool.usageCount))
      } else {
        tool.usageCount++
        tool.successRate = tool.usageCount === 0 ? 0 :
          Math.round(((tool.successRate * (tool.usageCount - 1)) / tool.usageCount))
      }
    }
    state.executionHistory.push(result)
    state.totalExecutions++
    if (state.executionHistory.length > 500) {
      state.executionHistory.splice(0, 100)
    }
    save()
  }

  function getRecentExecutions(limit: number = 20): ToolExecutionResult[] {
    return [...state.executionHistory].reverse().slice(0, limit)
  }

  function executeTool(toolId: string, params: Record<string, any>): ToolExecutionResult {
    const start = performance.now()
    const tool = getTool(toolId)

    if (!tool) {
      return { success: false, error: '工具不存在', duration: performance.now() - start, toolId, toolName: '' }
    }

    const missing = tool.params.filter((p) => p.required && !(p.name in params))
    if (missing.length > 0) {
      return {
        success: false,
        error: `缺少必填参数: ${missing.map((p) => p.name).join(', ')}`,
        duration: performance.now() - start,
        toolId,
        toolName: tool.name,
      }
    }

    const result: ToolExecutionResult = {
      success: true,
      data: { tool: tool.name, params, message: `已调度工具 [${tool.name}]，参数: ${JSON.stringify(params)}` },
      duration: performance.now() - start,
      toolId,
      toolName: tool.name,
    }

    recordExecution(result)
    return result
  }

  function evolveTool(evolvedToolDef: Omit<ToolDefinition, 'id' | 'usageCount' | 'successRate' | 'category'>): ToolDefinition {
    const existing = getToolByName(evolvedToolDef.name)
    if (existing) {
      updateTool(existing.id, { ...evolvedToolDef, version: autoIncrementVersion(existing.version) })
      return existing
    }
    return createTool({ ...evolvedToolDef, category: 'evolved' })
  }

  function autoIncrementVersion(ver: string): string {
    const parts = ver.split('.').map(Number)
    parts[2] = (parts[2] || 0) + 1
    return parts.join('.')
  }

  function suggestTools(task: string): ToolDefinition[] {
    const keywords = task.toLowerCase().split(/[\s,，]+/).filter(Boolean)
    const scored = state.tools.map((t) => {
      let score = 0
      const nameLow = t.name.toLowerCase()
      const descLow = t.description.toLowerCase()
      for (const kw of keywords) {
        if (kw.length < 2) continue
        if (nameLow.includes(kw)) score += 3
        if (descLow.includes(kw)) score += 1
      }
      return { tool: t, score }
    })
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.tool)
      .slice(0, 5)
  }

  function getStats() {
    return {
      totalTools: state.tools.length,
      builtin: builtinTools.value.length,
      evolved: evolvedTools.value.length,
      user: userTools.value.length,
      totalExecutions: state.totalExecutions,
      avgSuccessRate: state.tools.length === 0 ? 0 :
        Math.round(state.tools.reduce((sum, t) => sum + t.successRate, 0) / state.tools.length),
    }
  }

  return {
    state,
    tools,
    builtinTools,
    evolvedTools,
    userTools,
    initBuiltinTools,
    createTool,
    removeTool,
    updateTool,
    getTool,
    getToolByName,
    evolveTool,
    recordExecution,
    executeTool,
    suggestTools,
    getRecentExecutions,
    getStats,
  }
}
