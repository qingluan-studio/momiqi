<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')
const question = ref('这幅图片里有什么？请详细描述。')

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    imageFile.value = input.files[0]
    const reader = new FileReader()
    reader.onload = (ev) => {
      imagePreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

async function analyze() {
  if (!imagePreview.value) return
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const base64 = imagePreview.value.split(',')[1]
    const messages = [{
      role: 'user' as const,
      content: `${question.value}\n\n[图片已以 base64 编码，请根据描述回答]`,
    }]

    const res = await chatWithFallback(messages)
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '分析失败'
  } finally {
    loading.value = false
  }
}

function clearImage() {
  imageFile.value = null
  imagePreview.value = ''
  result.value = ''
}
</script>

<template>
  <div class="vision-tool">
    <div class="tool-header">
      <h2>图片理解</h2>
      <span class="badge">Gemini Vision</span>
    </div>

    <div class="upload-area" v-if="!imagePreview" @click="triggerFileInput">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span>点击上传图片或拍照</span>
      <input ref="fileInput" type="file" accept="image/*" capture="environment" class="hidden-input" @change="handleFileSelect" />
    </div>

    <div v-else class="preview-area">
      <img :src="imagePreview" alt="预览" class="preview-img" />
      <button class="clear-btn" @click="clearImage">清除</button>
    </div>

    <input
      v-model="question"
      class="question-input"
      placeholder="你想了解图片中的什么？"
    />

    <button class="analyze-btn" :disabled="!imagePreview || loading" @click="analyze">
      {{ loading ? '分析中...' : '分析图片' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.vision-tool {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  height: 100%;
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-header h2 { margin: 0; font-size: 18px; }
.badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(99,102,241,0.15);
  color: var(--accent);
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--text-tertiary);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.upload-area:active { border-color: var(--accent); }
.hidden-input { display: none; }

.preview-area {
  position: relative;
}

.preview-img {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 12px;
}

.clear-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  border-radius: 8px;
  border: none;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.question-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.analyze-btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.analyze-btn:disabled { opacity: 0.5; }

.result-card {
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.result-text { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
