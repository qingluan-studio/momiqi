<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { ChatSession, AIProvider } from '../types'
import { chatWithFallback } from '../api/router'
import { renderMarkdown, generateId } from '../utils/markdown'
import type { SubAgent } from '../stores/agents'
import { useEvolution } from '../stores/evolution'
import { useSelfLearning } from '../stores/self-learning'
import { useCorpusEngine } from '../stores/corpus-engine'
import { useKnowledgePlugins } from '../stores/knowledge-plugins'
import {
  shouldTriggerKnowledgeSearch,
  buildSystemContext,
  extractSources,
  formatKnowledgeContext,
} from '../utils/knowledge-router'

const corpus = useCorpusEngine()
const knowledgePlugins = useKnowledgePlugins()

const speedMetrics = ref({ tokensPerSec: 0, totalTokens: 0, elapsedMs: 0, provider: '' as string })
const lastSpeed = computed(() => {
  if (!speedMetrics.value.tokensPerSec) return ''
  const tps = speedMetrics.value.tokensPerSec
  if (tps >= 1000) return `${(tps / 1000).toFixed(1)}k t/s`
  return `${tps} t/s`
})

const props = defineProps<{
  chat: ReturnType<typeof import('../stores/chat').useChat>
  session: ChatSession
  settings: ReturnType<typeof import('../stores/settings').useSettings>
  activeAgent: SubAgent | null
  pendingPrompt: string
}>()

const emit = defineEmits<{
  openAgents: []
  openPrompts: []
}>()

const inputText = ref('')
const isLoading = ref(false)
const errorText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const deepThink = ref(false)
const editingMessageId = ref<string | null>(null)
const editContent = ref('')
const evolution = useEvolution()
const selfLearning = useSelfLearning()
const knowledgeSources = ref<string[]>([])
const externalKnowledgeUsed = ref(false)

onMounted(() => {
  if (props.pendingPrompt) {
    inputText.value = props.pendingPrompt
    textareaRef.value?.focus()
  }
})

const activeProviderName = computed(() => {
  const p = props.settings.settings.activeProvider
  const names: Record<string, string> = { deepseek: 'DeepSeek', gemini: 'Gemini', groq: 'Groq', kimi: 'Kimi' }
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
    content: deepThink.value ? `[深度思考模式]\n${text}` : text,
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

  const startTime = performance.now()
  isLoading.value = true
  externalKnowledgeUsed.value = false
  knowledgeSources.value = []

  let knowledgeContext: string | null = null

  // Auto-route to external knowledge plugins if question needs it
  if (shouldTriggerKnowledgeSearch(text) && knowledgePlugins.enabledCount.value > 0) {
    try {
      const results = await knowledgePlugins.smartSearch(text)
      knowledgeContext = buildSystemContext(results)
      if (results.some((r) => r.results.length > 0)) {
        externalKnowledgeUsed.value = true
        knowledgeSources.value = extractSources(results)
      }
    } catch {
      // Knowledge search failed silently, continue with normal chat
    }
  }

  try {
    const allMessages = props.session.messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }))

    const contextPhrase = corpus.matchPhrase(text)

    const messages = props.activeAgent
      ? [{ role: 'system' as const, content: props.activeAgent.systemPrompt }, ...allMessages]
      : deepThink.value
        ? [{ role: 'system' as const, content: '请对每个问题给出详细的推理过程、分析步骤和最终结论。中文回答。' }, ...allMessages]
        : allMessages

    // Inject external knowledge context as system message
    if (knowledgeContext) {
      messages.unshift({
        role: 'system' as const,
        content: `以下是从外部知识库检索到的参考资料。请在回答时参考这些信息并注明来源：\n\n${knowledgeContext}`,
      })
    }

    let totalTokens = 0

    const result = await chatWithFallback(messages, (provider, text, tokens) => {
      props.chat.updateLastAssistant(props.session.id, text, provider, tokens)
      if (tokens) totalTokens += tokens
      if (tokens) evolution.addTokens(tokens)
    })

    const elapsed = performance.now() - startTime
    props.chat.updateLastAssistant(props.session.id, result.content, result.provider, result.tokens)

    const finalTokens = result.tokens || totalTokens
    speedMetrics.value = {
      tokensPerSec: elapsed > 0 ? Math.round((finalTokens / elapsed) * 1000) : 0,
      totalTokens: finalTokens,
      elapsedMs: Math.round(elapsed),
      provider: result.provider,
    }

    if (result.tokens) evolution.addTokens(result.tokens)
    selfLearning.track(props.activeAgent?.name || 'default', text, result.content, true, result.tokens || 0)

    // Inject human-like conversational phrase (20% chance)
    if (contextPhrase && Math.random() < 0.2) {
      props.chat.appendToLastAssistant(props.session.id, `\n\n> *${contextPhrase.variant}*`)
    }
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

function copyMessage(content: string) {
  navigator.clipboard.writeText(content).catch(() => {})
}

function startEditMessage(msgId: string, content: string) {
  editingMessageId.value = msgId
  editContent.value = content
}

function cancelEdit() {
  editingMessageId.value = null
  editContent.value = ''
}

function submitEdit() {
  const text = editContent.value.trim()
  if (!text || !editingMessageId.value) return
  const session = props.session
  const idx = session.messages.findIndex(m => m.id === editingMessageId.value)
  if (idx < 0) return

  session.messages.splice(idx + 1)
  session.messages[idx].content = deepThink.value ? `[深度思考模式]\n${text}` : text
  props.chat.save()
  editingMessageId.value = null
  editContent.value = ''
  sendMessage()
}

function handleContainerClick(e: Event) {
  const btn = (e.target as HTMLElement).closest('.code-copy-btn') as HTMLButtonElement | null
  if (!btn) return
  const pre = btn.parentElement
  if (!pre) return
  const code = pre.textContent
  if (!code) return
  navigator.clipboard.writeText(code).catch(() => {})
  btn.textContent = '已复制'
  setTimeout(() => { btn.textContent = '复制' }, 1500)
}

function regenerate() {
  const msgs = [...props.session.messages]
  const lastUserIdx = msgs.map((m, i) => ({ m, i })).reverse().find(x => x.m.role === 'user')
  if (!lastUserIdx) return
  inputText.value = msgs[lastUserIdx.i].content
  props.session.messages.splice(lastUserIdx.i)
  props.chat.save()
  sendMessage()
}

function clearConversation() {
  props.session.messages.length = 0
  props.chat.save()
}

function exportChat() {
  const providerLabel: Record<string, string> = { deepseek: 'DeepSeek', gemini: 'Gemini', groq: 'Groq', kimi: 'Kimi' }
  const lines = props.session.messages.map(m => {
    const author = m.role === 'user' ? '我' : (m.provider ? providerLabel[m.provider] || 'AI' : 'AI')
    return `## ${author}\n\n${m.content}\n`
  })
  const md = `# ${props.session.title}\n\n` + lines.join('\n---\n\n')
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.session.title || 'chat'}.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="chat-panel">
    <div class="provider-badge">
      <span class="dot"></span>
      {{ activeProviderName }}
      <span v-if="lastSpeed && !isLoading" class="speed-badge">{{ lastSpeed }}</span>
      <span v-if="externalKnowledgeUsed && knowledgeSources.length > 0" class="knowledge-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        {{ knowledgeSources.slice(0, 3).join(', ') }}{{ knowledgeSources.length > 3 ? ' +' + (knowledgeSources.length - 3) : '' }}
      </span>
      <span v-if="props.activeAgent" class="agent-pill" @click="$emit('openAgents')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path :d="props.activeAgent.icon" />
        </svg>
        {{ props.activeAgent.name }}
      </span>
      <button v-else class="agent-add-btn" @click="$emit('openAgents')">+ 子代理</button>
      <div class="header-actions">
        <button class="think-toggle" :class="{ on: deepThink }" @click="deepThink = !deepThink">
          深度思考{{ deepThink ? ' ON' : ' OFF' }}
        </button>
        <button v-if="session.messages.length > 0" class="header-btn" @click="clearConversation" title="清空对话">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
        <button class="export-btn" @click="exportChat" title="导出 Markdown">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </button>
      </div>
    </div>

    <div ref="messagesContainer" class="messages-container" @click="handleContainerClick">
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
          <template v-if="editingMessageId === msg.id">
            <textarea v-model="editContent" class="edit-textarea" rows="3" @keydown.enter.exact.prevent="submitEdit" @keydown.escape="cancelEdit" />
            <div class="edit-actions">
              <button class="edit-btn cancel" @click="cancelEdit">取消</button>
              <button class="edit-btn save" @click="submitEdit">重新发送</button>
            </div>
          </template>
          <template v-else>
            <div
              class="msg-content"
              :class="{ editable: msg.role === 'user' }"
              v-html="renderMarkdown(msg.content)"
              @click="msg.role === 'user' && startEditMessage(msg.id, msg.content)"
            />
            <div class="msg-actions">
              <button class="msg-action-btn" @click="copyMessage(msg.content)">复制</button>
              <button
                v-if="msg.role === 'assistant' && msg === session.messages[session.messages.length - 1]"
                class="msg-action-btn"
                :disabled="isLoading"
                @click="regenerate"
              >重新生成</button>
            </div>
            <div class="msg-meta">
              <span v-if="msg.provider">{{ { deepseek: 'DeepSeek', gemini: 'Gemini', groq: 'Groq', kimi: 'Kimi' }[msg.provider] }}</span>
              <span v-if="msg.tokens" class="msg-tokens">{{ msg.tokens }} tokens</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="errorText" class="error-banner">
      {{ errorText }}
    </div>

    <div class="input-area">
      <button class="prompt-btn" @click="$emit('openPrompts')" title="Prompt 模板">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </button>
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
  padding: 6px 14px;
  font-size: 12px;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.agent-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(99,102,241,0.15);
  color: var(--accent);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  margin-left: auto;
  max-width: 140px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.agent-add-btn {
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px dashed var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.think-toggle {
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
}

.think-toggle.on {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.header-btn {
  width: 26px; height: 26px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-btn {
  width: 26px; height: 26px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.speed-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(16,185,129,0.15);
  color: #10b981;
  font-weight: 500;
}

.knowledge-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(168,85,247,0.12);
  color: #a855f7;
  font-weight: 500;
  white-space: nowrap;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  position: relative;
}

.msg-content :deep(.code-copy-btn) {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.msg-content :deep(pre:hover .code-copy-btn),
.msg-content :deep(.code-copy-btn:active) {
  opacity: 1;
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
  display: flex;
  gap: 8px;
  align-items: center;
}

.msg-tokens {
  color: var(--text-tertiary);
  font-size: 10px;
}

.msg-content.editable:active {
  opacity: 0.7;
}

.edit-textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--accent);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  font-family: inherit;
  resize: none;
}

.edit-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  margin-top: 6px;
}

.edit-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}

.edit-btn.cancel {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
}

.edit-btn.save {
  border: none;
  background: var(--accent);
  color: #fff;
}

.msg-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  padding: 0 4px;
}

.msg-action-btn {
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 10px;
  cursor: pointer;
}

.msg-action-btn:active { border-color: var(--accent); color: var(--accent); }
.msg-action-btn:disabled { opacity: 0.5; }

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

.prompt-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prompt-btn:active { border-color: var(--accent); color: var(--accent); }

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
