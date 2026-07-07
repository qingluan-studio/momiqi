<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { chatWithFallback } from '../api/router'
import type { AIProvider } from '../types'

const emit = defineEmits<{
  close: []
}>()

const testInput = ref('')
const testResult = ref('')
const testLoading = ref(false)
const testError = ref('')

async function runTest() {
  const text = testInput.value.trim()
  if (!text) return
  testLoading.value = true
  testResult.value = ''
  testError.value = ''

  try {
    const messages = [{ role: 'user' as const, content: text }]
    const result = await chatWithFallback(messages)
    testResult.value = result.content
    testError.value = ''
  } catch (err: any) {
    testError.value = err.message || '测试失败'
  } finally {
    testLoading.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div class="test-panel" @click.self="emit('close')">
    <div class="test-dialog">
      <div class="test-header">
        <h2>连接测试</h2>
        <button class="close-btn" @click="emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <p class="test-desc">发送一条消息测试当前配置的 AI 服务是否可用</p>
      <textarea
        v-model="testInput"
        class="test-input"
        placeholder="输入测试消息..."
        rows="2"
      />
      <button class="test-btn" :disabled="!testInput.trim() || testLoading" @click="runTest">
        {{ testLoading ? '测试中...' : '发送测试' }}
      </button>
      <div v-if="testResult" class="test-result">{{ testResult }}</div>
      <div v-if="testError" class="test-error">{{ testError }}</div>
    </div>
  </div>
</template>

<style scoped>
.test-panel {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 20px;
}

.test-dialog {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.test-header h2 { margin: 0; font-size: 18px; }
.test-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
.close-btn { width: 32px; height: 32px; border: none; border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }

.test-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.test-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.test-btn:disabled { opacity: 0.5; }

.test-result {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.test-error {
  margin-top: 12px;
  padding: 10px;
  background: rgba(239,68,68,0.1);
  border-radius: 10px;
  color: #ef4444;
  font-size: 13px;
}
</style>
