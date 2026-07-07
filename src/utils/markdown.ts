import { marked } from 'marked'

;(marked as any).options = {
  breaks: true,
  gfm: true,
}
;(marked as any).setOptions = undefined

export function renderMarkdown(text: string): string {
  const cleaned = text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
  const html = marked(cleaned) as string

  return html.replace(
    /<pre(\s[^>]*)?>/g,
    '<pre$1><button class="code-copy-btn" onclick="this.blur()">复制</button>',
  )
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function truncateText(text: string, maxLen = 30): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length * 0.6)
}
