import type { PluginQueryResult } from '../stores/knowledge-plugins'

interface EnrichedContext {
  query: string
  results: PluginQueryResult[]
  summary: string
  sources: string[]
  timestamp: number
}

const enrichmentCache = new Map<string, EnrichedContext>()
const ENRICH_CACHE_TTL = 5 * 60 * 1000

function extractKeywords(text: string): string {
  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '要', '他', '会', '这',
    '来', '们', '说', '一', '个', '上', '也', '很', '得', '到', '那', '去', '看', '能', '什么',
    '为', '所以', '如果', '因为', '可以', '没有', '时间', '知道', '觉得', '已经', '然后', '但是',
    '问题', '这个', '那些', '还是', '应该', '比较', '可能', '之后', '或者', '出来', '自己', '其实',
    '工作', '技术', '需要', '非常', '喜欢', '东西', '大家', '认为', '谢谢', '请问', '哪里', '怎么',
    '为什么', '多少', '几个', '如何', '怎样', '能否', '是否',
  ])
  const words = text
    .replace(/[，。！？、；：""''（）【】《》\n\r]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w))

  const freq: Record<string, number> = {}
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1
  }

  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([w]) => w)
    .join(' ')
}

export function formatKnowledgeContext(results: PluginQueryResult[]): string {
  if (!results || results.length === 0) return ''

  const allItems = results
    .filter((r) => r.results.length > 0)
    .flatMap((r) => r.results.map((item) => ({ ...item, pluginName: r.pluginName })))

  if (allItems.length === 0) return ''

  const lines: string[] = ['## 外部知识库检索结果']

  const bySource = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const key = item.pluginName
    if (!bySource.has(key)) bySource.set(key, [])
    bySource.get(key)!.push(item)
  }

  for (const [source, items] of bySource) {
    lines.push(`\n### ${source}`)
    for (const item of items.slice(0, 3)) {
      lines.push(`- **${item.title}**: ${item.snippet}`)
      if (item.url) lines.push(`  ${item.url}`)
    }
  }

  return lines.join('\n')
}

export function buildEnrichedMessages(
  userMessage: string,
  knowledgeResults: PluginQueryResult[]
): { role: string; content: string }[] {
  const context = formatKnowledgeContext(knowledgeResults)

  if (!context) {
    return [{ role: 'user', content: userMessage }]
  }

  return [{ role: 'user', content: userMessage }]
}

export function buildSystemContext(knowledgeResults: PluginQueryResult[]): string | null {
  const context = formatKnowledgeContext(knowledgeResults)
  if (!context) return null

  return context
}

export function shouldTriggerKnowledgeSearch(message: string): boolean {
  const len = message.trim().length
  if (len < 8) return false

  const questionPatterns = [
    /什么是/,
    /怎么[样做]/,
    /如何/,
    /为什么/,
    /有哪些/,
    /介绍一下/,
    /搜索/,
    /查找/,
    /帮我找/,
    /最新/,
    /文档/,
    /npm\s/,
    /github/i,
    /论文/,
    /arxiv/i,
    /wikipedia/i,
    /维基/,
    /API/,
    /库/,
    /框架/,
    /教程/,
    /指南/,
    /\?$/,
    /？$/,
    /帮我查/,
  ]

  if (questionPatterns.some((p) => p.test(message))) return true

  const keywords = ['怎么', '如何', '什么', '为什么', '哪些', '查找', '搜索', '资料', '参考']
  return keywords.some((kw) => message.includes(kw))
}

export function extractSources(results: PluginQueryResult[]): string[] {
  return results
    .filter((r) => r.results.length > 0)
    .map((r) => r.pluginName)
}

export function getCachedEnrichment(query: string): EnrichedContext | null {
  const entry = enrichmentCache.get(query)
  if (!entry) return null
  if (Date.now() - entry.timestamp > ENRICH_CACHE_TTL) {
    enrichmentCache.delete(query)
    return null
  }
  return entry
}

export function setCachedEnrichment(query: string, context: EnrichedContext) {
  enrichmentCache.set(query, context)
  if (enrichmentCache.size > 200) {
    const keys = [...enrichmentCache.keys()]
    for (let i = 0; i < 50; i++) enrichmentCache.delete(keys[i])
  }
}

export { extractKeywords }
