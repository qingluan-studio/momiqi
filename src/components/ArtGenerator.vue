<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { renderSceneWithParams, parsePrompt, getSceneList, getStyleList } from '../utils/procedural-art'
import type { SceneParams, SceneType, ArtStyle } from '../utils/procedural-art'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const prompt = ref('')
const generating = ref(false)
const sceneType = ref<SceneType>('cloud-sea-mountains')
const timeOfDay = ref('noon')
const style = ref<ArtStyle>('fantasy')
const qiDensity = ref(0.4)
const atmosphere = ref(0.3)
const variationFactor = ref(0.4)
const seed = ref(Math.floor(Math.random() * 999999))
const showAdvanced = ref(false)

const scenes = getSceneList()
const styles = getStyleList()

const timeOptions = [
  { value: 'dawn', label: '黎明' },
  { value: 'morning', label: '早晨' },
  { value: 'noon', label: '正午' },
  { value: 'dusk', label: '黄昏' },
  { value: 'night', label: '夜晚' },
  { value: 'midnight', label: '深夜' },
]

const presetPrompts = [
  '仙山云海，清晨，灵气充沛，二次元，飘渺',
  '星辰天穹，深夜，璀璨银河，幻想',
  '灵泉幽谷，清晨，瀑布飞流，水墨',
  '剑气纵横，黄昏，剑意滔天，二次元',
  '九霄云殿，正午，金光璀璨，华丽，幻想',
  '雷劫降临，深夜，天雷滚滚，水墨',
  '洞府秘境，黑暗，晶石闪烁，写实',
  '丹炉炼火，黑暗，紫气升腾，水彩',
  '花海仙境，早晨，樱花烂漫，二次元',
  '古剑遗迹，黄昏，荒凉战场，写实',
]

function generate() {
  const w = Math.min(window.innerWidth * 0.95, 1024)
  const h = Math.min(window.innerHeight * 0.5, 768)

  const params: SceneParams = {
    sceneType: sceneType.value,
    timeOfDay: timeOfDay.value as any,
    style: style.value,
    seed: seed.value,
    width: w,
    height: h,
    variationFactor: variationFactor.value,
    atmosphere: atmosphere.value,
    qiDensity: qiDensity.value,
    hueShift: 0,
    keywords: [],
  }

  if (prompt.value.trim()) {
    const parsed = parsePrompt(prompt.value.trim(), w, h)
    params.sceneType = parsed.sceneType
    params.timeOfDay = parsed.timeOfDay
    params.style = parsed.style
    params.atmosphere = parsed.atmosphere
    params.qiDensity = parsed.qiDensity
    params.seed = parsed.seed
    params.keywords = parsed.keywords
  }

  generating.value = true

  nextTick(() => {
    const canvas = canvasRef.value
    if (!canvas) { generating.value = false; return }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) { generating.value = false; return }

    renderSceneWithParams(ctx, params)
    generating.value = false
  })
}

function applyPreset(text: string) {
  prompt.value = text
  const parsed = parsePrompt(text.trim())
  sceneType.value = parsed.sceneType
  timeOfDay.value = parsed.timeOfDay
  style.value = parsed.style
  atmosphere.value = parsed.atmosphere
  qiDensity.value = parsed.qiDensity
  generate()
}

function randomize() {
  seed.value = Math.floor(Math.random() * 999999)
  const randomScene = scenes[Math.floor(Math.random() * scenes.length)]
  const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)]
  const randomStyle = styles[Math.floor(Math.random() * styles.length)]
  sceneType.value = randomScene.type
  timeOfDay.value = randomTime.value
  style.value = randomStyle.value
  qiDensity.value = 0.2 + Math.random() * 0.8
  atmosphere.value = 0.1 + Math.random() * 0.7
  variationFactor.value = 0.2 + Math.random() * 0.6
  generate()
}

function downloadPNG() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `xiuxian-scene-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(() => {
  nextTick(() => generate())
})

watch(sceneType, () => generate())
watch(timeOfDay, () => generate())
watch(style, () => generate())
watch(seed, () => generate())
watch(qiDensity, () => generate())
watch(atmosphere, () => generate())
watch(variationFactor, () => generate())

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && prompt.value.trim()) {
    const parsed = parsePrompt(prompt.value.trim())
    sceneType.value = parsed.sceneType
    timeOfDay.value = parsed.timeOfDay
    style.value = parsed.style
    atmosphere.value = parsed.atmosphere
    qiDensity.value = parsed.qiDensity
    generate()
  }
}
</script>

<template>
  <div class="art-generator">
    <div class="input-area">
      <div class="prompt-row">
        <input
          v-model="prompt"
          class="prompt-input"
          placeholder="描述修仙场景 + 风格，如：仙山云海，清晨，二次元..."
          @keydown="handleKeydown"
        />
        <button class="generate-btn" :disabled="generating" @click="generate">
          <svg v-if="!generating" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5,3 19,12 5,21 5,3" />
          </svg>
          <span v-else class="spinner"></span>
        </button>
      </div>

      <div class="preset-chips">
        <button
          v-for="(preset, idx) in presetPrompts"
          :key="idx"
          class="preset-chip"
          @click="applyPreset(preset)"
        >
          {{ preset.split('，')[0] }}
        </button>
      </div>
    </div>

    <div class="scene-selector">
      <button
        v-for="scene in scenes"
        :key="scene.type"
        class="scene-btn"
        :class="{ active: sceneType === scene.type }"
        @click="sceneType = scene.type"
      >
        {{ scene.name }}
      </button>
    </div>

    <div class="style-selector">
      <button
        v-for="s in styles"
        :key="s.value"
        class="style-btn"
        :class="{ active: style === s.value }"
        :title="s.desc"
        @click="style = s.value"
      >
        <span class="style-indicator" :class="s.value"></span>
        {{ s.label }}
      </button>
    </div>

    <div class="canvas-wrapper" :class="{ loading: generating }">
      <canvas ref="canvasRef" class="scene-canvas"></canvas>
      <div v-if="generating" class="loading-overlay">
        <span class="loading-text">渲染中...</span>
      </div>
    </div>

    <div class="controls">
      <button class="ctrl-btn" @click="randomize">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.5 21a9 9 0 003.1-17.5L1 10" />
        </svg>
        随机生成
      </button>
      <button class="ctrl-btn" @click="downloadPNG">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        下载 PNG
      </button>
      <button class="ctrl-btn" @click="showAdvanced = !showAdvanced">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
        参数调节
      </button>
    </div>

    <div v-if="showAdvanced" class="advanced-panel">
      <div class="param-row">
        <label>时间段</label>
        <select v-model="timeOfDay" class="param-select">
          <option v-for="t in timeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
      <div class="param-row">
        <label>灵气密度 {{ Math.round(qiDensity * 100) }}%</label>
        <input v-model.number="qiDensity" type="range" min="0" max="1" step="0.05" class="param-slider" />
      </div>
      <div class="param-row">
        <label>雾气浓度 {{ Math.round(atmosphere * 100) }}%</label>
        <input v-model.number="atmosphere" type="range" min="0" max="1" step="0.05" class="param-slider" />
      </div>
      <div class="param-row">
        <label>变化因子 {{ Math.round(variationFactor * 100) }}%</label>
        <input v-model.number="variationFactor" type="range" min="0" max="1" step="0.05" class="param-slider" />
      </div>
      <div class="param-row">
        <label>随机种子: {{ seed }}</label>
        <input v-model.number="seed" type="number" class="param-input" />
      </div>
    </div>

    <div class="info-banner">
      纯前端程序化生成，零 API 调用，零 token 消耗。5 种风格可选，基于数学噪声算法实时渲染修仙场景。
    </div>
  </div>
</template>

<style scoped>
.art-generator {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  height: 100%;
  overflow-y: auto;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prompt-row {
  display: flex;
  gap: 6px;
}

.prompt-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.prompt-input:focus {
  border-color: var(--accent);
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.preset-chips {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}

.preset-chip {
  padding: 3px 10px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.preset-chip:active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.scene-selector {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.scene-btn {
  padding: 3px 10px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.scene-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.style-selector {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.style-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.style-btn.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.style-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.style-indicator.anime { background: linear-gradient(135deg, #ff6b9d, #7b68ee); }
.style-indicator.ink-wash { background: linear-gradient(135deg, #2d2d2d, #666); }
.style-indicator.realistic { background: linear-gradient(135deg, #4a90d9, #2d5f8e); }
.style-indicator.fantasy { background: linear-gradient(135deg, #e040fb, #ffc107); }
.style-indicator.watercolor { background: linear-gradient(135deg, #ff9a9e, #fad0c4); }

.canvas-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  min-height: 200px;
  background: #0a0a15;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-wrapper.loading {
  opacity: 0.7;
}

.scene-canvas {
  width: 100%;
  height: auto;
  display: block;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
}

.loading-text {
  color: #fff;
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.ctrl-btn:active {
  background: var(--bg-hover);
}

.advanced-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
}

.param-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-row label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 140px;
}

.param-slider {
  flex: 1;
  accent-color: var(--accent);
  height: 4px;
}

.param-select,
.param-input {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 12px;
  flex: 1;
  outline: none;
}

.info-banner {
  text-align: center;
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 6px 0;
  border-top: 1px solid var(--border-color);
}
</style>
