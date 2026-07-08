import { reactive } from 'vue'
import type { ChatSession, ChatMessage, AIProvider } from '../types'
import { getItem, setItem } from '../utils/storage'
import { generateId } from '../utils/markdown'

export function useChat() {
  const sessions = reactive<ChatSession[]>(getItem<ChatSession[]>('sessions', []))
  const currentSessionId = reactive({ value: getItem<string>('currentSessionId', '') })

  function save() {
    setItem('sessions', [...sessions])
    setItem('currentSessionId', currentSessionId.value)
  }

  function findSession(id: string): ChatSession | undefined {
    return sessions.find((s) => s.id === id)
  }

  function createSession(provider: AIProvider, model: string): ChatSession {
    const session: ChatSession = {
      id: generateId(),
      title: '新的对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider,
      model,
    }
    sessions.unshift(session)
    currentSessionId.value = session.id
    save()
    return session
  }

  function addMessage(sessionId: string, message: ChatMessage) {
    const s = findSession(sessionId)
    if (!s) return
    s.messages.push(message)
    s.updatedAt = Date.now()
    if (s.title === '新的对话' && message.role === 'user') {
      s.title = message.content.slice(0, 30) || '新的对话'
    }
    save()
  }

  function updateLastAssistant(sessionId: string, content: string, provider?: AIProvider, tokens?: number) {
    const s = findSession(sessionId)
    if (!s) return
    const last = s.messages[s.messages.length - 1]
    if (last && last.role === 'assistant') {
      last.content = content
      if (provider) last.provider = provider
      if (tokens !== undefined) last.tokens = tokens
    }
    s.updatedAt = Date.now()
    save()
  }

  function appendToLastAssistant(sessionId: string, content: string) {
    const s = findSession(sessionId)
    if (!s) return
    const last = s.messages[s.messages.length - 1]
    if (last && last.role === 'assistant') {
      last.content += content
    }
    s.updatedAt = Date.now()
    save()
  }

  function deleteSession(id: string) {
    const idx = sessions.findIndex((s) => s.id === id)
    if (idx < 0) return
    sessions.splice(idx, 1)
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions[0]?.id || ''
    }
    save()
  }

  function getCurrentSession(): ChatSession | undefined {
    if (!currentSessionId.value) return undefined
    return findSession(currentSessionId.value)
  }

  function togglePin(id: string) {
    const s = findSession(id)
    if (!s) return
    s.pinned = !s.pinned
    save()
  }

  function switchSession(id: string) {
    currentSessionId.value = id
    save()
  }

  return {
    sessions,
    currentSessionId,
    createSession,
    addMessage,
    updateLastAssistant,
    appendToLastAssistant,
    deleteSession,
    getCurrentSession,
    switchSession,
    togglePin,
    findSession,
    save,
  }
}
