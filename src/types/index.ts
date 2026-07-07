export type AIProvider = 'deepseek' | 'gemini' | 'groq' | 'kimi'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  provider?: AIProvider
  tokens?: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  provider: AIProvider
  model: string
  pinned?: boolean
}

export interface PromptTemplate {
  id: string
  title: string
  content: string
  category: '创作' | '编程' | '翻译' | '分析' | '效率' | '通用'
  isBuiltin?: boolean
}

export interface ProviderSettings {
  enabled: boolean
  apiKey: string
  models: string[]
  priority: number
}

export type ProviderConfig = Record<AIProvider, ProviderSettings>

export interface AppSettings {
  providers: ProviderConfig
  activeProvider: AIProvider
  theme: 'dark' | 'light' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  language: 'zh-CN' | 'en-US'
}

export interface ProviderAPI {
  name: string
  basePath: string
  chatEndpoint: string
  modelsEndpoint: string
  defaultModel: string
  buildHeaders: (apiKey: string) => Record<string, string>
  buildBody: (model: string, messages: { role: string; content: string }[]) => unknown
  parseResponse: (data: any) => { text: string; tokens?: number }
}

export interface APIError {
  provider: AIProvider
  status: number
  message: string
}
