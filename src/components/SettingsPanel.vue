<script setup lang="ts">
import { ref } from 'vue'
import type { AIProvider } from '../types'
import { testProvider } from '../api/router'

const props = defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const emit = defineEmits<{
  close: []
}>()

const testing = ref<AIProvider | null>(null)
const testStatus = ref<'idle' | 'testing' | 'success' | 'fail'>('idle')

const providers: { key: AIProvider; label: string; desc: string }[] = [
  { key: 'deepseek', label: 'DeepSeek', desc: '高性价比，中文能力优秀，注册即送 500 万 Tokens' },
  { key: 'gemini', label: 'Gemini', desc: '多模态、长上下文，免费 Tier 15 RPM' },
  { key: 'groq', label: 'Groq', desc: '极速推理，免费 Tier，支持 Llama/Mixtral' },
]

async function handleTest(provider: AIProvider) {
  const apiKey = props.settings.settings.providers[provider].apiKey
  if (!apiKey) return

  testing.value = provider
  testStatus.value = 'testing'

  const ok = await testProvider(provider, apiKey)
  testStatus.value = ok ? 'success' : 'fail'
  setTimeout(() => { testStatus.value = 'idle'; testing.value = null }, 2000)
}

function handleToggle(provider: AIProvider, enabled: boolean) {
  props.settings.setProviderEnabled(provider, enabled)
}

function handleApiKey(provider: AIProvider, key: string) {
  props.settings.setProviderApiKey(provider, key)
}
</script>

<template>
  <div class="settings-overlay" @click.self="emit('close')">
    <div class="settings-panel">
      <div class="settings-header">
        <h2>API 设置</h2>
        <button class="close-btn" @click="emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p class="settings-desc">配置 AI 服务 API Key。优先使用列表靠上的服务。</p>

      <div class="provider-list">
        <div
          v-for="p in providers"
          :key="p.key"
          class="provider-item"
          :class="{ enabled: settings.settings.providers[p.key].enabled }"
        >
          <div class="provider-top">
            <div class="provider-name-row">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  :checked="settings.settings.providers[p.key].enabled"
                  @change="(e: Event) => handleToggle(p.key, (e.target as HTMLInputElement).checked)"
                />
                <span class="toggle-slider" />
              </label>
              <span class="provider-name">{{ p.label }}</span>
            </div>
            <p class="provider-desc">{{ p.desc }}</p>
          </div>

          <div v-if="settings.settings.providers[p.key].enabled" class="provider-config">
            <input
              type="password"
              class="key-input"
              :value="settings.settings.providers[p.key].apiKey"
              :placeholder="`${p.label} API Key`"
              @input="(e: Event) => handleApiKey(p.key, (e.target as HTMLInputElement).value)"
            />
            <button
              class="test-btn"
              :disabled="testing === p.key && testStatus === 'testing'"
              @click="handleTest(p.key)"
            >
              <template v-if="testing === p.key && testStatus === 'testing'">测试中...</template>
              <template v-else-if="testing === p.key && testStatus === 'success'">通过</template>
              <template v-else-if="testing === p.key && testStatus === 'fail'">失败</template>
              <template v-else>测试连接</template>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <button class="save-btn" @click="emit('close')">完成</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  padding: 20px;
}

.settings-panel {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.settings-header h2 { margin: 0; font-size: 18px; }
.settings-desc { font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px; line-height: 1.5; }

.close-btn {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: transparent; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.provider-list { display: flex; flex-direction: column; gap: 12px; }

.provider-item {
  padding: 14px;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.provider-item.enabled {
  border-color: var(--accent);
}

.provider-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.toggle-label input {
  opacity: 0; width: 0; height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--bg-tertiary);
  border-radius: 22px;
  transition: background 0.2s;
  cursor: pointer;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 18px; height: 18px;
  left: 2px; top: 2px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-label input:checked + .toggle-slider {
  background: var(--accent);
}

.toggle-label input:checked + .toggle-slider::after {
  transform: translateX(18px);
}

.provider-name { font-size: 15px; font-weight: 600; }
.provider-desc { font-size: 12px; color: var(--text-tertiary); margin: 6px 0 0 0; line-height: 1.4; }

.provider-config {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  box-sizing: border-box;
  font-family: 'SF Mono', monospace;
}

.key-input:focus { outline: none; border-color: var(--accent); }
.key-input::placeholder { color: var(--text-tertiary); }

.test-btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.1s;
}

.test-btn:active { border-color: var(--accent); }
.test-btn:disabled { opacity: 0.5; }

.settings-footer {
  margin-top: 16px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
