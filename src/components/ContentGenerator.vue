<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'
import type { AppSettings } from '../types'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const platform = ref('xiaohongshu')
const topic = ref('')
const tone = ref('casual')
const result = ref('')
const loading = ref(false)
const error = ref('')

const platforms = [
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'wechat', label: '公众号' },
  { value: 'weibo', label: '微博' },
  { value: 'douyin', label: '抖音文案' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
]

const tones = [
  { value: 'casual', label: '轻松口语' },
  { value: 'professional', label: '专业正式' },
  { value: 'humorous', label: '幽默风趣' },
  { value: 'emotional', label: '情感共鸣' },
]

const platformRules: Record<string, string> = {
  xiaohongshu: '小红书风格：带emoji、口语化、分点、加话题标签、字数200-500',
  wechat: '公众号风格：深度长文、标题党、分段、引导关注、字数500-1000',
  weibo: '微博风格：短小精悍、带超话、互动性强、字数140以内',
  douyin: '抖音风格：抓眼球开头、口语化、带热点话题、简短有力',
  twitter: 'Twitter style: concise, engaging, with hashtags, under 280 chars',
  linkedin: 'LinkedIn style: professional, insightful, industry-focused, 300-800 chars',
}

async function generate() {
  const t = topic.value.trim()
  if (!t) return

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const prompt = `你是一个资深社交媒体运营专家。请为主题"${t}"生成${platforms.find(p=>p.value===platform.value)?.label}平台的营销文案。

风格: ${tones.find(x=>x.value===tone.value)?.label}
要求: ${platformRules[platform.value]}

请输出完整可发布的文案，如果需要配图说明也请注明。`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    result.value = res.content
  } catch (err: any) {
    error.value = err.message || '生成失败'
  } finally {
    loading.value = false
  }
}

function copyText() {
  navigator.clipboard.writeText(result.value).catch(() => {})
}

const quickTopics = ['新品发布', '行业趋势分析', '用户使用技巧', '品牌故事', '节日促销', '用户好评分享']
</script>

<template>
  <div class="content-gen">
    <div class="platform-select">
      <span class="sec-label">平台</span>
      <div class="chip-row">
        <button
          v-for="p in platforms"
          :key="p.value"
          :class="{ active: platform === p.value }"
          @click="platform = p.value"
        >{{ p.label }}</button>
      </div>
    </div>

    <div class="tone-select">
      <span class="sec-label">风格</span>
      <div class="chip-row">
        <button
          v-for="x in tones"
          :key="x.value"
          :class="{ active: tone === x.value }"
          @click="tone = x.value"
        >{{ x.label }}</button>
      </div>
    </div>

    <textarea
      v-model="topic"
      class="topic-input"
      placeholder="输入话题或主题，例如：AI编程助手发布、夏日护肤小技巧..."
      rows="3"
    />

    <div class="quick-topics">
      <button v-for="q in quickTopics" :key="q" @click="topic = q" class="topic-chip">{{ q }}</button>
    </div>

    <button class="gen-btn" :disabled="!topic.trim() || loading" @click="generate">
      {{ loading ? '生成中...' : '生成文案' }}
    </button>

    <div v-if="result" class="result-card">
      <div class="result-text" v-text="result" />
      <button class="copy-btn" @click="copyText">复制文案</button>
    </div>
    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.content-gen {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  height: 100%;
}

.sec-label { font-size: 12px; color: var(--text-tertiary); margin-bottom: 6px; display: block; }

.chip-row { display: flex; flex-wrap: wrap; gap: 6px; }

.chip-row button {
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.1s;
}

.chip-row button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.topic-input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.quick-topics { display: flex; flex-wrap: wrap; gap: 5px; }

.topic-chip {
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.topic-chip:active { border-color: var(--accent); }

.gen-btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.gen-btn:disabled { opacity: 0.5; }

.result-card {
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.result-text { font-size: 13px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 10px; }

.copy-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
