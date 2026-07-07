import type { AIProvider, ProviderConfig, APIError } from '../types'
import { deepseekAPI, geminiAPI, groqAPI, kimiAPI } from './adapters'
import { getItem } from '../utils/storage'

function getProviders(settings: ProviderConfig): AIProvider[] {
  return (Object.entries(settings) as [AIProvider, { enabled: boolean; apiKey: string; priority: number }][])
    .filter(([, v]) => v.enabled && v.apiKey)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .map(([k]) => k)
}

const apiMap = {
  deepseek: deepseekAPI,
  gemini: geminiAPI,
  groq: groqAPI,
  kimi: kimiAPI,
}

async function callProvider(
  provider: AIProvider,
  model: string,
  messages: { role: string; content: string }[],
  settings: ProviderConfig
): Promise<{ text: string; tokens?: number }> {
  const api = apiMap[provider]
  const cfg = settings[provider]

  if (!cfg.apiKey) {
    throw { provider, status: 401, message: `${api.name} 未配置 API Key` } as APIError
  }

  const url = api.basePath + api.chatEndpoint + (provider === 'gemini' ? model + ':generateContent?key=' + cfg.apiKey : '')
  const headers = api.buildHeaders(cfg.apiKey)
  const body = api.buildBody(model, messages)

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw { provider, status: res.status, message: `${api.name} 请求失败 (${res.status}): ${errText.slice(0, 200)}` } as APIError
  }

  const data = await res.json()
  return api.parseResponse(data)
}

export async function chatWithFallback(
  messages: { role: string; content: string }[],
  onChunk?: (provider: AIProvider, text: string, tokens?: number) => void
): Promise<{ provider: AIProvider; content: string; tokens?: number }> {
  const settings = getItem<ProviderConfig>('settings', {} as ProviderConfig)
  const providers = getProviders(settings)

  if (providers.length === 0) {
    throw new Error('请先在设置中配置至少一个 AI 服务的 API Key')
  }

  const activeProvider = getItem<AIProvider>('activeProvider', providers[0])
  const activeModel = settings[activeProvider]?.models?.[0] || apiMap[activeProvider]?.defaultModel || ''

  if (providers.includes(activeProvider)) {
    try {
      const { text, tokens } = await callProvider(activeProvider, activeModel, messages, settings)
      onChunk?.(activeProvider, text, tokens)
      return { provider: activeProvider, content: text, tokens }
    } catch (err) {
      const apiErr = err as APIError
      if (apiErr.status === 401 || apiErr.status === 403) {
        console.warn(`[Router] ${activeProvider} 认证失败，跳过`)
      } else {
        console.warn(`[Router] ${activeProvider} 请求失败:`, apiErr.message)
      }
    }
  }

  for (const provider of providers) {
    if (provider === activeProvider) continue
    const model = settings[provider]?.models?.[0] || apiMap[provider]?.defaultModel || ''

    try {
      const { text, tokens } = await callProvider(provider, model, messages, settings)
      onChunk?.(provider, text, tokens)
      return { provider, content: text, tokens }
    } catch (err) {
      const apiErr = err as APIError
      console.warn(`[Router] ${provider} fallback 失败:`, apiErr.message)
    }
  }

  throw new Error('所有 AI 服务均不可用，请检查 API Key 配置和网络连接')
}

export async function testProvider(provider: AIProvider, apiKey: string): Promise<boolean> {
  const api = apiMap[provider]
  const settings = getItem<ProviderConfig>('settings', {} as ProviderConfig)
  const cfg = { ...settings[provider], apiKey }

  try {
    await callProvider(
      provider,
      api.defaultModel,
      [{ role: 'user', content: '你好，请回复"OK"' }],
      { ...settings, [provider]: cfg } as ProviderConfig
    )
    return true
  } catch {
    return false
  }
}
