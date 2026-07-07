<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChat } from './stores/chat'
import { useSettings } from './stores/settings'
import { getItem } from './utils/storage'
import type { AIProvider } from './types'
import Sidebar from './components/Sidebar.vue'
import ChatPanel from './components/ChatPanel.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import TestPanel from './components/TestPanel.vue'

const chatStore = useChat()
const settingsStore = useSettings()

const showSidebar = ref(false)
const showSettings = ref(false)
const showTest = ref(false)

const currentSession = computed(() => chatStore.getCurrentSession())

function startNewChat() {
  const activeProvider = getItem<AIProvider>('activeProvider', 'deepseek')
  const providerSettings = settingsStore.settings.providers[activeProvider]
  const modelMap: Record<string, string> = {
    deepseek: 'deepseek-chat',
    gemini: 'gemini-2.0-flash',
    groq: 'llama-3.3-70b-versatile',
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

    <div class="app-main">
      <header class="app-header">
        <button class="icon-btn" @click="showSidebar = !showSidebar" aria-label="菜单">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span class="app-title">
          {{ currentSession?.title || 'AI 工具箱' }}
        </span>
        <button class="icon-btn" @click="showSettings = true" aria-label="设置">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </header>

      <main class="app-content">
        <WelcomeScreen
          v-if="!currentSession"
          :chat="chatStore"
          :use-settings="settingsStore"
          @start="startNewChat()"
          @test="showTest = true"
        />
        <ChatPanel
          v-else
          :chat="chatStore"
          :session="currentSession!"
          :settings="settingsStore"
        />
      </main>
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
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
  min-height: 48px;
}

.app-title {
  font-size: 16px;
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
  width: 36px;
  height: 36px;
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
