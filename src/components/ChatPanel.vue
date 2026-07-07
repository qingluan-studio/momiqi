<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { ChatSession, AIProvider } from '../types'
import { chatWithFallback } from '../api/router'
import { renderMarkdown, generateId } from '../utils/markdown'
import type { AppSettings } from '../types'

const props = defineProps<{
  chat: ReturnType<typeof import('../stores/chat').useChat>
  session: ChatSession
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const inputText = ref('')
const isLoading = ref(false)
const errorText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const activeProviderName = computed(() => {
  const p = props.settings.settings.activeProvider
  const names: Record<string, string> = { deepseek: 'DeepSeek', gemini: 'Gemini', groq: 'Groq' }
  return names[p] || p
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => props.session.messages.length, scrollToBottom)

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  errorText.value = ''

  const userMsg = {
    id: generateId(),
    role: 'user' as const,
    content: text,
    timestamp: Date.now(),
  }
  props.chat.addMessage(props.session.id, userMsg)

  const assistantMsg = {
    id: generateId(),
    role: 'assistant' as const,
    content: '思考中...',
    timestamp: Date.now(),
  }
  props.chat.addMessage(props.session.id, assistantMsg)

  isLoading.value = true

  try {
    const messages = props.session.messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }))

    const result = await chatWithFallback(messages, (provider, text) => {
      props.chat.updateLastAssistant(props.session.id, text, provider)
    })

    props.chat.updateLastAssistant(props.session.id, result.content, result.provider)
  } catch (err: any) {
    props.chat.updateLastAssistant(
      props.session.id,
      `错误: ${err.message || '未知错误，请检查设置和网络'}`,
    )
    errorText.value = err.message
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function handleInput() {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}
</script>

<template>
  <div class="chat-panel">
    <div class="provider-badge">
      <span class="dot"></span>
      {{ activeProviderName }}
    </div>

    <div ref="messagesContainer" class="messages-container">
      <div
        v-for="msg in session.messages"
        :key="msg.id"
        class="message"
        :class="[`role-${msg.role}`, { loading: msg.role === 'assistant' && isLoading }]"
      >
        <div class="msg-avatar">
          {{ msg.role === 'user' ? '我' : 'AI' }}
        </div>
        <div class="msg-body">
          <div class="msg-content" v-html="renderMarkdown(msg.content)" />
          <div v-if="msg.provider" class="msg-meta">
            {{ { deepseek: 'DeepSeek', gemini: 'Gemini', groq: 'Groq' }[msg.provider] }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorText" class="error-banner">
      {{ errorText }}
    </div>

    <div class="input-area">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="chat-input"
        :disabled="isLoading"
        placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
        rows="1"
        @keydown="handleKeydown"
        @input="handleInput"
      />
      <button
        class="send-btn"
        :disabled="!inputText.trim() || isLoading"
        @click="sendMessage"
      >
        <svg v-if="!isLoading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        <span v-else class="spinner" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.provider-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 12px;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 100%;
}

.message.role-user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.role-user .msg-avatar {
  background: var(--accent);
  color: #fff;
}

.msg-body {
  max-width: 85%;
}

.msg-content {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.65;
  word-break: break-word;
}

.role-user .msg-content {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.role-assistant .msg-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.msg-content :deep(p) {
  margin: 0 0 8px 0;
}

.msg-content :deep(p:last-child) {
  margin-bottom: 0;
}

.msg-content :deep(pre) {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  font-size: 12px;
  margin: 8px 0;
  -webkit-overflow-scrolling: touch;
}

.msg-content :deep(code) {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
}

.msg-content :deep(p code) {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.msg-content :deep(ul), .msg-content :deep(ol) {
  padding-left: 20px;
  margin: 4px 0;
}

.msg-content :deep(li) {
  margin: 4px 0;
}

.msg-content :deep(blockquote) {
  border-left: 3px solid var(--accent);
  padding-left: 12px;
  margin: 8px 0;
  color: var(--text-secondary);
}

.msg-meta {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 4px;
  padding: 0 4px;
}

.error-banner {
  margin: 0 16px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 8px;
  color: #ef4444;
  font-size: 12px;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.chat-input {
  flex: 1;
  resize: none;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  font-family: inherit;
  max-height: 120px;
}

.chat-input:focus {
  border-color: var(--accent);
}

.chat-input::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.send-btn:disabled {
  opacity: 0.4;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
