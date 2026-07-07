<script setup lang="ts">
import type { AIProvider } from '../types'
import { getItem } from '../utils/storage'

const props = defineProps<{
  chat: ReturnType<typeof import('../stores/chat').useChat>
  useSettings: ReturnType<typeof import('../stores/settings').useSettings>
  activeAgent: import('../stores/agents').SubAgent | null
}>()

const emit = defineEmits<{
  start: []
  test: []
  openAgents: []
}>()

function handleStart() {
  emit('start')
}
</script>

<template>
  <div class="welcome">
    <div class="welcome-content">
      <div class="logo-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="var(--accent)" opacity="0.15" />
          <path d="M14 24a4 4 0 018 0v4a2 2 0 01-2 2h-2a4 4 0 01-4-4v-2z" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
          <path d="M34 24a4 4 0 00-8 0v4a2 2 0 002 2h2a4 4 0 004-4v-2z" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
          <path d="M16 20l16 8M32 20l-16 8" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
        </svg>
      </div>
      <h1>AI 工具箱</h1>
      <p class="welcome-desc">接入 DeepSeek / Gemini / Groq，智能路由自动切换</p>

      <div class="feature-list">
        <div class="feature-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
          <span>多服务智能路由，一个挂了自动切下一个</span>
        </div>
        <div class="feature-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 10h.01M6 14h.01" />
            <path d="M10 10h8" /><path d="M10 14h8" />
          </svg>
          <span>对话历史保存在本地，不上传任何服务器</span>
        </div>
        <div class="feature-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Markdown 渲染 + 代码高亮，编程好帮手</span>
        </div>
        <div class="feature-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>TRAE / Codespaces 双环境开发，手机也能写代码</span>
        </div>
      </div>

      <div class="actions">
        <button class="primary-btn" @click="handleStart">
          {{ activeAgent ? `以"${activeAgent.name}"身份开始` : '开始对话' }}
        </button>
        <button class="secondary-btn" @click="$emit('openAgents')">
          {{ activeAgent ? '切换子代理' : '选择子代理' }}
        </button>
        <button class="tertiary-btn" @click="$emit('test')">先测试连接</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.welcome-content {
  text-align: center;
  max-width: 340px;
}

.logo-icon { margin-bottom: 16px; }
h1 { font-size: 24px; font-weight: 700; margin: 0 0 6px 0; }
.welcome-desc { font-size: 14px; color: var(--text-secondary); margin: 0 0 24px 0; line-height: 1.5; }

.feature-list { text-align: left; display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
.feature-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
.feature-item svg { flex-shrink: 0; margin-top: 1px; }

.actions { display: flex; flex-direction: column; gap: 8px; }

.primary-btn {
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.primary-btn:active { opacity: 0.85; }

.secondary-btn {
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.secondary-btn:active { border-color: var(--accent); }

.tertiary-btn {
  padding: 10px 24px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 13px;
  cursor: pointer;
}
</style>
