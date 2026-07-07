<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const goal = ref('')
const loading = ref(false)
const error = ref('')
const steps = ref<{ title: string; content: string }[]>([])
const currentStep = ref(-1)

async function execute() {
  if (!goal.value.trim()) return
  loading.value = true
  error.value = ''
  steps.value = []
  currentStep.value = -1

  try {
    const planPrompt = `你是一个任务分解专家。请将以下目标分解为3-5个可执行的步骤。每个步骤用 "## 步骤N: 步骤名" 开头，后面跟一行简要描述。

目标: ${goal.value}

请输出:
## 步骤1: [名称]
简要描述

## 步骤2: [名称]
简要描述
...`

    const planRes = await chatWithFallback([{ role: 'user', content: planPrompt }])
    const planSteps = planRes.content.split('## ').filter(s => s.trim())
      .map(s => {
        const lines = s.trim().split('\n')
        return { title: lines[0]?.trim() || '', content: lines.slice(1).join('\n').trim() }
      })
    steps.value = planSteps.slice(0, 5)

    for (let i = 0; i < steps.value.length; i++) {
      currentStep.value = i
      const step = steps.value[i]
      const execPrompt = `你正在执行一个多步骤任务中的第${i + 1}步。

总目标: ${goal.value}
当前步骤: ${step.title}
上下文:
${steps.value.slice(0, i).map(s => `- ${s.title}: ${s.content}`).join('\n')}

请详细执行当前步骤，给出具体输出或方案。`

      const execRes = await chatWithFallback([{ role: 'user', content: execPrompt }])
      steps.value[i].content = execRes.content
    }

    currentStep.value = -2
  } catch (err: any) {
    error.value = err.message || '执行失败'
  } finally {
    loading.value = false
  }
}

const examples = [
  '从零搭建一个 Vue3 + TypeScript 博客项目',
  '设计一个用户登录系统的完整方案',
  '分析并优化一个慢 SQL 查询',
]
</script>

<template>
  <div class="workflow-tool">
    <h3 class="sec-title">大模型工作流</h3>
    <p class="sec-desc">AI 自动分解任务 → 逐步执行 → 汇总输出</p>

    <textarea
      v-model="goal"
      class="goal-input"
      placeholder="描述你的目标任务..."
      rows="2"
    />

    <div class="example-list">
      <button v-for="e in examples" :key="e" @click="goal = e">{{ e }}</button>
    </div>

    <button class="run-btn" :disabled="!goal.trim() || loading" @click="execute">
      {{ loading ? '执行中...' : '启动工作流' }}
    </button>

    <div v-if="steps.length > 0" class="steps-view">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="step-card"
        :class="{ active: currentStep === i, done: currentStep < 0 || currentStep > i }"
      >
        <div class="step-header">
          <span class="step-num">{{ i + 1 }}</span>
          <span class="step-title">{{ step.title }}</span>
          <span class="step-status">
            {{ currentStep === i ? '执行中...' : currentStep < 0 || currentStep > i ? '完成' : '等待' }}
          </span>
        </div>
        <div v-if="currentStep < 0 || currentStep > i" class="step-body">{{ step.content }}</div>
      </div>
    </div>

    <div v-if="error" class="error-card">{{ error }}</div>
  </div>
</template>

<style scoped>
.workflow-tool { padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; height: 100%; }
.sec-title { margin: 0; font-size: 16px; }
.sec-desc { margin: 0; font-size: 12px; color: var(--text-tertiary); }
.goal-input {
  width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-primary); font-size: 13px;
  resize: vertical; box-sizing: border-box; line-height: 1.6;
}
.example-list { display: flex; flex-wrap: wrap; gap: 5px; }
.example-list button {
  padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border-color);
  background: transparent; color: var(--text-tertiary); font-size: 11px; cursor: pointer;
}
.example-list button:active { border-color: var(--accent); }
.run-btn {
  padding: 12px; border-radius: 10px; border: none;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
}
.run-btn:disabled { opacity: 0.5; }
.steps-view { display: flex; flex-direction: column; gap: 8px; }
.step-card {
  padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}
.step-card.active { border-color: var(--accent); background: rgba(99,102,241,0.05); }
.step-card.done { opacity: 0.7; }
.step-header { display: flex; align-items: center; gap: 8px; }
.step-num {
  width: 22px; height: 22px; border-radius: 50%; background: var(--bg-tertiary);
  color: var(--text-secondary); font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.step-card.active .step-num { background: var(--accent); color: #fff; }
.step-card.done .step-num { background: #22c55e; color: #fff; }
.step-title { font-size: 13px; font-weight: 600; flex: 1; }
.step-status { font-size: 11px; color: var(--text-tertiary); }
.step-body { margin-top: 8px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; color: var(--text-secondary); }
.error-card { padding: 10px; background: rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; font-size: 13px; }
</style>
