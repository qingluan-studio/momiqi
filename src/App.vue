<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useChat } from './stores/chat'
import { useSettings } from './stores/settings'
import { usePrompts } from './stores/prompts'
import { getItem } from './utils/storage'
import type { AIProvider } from './types'
import Sidebar from './components/Sidebar.vue'
import ChatPanel from './components/ChatPanel.vue'
import PromptLibrary from './components/PromptLibrary.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import TestPanel from './components/TestPanel.vue'
import TabBar from './components/TabBar.vue'
import VisionTool from './components/VisionTool.vue'
import CodeGenTool from './components/CodeGenTool.vue'
import ToolBox from './components/ToolBox.vue'
import KnowledgeBase from './components/KnowledgeBase.vue'
import AIEvolution from './components/AIEvolution.vue'
import AgentSelector from './components/AgentSelector.vue'
import ACIPanel from './components/ACIPanel.vue'
import { type SubAgent } from './stores/agents'
import { useEvolution } from './stores/evolution'

const chatStore = useChat()
const settingsStore = useSettings()
const promptsStore = usePrompts()
const evolution = useEvolution()

const activeTab = ref('chat')
const showSidebar = ref(false)
const showSettings = ref(false)
const showTest = ref(false)
const showAgents = ref(false)
const showACI = ref(false)
const activeAgent = ref<SubAgent | null>(null)
const showPromptLib = ref(false)
const pendingPrompt = ref('')

const currentSession = computed(() => chatStore.getCurrentSession())

function startNewChat() {
  const activeProvider = getItem<AIProvider>('activeProvider', 'deepseek')
  const providerSettings = settingsStore.settings.providers[activeProvider]
  const modelMap: Record<string, string> = {
    deepseek: 'deepseek-chat',
    gemini: 'gemini-2.0-flash',
    groq: 'llama-3.3-70b-versatile',
    kimi: 'moonshot-v1-8k',
  }
  const model = providerSettings?.models?.[0] || modelMap[activeProvider] || ''
  chatStore.createSession(activeProvider, model)
  showSidebar.value = false
}

function handleSelectSession(id: string) {
  chatStore.switchSession(id)
  showSidebar.value = false
}

function handleDeleteSession(id: string) {
  chatStore.deleteSession(id)
}

function openSettings() {
  showSettings.value = true
  showSidebar.value = false
}

function handleSelectAgent(agent: SubAgent) {
  activeAgent.value = agent
  showAgents.value = false
  if (!currentSession.value) {
    startNewChat()
  }
}

function handleToggleDefault() {
  activeAgent.value = null
  showAgents.value = false
}

function handleTogglePin(id: string) {
  chatStore.togglePin(id)
}

function applyTheme(theme: string) {
  const root = document.documentElement
  const isLight = theme === 'light' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)

  root.style.setProperty('--bg-primary', isLight ? '#ffffff' : '#111827')
  root.style.setProperty('--bg-secondary', isLight ? '#f9fafb' : '#1f2937')
  root.style.setProperty('--bg-tertiary', isLight ? '#f3f4f6' : '#374151')
  root.style.setProperty('--bg-hover', isLight ? '#e5e7eb' : '#374151')
  root.style.setProperty('--text-primary', isLight ? '#111827' : '#f9fafb')
  root.style.setProperty('--text-secondary', isLight ? '#4b5563' : '#d1d5db')
  root.style.setProperty('--text-tertiary', isLight ? '#9ca3af' : '#6b7280')
  root.style.setProperty('--border-color', isLight ? '#e5e7eb' : '#374151')
  root.style.setProperty('--accent', '#6366f1')
  root.style.setProperty('--danger', '#ef4444')
  root.style.setProperty('color-scheme', isLight ? 'light' : 'dark')
}

onMounted(() => applyTheme(settingsStore.settings.theme))
watch(() => settingsStore.settings.theme, applyTheme)

const themeMediaQuery = window.matchMedia('(prefers-color-scheme: light)')
themeMediaQuery.addEventListener('change', () => {
  if (settingsStore.settings.theme === 'system') applyTheme('system')
})

function switchTab(tab: string) {
  activeTab.value = tab
  if (tab === 'chat' && !currentSession.value) {
    startNewChat()
  }
}
</script>

<template>
  <div class="app-shell"
    :class="`theme-${settingsStore.settings.theme} font-${settingsStore.settings.fontSize}`"
  >
    <Transition name="slide">
      <Sidebar
        v-if="showSidebar"
        :chat="chatStore"
        :sessions="chatStore.sessions"
        :current-id="chatStore.currentSessionId.value"
        @close="showSidebar = false"
        @settings="openSettings"
        @select="handleSelectSession"
        @delete="handleDeleteSession"
        @new-chat="startNewChat"
        @toggle-pin="handleTogglePin"
      />
    </Transition>

    <Transition name="slide">
      <SettingsPanel
        v-if="showSettings"
        :settings="settingsStore"
        @close="showSettings = false"
      />
    </Transition>

    <TestPanel v-if="showTest" @close="showTest = false" />

    <ACIPanel
      :active-agent="activeAgent"
      :active-tab="activeTab"
      :show="showACI"
      @close="showACI = false"
    />

    <Transition name="slide">
      <AgentSelector
        v-if="showAgents"
        @select="handleSelectAgent"
        @toggle-default="handleToggleDefault"
      />
    </Transition>

    <PromptLibrary
      v-if="showPromptLib"
      @close="showPromptLib = false"
      @select="(content) => { pendingPrompt = content; showPromptLib = false }"
    />

    <div class="app-main">
      <header class="app-header">
        <button class="icon-btn" @click="showSidebar = !showSidebar" aria-label="菜单">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span class="app-title">
          {{ { chat: currentSession?.title || 'AI 对话', vision: '图片理解', code: '代码生成', tools: '工具箱', knowledge: '知识库', evolution: 'AI 进化之路' }[activeTab] }}
        </span>
        <button class="icon-btn" @click="showACI = true" aria-label="ACI面板">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>
        <div class="evo-badge" :title="`${evolution.getStageInfo().label} | 累计 ${evolution.getStageInfo().totalTokens} tokens`">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="evolution.stageIcons[evolution.state.stage]" />
          </svg>
          <span class="evo-label">{{ evolution.getStageInfo().label }}</span>
        </div>
        <button class="icon-btn" @click="showSettings = true" aria-label="设置">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </header>

      <main class="app-content">
        <template v-if="activeTab === 'chat'">
          <WelcomeScreen
            v-if="!currentSession"
            :chat="chatStore"
            :use-settings="settingsStore"
            :active-agent="activeAgent"
            :pending-prompt="pendingPrompt"
            @start="startNewChat()"
            @test="showTest = true"
            @open-agents="showAgents = true"
            @open-prompts="showPromptLib = true"
          />
          <ChatPanel
            v-else
            :chat="chatStore"
            :session="currentSession!"
            :settings="settingsStore"
            :active-agent="activeAgent"
            :pending-prompt="pendingPrompt"
            @open-agents="showAgents = true"
            @open-prompts="showPromptLib = true"
          />
        </template>

        <VisionTool v-if="activeTab === 'vision'" :settings="settingsStore" />
        <CodeGenTool v-if="activeTab === 'code'" :settings="settingsStore" />
        <ToolBox v-if="activeTab === 'tools'" :settings="settingsStore" />
        <KnowledgeBase v-if="activeTab === 'knowledge'" :settings="settingsStore" />
        <AIEvolution v-if="activeTab === 'evolution'" />
      </main>

      <TabBar :active="activeTab" @change="switchTab" />
    </div>

    <div v-if="showSidebar" class="overlay" @click="showSidebar = false" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100dvh;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
  min-height: 46px;
}

.app-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.icon-btn:active {
  background: var(--bg-hover);
}

.evo-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  color: var(--accent);
  font-size: 10px;
  font-weight: 500;
  cursor: default;
}

.evo-label {
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 5;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
