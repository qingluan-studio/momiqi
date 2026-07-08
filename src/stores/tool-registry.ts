import { reactive, computed } from 'vue'
import { guardedLoad, guardedSave } from '../utils/data-integrity'
import { generateId, renderMarkdown } from '../utils/markdown'
import { chatWithFallback } from '../api/router'

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

  async function executeTool(toolId: string, params: Record<string, any>): Promise<ToolExecutionResult> {
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

    try {
      const data = await executeByToolName(tool.name, params)
      const result: ToolExecutionResult = {
        success: true,
        data,
        duration: performance.now() - start,
        toolId,
        toolName: tool.name,
      }
      recordExecution(result)
      return result
    } catch (e: any) {
      const result: ToolExecutionResult = {
        success: false,
        error: e.message || `${tool.name} 执行失败`,
        duration: performance.now() - start,
        toolId,
        toolName: tool.name,
      }
      recordExecution(result)
      return result
    }
  }

  async function executeByToolName(name: string, params: Record<string, any>): Promise<any> {
    switch (name) {
      case '文本处理': return executeTextProcessing(params)
      case '代码生成': return executeCodeGeneration(params)
      case '图片理解': return executeVision(params)
      case '联网搜索': return executeWebSearch(params)
      case '文档总结': return executeSummarize(params)
      case '网页分析': return executeWebPageAnalysis(params)
      case '翻译': return executeTranslation(params)
      case 'SQL生成': return executeSqlGeneration(params)
      case '音频转录': return executeAudioTranscription(params)
      case '时间管理': return executeTimeManagement(params)
      case '二维码': return executeQrcode(params)
      case '颜色工具': return executeColorTool(params)
      default:
        throw new Error(`未知工具: ${name}`)
    }
  }

  async function executeCodeGeneration(params: Record<string, any>) {
    const { prompt, language } = params
    const langHint = language && language !== 'auto' ? `使用 ${language} 语言编写。` : '自动选择合适的编程语言。'
    const result = await chatWithFallback([
      { role: 'system', content: `你是一位资深程序员。${langHint}严格只输出代码，不要加任何解释、注释前缀或markdown代码块标记。直接输出纯代码。` },
      { role: 'user', content: prompt },
    ])
    return {
      code: result.content,
      language: language || result.provider,
      provider: result.provider,
      tokens: result.tokens,
    }
  }

  async function executeTranslation(params: Record<string, any>) {
    const { text, from, to } = params
    const targetLang = to || '中文'
    const sourceHint = from ? `从${from}` : ''
    const result = await chatWithFallback([
      { role: 'system', content: `你是一个专业翻译引擎。将文本${sourceHint}翻译成${targetLang}。严格只输出译文，不要加任何解释、原文、引号或markdown标记。` },
      { role: 'user', content: text },
    ])
    return {
      translation: result.content,
      from: from || '自动检测',
      to: targetLang,
      provider: result.provider,
      tokens: result.tokens,
    }
  }

  async function executeSqlGeneration(params: Record<string, any>) {
    const { description, dialect } = params
    const db = dialect || 'mysql'
    const result = await chatWithFallback([
      { role: 'system', content: `你是数据库专家。根据自然语言描述生成${db.toUpperCase()} SQL查询语句。严格只输出SQL，不要加解释或markdown代码块标记。` },
      { role: 'user', content: description },
    ])
    return {
      sql: result.content,
      dialect: db,
      provider: result.provider,
      tokens: result.tokens,
    }
  }

  async function executeSummarize(params: Record<string, any>) {
    const { content, style } = params
    const styleMap: Record<string, string> = {
      brief: '用一句话（不超过50字）概括核心内容',
      detailed: '给出详细摘要（200字以内），保留关键数据、人物和事实',
      bullets: '以要点列表形式总结（每点一行，用 - 开头），最多5个要点',
      mindmap: '以层级缩进结构组织要点，用缩进表示层级关系',
    }
    const instruction = styleMap[style] || styleMap.bullets
    const result = await chatWithFallback([
      { role: 'system', content: `你是文档分析专家。${instruction}。中文回复。` },
      { role: 'user', content },
    ])
    return {
      summary: result.content,
      style: style || 'bullets',
      provider: result.provider,
      tokens: result.tokens,
    }
  }

  async function executeVision(params: Record<string, any>) {
    const { imageUrl, prompt } = params
    const visionPrompt = prompt || '请详细描述这张图片的内容，包括场景、物体、人物、文字、色彩和构图。'
    const result = await chatWithFallback([
      { role: 'user', content: `${visionPrompt}\n\n图片URL: ${imageUrl}` },
    ])
    return {
      analysis: result.content,
      imageUrl,
      provider: result.provider,
      tokens: result.tokens,
    }
  }

  async function executeWebSearch(params: Record<string, any>) {
    const { query, count } = params
    const n = count || 5
    const result = await chatWithFallback([
      { role: 'system', content: `你是搜索引擎助手。根据用户查询提供${n}条最新的相关信息。每条信息一行，格式: - [标题] 简要描述` },
      { role: 'user', content: `搜索关键词: ${query}` },
    ])
    const lines = result.content.split('\n').filter((l: string) => l.trim().startsWith('-'))
    return {
      query,
      results: lines.length > 0 ? lines.join('\n') : result.content,
      count: lines.length,
      provider: result.provider,
      tokens: result.tokens,
    }
  }

  async function executeWebPageAnalysis(params: Record<string, any>) {
    const { url } = params
    let pageContent = ''
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      const html = await res.text()
      const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
      pageContent = textContent
    } catch {
      // fall through to AI analysis without page content
    }
    const prompt = pageContent
      ? `分析以下网页的文本内容，提取：1)页面主题 2)关键信息要点 3)核心结论\n\n${pageContent}`
      : `请根据URL "${url}" 所指向的网站，分析其可能的主题、内容和用途。`
    const result = await chatWithFallback([
      { role: 'system', content: '你是网页分析专家。对网页内容进行结构化分析。中文回复。' },
      { role: 'user', content: prompt },
    ])
    return {
      url,
      analysis: result.content,
      fetched: !!pageContent,
      provider: result.provider,
      tokens: result.tokens,
    }
  }

  function executeTextProcessing(params: Record<string, any>) {
    const { input, operation, options = {} } = params
    switch (operation) {
      case 'encode': {
        const encoded = btoa(String(input))
        return { result: encoded, operation: 'encode' }
      }
      case 'decode': {
        try {
          const decoded = atob(String(input))
          return { result: decoded, operation: 'decode' }
        } catch {
          throw new Error('输入不是有效的Base64编码文本')
        }
      }
      case 'format': {
        try {
          const parsed = JSON.parse(String(input))
          return { result: JSON.stringify(parsed, null, 2), operation: 'format' }
        } catch {
          throw new Error('不是有效的JSON格式，无法格式化')
        }
      }
      case 'regex': {
        const { pattern, flags } = options
        if (!pattern) throw new Error('正则表达式模式不能为空')
        try {
          const regex = new RegExp(pattern, flags || 'g')
          const matches = [...String(input).matchAll(regex)]
          if (matches.length === 0) return { result: '未找到匹配', operation: 'regex', pattern, count: 0 }
          const lines = matches.map((m, i) => {
            if (m.groups) {
              const groups = Object.entries(m.groups).map(([k, v]) => `  ${k}: ${v}`).join('\n')
              return `匹配${i + 1}: ${m[0]}\n${groups}`
            }
            return `匹配${i + 1}: ${m[0]}`
          })
          return { result: lines.join('\n'), operation: 'regex', pattern, count: matches.length }
        } catch (e: any) {
          throw new Error(`正则表达式错误: ${e.message}`)
        }
      }
      case 'markdown': {
        const html = renderMarkdown(String(input))
        return { result: html, operation: 'markdown', raw: input }
      }
      default:
        throw new Error(`未知操作: ${operation}`)
    }
  }

  function executeTimeManagement(params: Record<string, any>) {
    const { operation, value } = params
    switch (operation) {
      case 'timezone': {
        const now = new Date()
        const utc = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
        const local = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        const ts = Date.now()
        return { utc, local: `${local} (系统本地)`, timestamp: ts }
      }
      case 'countdown': {
        const target = new Date(value)
        if (isNaN(target.getTime())) throw new Error('无效的目标日期')
        const diff = target.getTime() - Date.now()
        if (diff <= 0) return { message: '目标时间已到', target: value, remaining: 0 }
        const days = Math.floor(diff / 86400000)
        const hours = Math.floor((diff % 86400000) / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)
        return { target: value, remaining: diff, formatted: `${days}天 ${hours}小时 ${minutes}分钟` }
      }
      case 'calc': {
        const parts = value.split(',').map((p: string) => p.trim())
        const d1 = new Date(parts[0])
        const d2 = new Date(parts[1] || Date.now())
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) throw new Error('无效的日期')
        const diff = Math.abs(d2.getTime() - d1.getTime())
        const days = Math.floor(diff / 86400000)
        return { date1: parts[0], date2: parts[1] || '现在', daysBetween: days }
      }
      case 'format': {
        const d = new Date(value)
        if (isNaN(d.getTime())) return { result: new Date().toLocaleString('zh-CN') }
        return {
          iso: d.toISOString(),
          local: d.toLocaleString('zh-CN'),
          date: d.toLocaleDateString('zh-CN'),
          time: d.toLocaleTimeString('zh-CN'),
          weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
        }
      }
      default:
        throw new Error(`未知时间操作: ${operation}`)
    }
  }

  function executeQrcode(params: Record<string, any>) {
    const { data, action } = params
    if (action === 'decode') throw new Error('二维码解析需要图片输入，请上传二维码图片使用图片理解工具')
    const encoded = encodeURIComponent(String(data))
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`
    return { qrImageUrl: qrUrl, data: String(data).slice(0, 200) }
  }

  function executeColorTool(params: Record<string, any>) {
    const { value, format } = params
    const target = format || 'hex'
    try {
      const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
      if (canvas) {
        canvas.width = 1; canvas.height = 1
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = value
          ctx.fillRect(0, 0, 1, 1)
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
          const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
          const rgb = `rgb(${r}, ${g}, ${b})`
          const hslArr = rgbToHsl(r, g, b)
          const hsl = `hsl(${hslArr[0]}, ${hslArr[1]}%, ${hslArr[2]}%)`
          const result: Record<string, string> = { hex, rgb, hsl, preview: hex }
          return { ...result, formatted: result[target] || hex }
        }
      }
      return { formatted: value }
    } catch (e: any) {
      return { formatted: value, error: e.message }
    }
  }

  function rgbToHsl(r: number, g: number, b: number): number[] {
    const rn = r / 255; const gn = g / 255; const bn = b / 255
    const max = Math.max(rn, gn, bn); const min = Math.min(rn, gn, bn)
    const l = (max + min) / 2
    if (max === min) return [0, 0, Math.round(l * 100)]
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
  }

  async function executeAudioTranscription(params: Record<string, any>) {
    const { audioData, language } = params
    const lang = language || 'zh'
    throw new Error(`音频转录需要支持语音识别的API（如Whisper），当前请使用支持多模态的Gemini模型。音频数据长度: ${audioData.length} 字符`)
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
