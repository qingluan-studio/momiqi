<script setup lang="ts">
import { computed } from 'vue'
import { getItem } from '../utils/storage'
import type { AIProvider, ProviderConfig } from '../types'
import { useAgentStore, type SubAgent } from '../stores/agents'
import { useEvolution } from '../stores/evolution'

defineProps<{
  activeAgent: SubAgent | null
  activeTab: string
  show: boolean
}>()

defineEmits<{
  close: []
}>()

const providerNames: Record<AIProvider, string> = {
  deepseek: 'DeepSeek', gemini: 'Gemini', groq: 'Groq', kimi: 'Kimi',
}

const agentStore = useAgentStore()
const evolution = useEvolution()
const settings = getItem<ProviderConfig>('settings', {} as ProviderConfig)
const activeProvider = getItem<AIProvider>('activeProvider', 'deepseek')

const enabledProviders = computed(() =>
  (Object.entries(settings) as [AIProvider, { enabled: boolean; models: string[] }][])
    .filter(([, v]) => v.enabled)
    .map(([k, v]) => ({ key: k, label: providerNames[k], model: v.models?.[0] || '' }))
)

const currentModel = computed(() => settings[activeProvider]?.models?.[0] || '')
</script>

<template>
  <Transition name="aci-slide">
    <div v-if="show" class="aci-overlay" @click.self="$emit('close')">
      <div class="aci-panel">
        <div class="aci-header">
          <h2>ACI 控制面板</h2>
          <button class="close-btn" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="aci-sections">
          <div class="aci-section">
            <div class="aci-label">当前页面</div>
            <div class="aci-value">{{ { chat: 'AI 对话', vision: '图片理解', code: '代码生成', tools: '工具箱', knowledge: '知识库' }[activeTab] }}</div>
          </div>

          <div class="aci-section">
            <div class="aci-label">激活模型提供方</div>
            <div class="aci-value">{{ providerNames[activeProvider] }} / {{ currentModel }}</div>
          </div>

          <div class="aci-section">
            <div class="aci-label">已启用 API</div>
            <div class="aci-tags">
              <span v-for="p in enabledProviders" :key="p.key" class="aci-tag">{{ p.label }}</span>
              <span v-if="enabledProviders.length === 0" class="aci-empty">无</span>
            </div>
          </div>

          <div class="aci-section">
            <div class="aci-label">当前子代理</div>
            <div class="aci-value">{{ activeAgent ? activeAgent.name : '默认 (无代理)' }}</div>
          </div>

          <div v-if="activeAgent" class="aci-section">
            <div class="aci-label">System Prompt</div>
            <div class="aci-prompt">{{ activeAgent.systemPrompt }}</div>
          </div>

          <div class="aci-section">
            <div class="aci-label">可用子代理 ({{ agentStore.agents.length }})</div>
            <div class="aci-tags">
              <span v-for="a in agentStore.agents" :key="a.id" class="aci-tag dim">{{ a.name }}</span>
            </div>
          </div>

          <div class="aci-section evo-section">
            <div class="aci-label">AI 进化等级</div>
            <div class="evo-stage-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
                <path :d="evolution.stageIcons[evolution.state.stage]" />
              </svg>
              <span class="evo-stage-label">{{ evolution.getStageInfo().label }}</span>
            </div>
            <div class="evo-bar-wrap">
              <div class="evo-bar-track">
                <div class="evo-bar-fill" :style="{ width: evolution.getStageInfo().progress + '%' }" />
              </div>
              <span class="evo-bar-text">{{ evolution.getStageInfo().progress }}%</span>
            </div>
            <div class="evo-stats">
              <span>累计 {{ evolution.state.totalTokens }} tokens</span>
              <span>下一级: {{ evolution.getStageInfo().nextLabel }}</span>
            </div>
          </div>

          <div class="aci-section">
            <div class="aci-label">工具集 (12 项)</div>
            <div class="aci-tags">
              <span class="aci-tag dim">Prompt</span><span class="aci-tag dim">摘要</span>
              <span class="aci-tag dim">文案</span><span class="aci-tag dim">正则</span>
              <span class="aci-tag dim">SQL</span><span class="aci-tag dim">命名</span>
              <span class="aci-tag dim">Commit</span><span class="aci-tag dim">搜索</span>
              <span class="aci-tag dim">翻译</span><span class="aci-tag dim">文件</span>
              <span class="aci-tag dim">多角度</span><span class="aci-tag dim">工作流</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.aci-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 20;
  display: flex; align-items: flex-end; justify-content: center;
}
.aci-panel {
  width: 100%; max-width: 500px; max-height: 80vh; overflow-y: auto;
  background: var(--bg-primary); border-radius: 20px 20px 0 0; padding: 20px;
}
.aci-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.aci-header h2 { margin: 0; font-size: 18px; }
.close-btn {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: transparent; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.aci-sections { display: flex; flex-direction: column; gap: 14px; }
.aci-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.aci-value { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.aci-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.aci-tag { padding: 3px 8px; border-radius: 6px; background: rgba(99,102,241,0.15); color: var(--accent); font-size: 11px; }
.aci-tag.dim { background: var(--bg-secondary); color: var(--text-tertiary); }
.aci-empty { font-size: 12px; color: var(--text-tertiary); }
.aci-prompt { font-size: 12px; color: var(--text-secondary); background: var(--bg-secondary); padding: 8px 10px; border-radius: 8px; line-height: 1.5; max-height: 100px; overflow: auto; }
.evo-section { padding: 12px; border-radius: 12px; background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.1); }
.evo-stage-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.evo-stage-label { font-size: 15px; font-weight: 700; color: var(--accent); }
.evo-bar-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.evo-bar-track { flex: 1; height: 6px; border-radius: 3px; background: var(--bg-tertiary); overflow: hidden; }
.evo-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--accent), #a855f7); transition: width 0.5s; }
.evo-bar-text { font-size: 11px; color: var(--text-tertiary); min-width: 32px; }
.evo-stats { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-tertiary); }
.aci-slide-enter-active, .aci-slide-leave-active { transition: transform 0.25s ease; }
.aci-slide-enter-from, .aci-slide-leave-to { transform: translateY(100%); }
</style>
