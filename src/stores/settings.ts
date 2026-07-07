import { reactive } from 'vue'
import type { AppSettings, AIProvider, ProviderConfig } from '../types'
import { getItem, setItem } from '../utils/storage'

const DEFAULT_SETTINGS: AppSettings = {
  providers: {
    deepseek: { enabled: false, apiKey: '', models: ['deepseek-chat', 'deepseek-reasoner'], priority: 1 },
    gemini: { enabled: false, apiKey: '', models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'], priority: 2 },
    groq: { enabled: false, apiKey: '', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'llama-3.1-8b-instant'], priority: 3 },
    kimi: { enabled: false, apiKey: '', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'], priority: 4 },
  },
  activeProvider: 'deepseek',
  theme: 'dark',
  fontSize: 'medium',
  language: 'zh-CN',
}

export function useSettings() {
  const settings = reactive<AppSettings>(getItem<AppSettings>('settings', DEFAULT_SETTINGS))

  function save() {
    setItem('settings', { ...settings })
  }

  function setProviderModel(provider: AIProvider, model: string) {
    const models = settings.providers[provider].models
    const idx = models.indexOf(model)
    if (idx < 0) return
    const [item] = models.splice(idx, 1)
    models.unshift(item)
    save()
  }

  function setProviderEnabled(provider: AIProvider, enabled: boolean) {
    settings.providers[provider].enabled = enabled
    save()
  }

  function setProviderApiKey(provider: AIProvider, apiKey: string) {
    settings.providers[provider].apiKey = apiKey
    save()
  }

  function setProviderPriority(provider: AIProvider, priority: number) {
    settings.providers[provider].priority = priority
    save()
  }

  function setActiveProvider(provider: AIProvider) {
    settings.activeProvider = provider
    setItem('activeProvider', provider)
    save()
  }

  function setTheme(theme: 'dark' | 'light' | 'system') {
    settings.theme = theme
    save()
  }

  function getProviderConfig(provider: AIProvider) {
    return settings.providers[provider]
  }

  function getEnabledProviders(): AIProvider[] {
    return (Object.entries(settings.providers) as [AIProvider, { enabled: boolean }][])
      .filter(([, v]) => v.enabled)
      .map(([k]) => k)
  }

  return {
    settings,
    save,
    setProviderModel,
    setProviderEnabled,
    setProviderApiKey,
    setProviderPriority,
    setActiveProvider,
    setTheme,
    getProviderConfig,
    getEnabledProviders,
  }
}
