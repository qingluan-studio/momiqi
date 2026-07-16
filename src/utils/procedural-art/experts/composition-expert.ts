import { valueNoise2D, gradientNoise2D } from '../noise'
import type { SceneType } from '../types'
import type { ExpertIdentity, CompositionOutput } from './types'

export const COMPOSITION_EXPERT_IDENTITY: ExpertIdentity = {
  name: 'CompositionExpert',
  weight: 0.20,
  description: '构图布局专家 — 黄金比例、三分法、视觉引导线、留白分配',
}

export function composeScene(
  seed: number,
  sceneType: SceneType,
  variationFactor: number,
  w: number,
  h: number,
): CompositionOutput {
  const rng = gaussianRng(seed)

  const layouts: CompositionOutput['layout'][] = [
    'golden-ratio', 'rule-of-thirds', 'centered', 'diagonal', 'asymmetric',
  ]

  const layoutWeights: Record<SceneType, number[]> = {
    'cloud-sea-mountains': [4, 3, 1, 1, 1],
    'starry-dome': [3, 2, 4, 1, 1],
    'spirit-spring': [2, 3, 3, 1, 1],
    'sword-qi': [1, 2, 2, 4, 2],
    'cloud-palace': [3, 3, 3, 1, 1],
    'lightning-tribulation': [2, 2, 3, 2, 2],
    'mystic-cave': [1, 2, 4, 1, 1],
    'alchemy-furnace': [1, 1, 4, 2, 1],
    'flower-fairyland': [3, 3, 2, 1, 2],
    'ancient-sword': [2, 2, 3, 1, 3],
  }

  const weights = layoutWeights[sceneType] ?? [2, 2, 2, 2, 2]
  const totalW = weights.reduce((s, v) => s + v, 0)
  let roll = rng.next() * totalW * (1 + variationFactor * 0.3)
  let layoutIdx = 0
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]
    if (roll <= 0) { layoutIdx = i; break }
    layoutIdx = i
  }

  let focalX = 0.5
  let focalY = 0.45
  let horizonY = 0.55
  let cameraZoom = 1.0
  let cameraRotation = 0
  let cameraOffsetX = 0
  let cameraOffsetY = 0
  let negativeSpace = 0.3
  let elementSpacing = 0.12

  switch (layouts[layoutIdx]) {
    case 'golden-ratio':
      focalX = 0.618 + (rng.next() - 0.5) * 0.1 * variationFactor
      focalY = 0.382 + (rng.next() - 0.5) * 0.08 * variationFactor
      horizonY = 0.618 + (rng.next() - 0.5) * 0.08 * variationFactor
      negativeSpace = 0.25 + rng.next() * 0.15
      elementSpacing = 0.1 + rng.next() * 0.05
      break
    case 'rule-of-thirds':
      const third = Math.floor(rng.next() * 3)
      const thirdV = Math.floor(rng.next() * 3)
      focalX = (third + 1) / 3 + (rng.next() - 0.5) * 0.08 * variationFactor
      focalY = (thirdV + 1) / 3 + (rng.next() - 0.5) * 0.06 * variationFactor
      horizonY = 1 / 3 + (rng.next() - 0.5) * 0.08 * variationFactor
      negativeSpace = 0.2 + rng.next() * 0.15
      elementSpacing = 0.08 + rng.next() * 0.04
      break
    case 'centered':
      focalX = 0.5 + (rng.next() - 0.5) * 0.05 * variationFactor
      focalY = 0.45 + (rng.next() - 0.5) * 0.05 * variationFactor
      horizonY = 0.5
      negativeSpace = 0.15 + rng.next() * 0.1
      elementSpacing = 0.06 + rng.next() * 0.03
      cameraZoom = 1.0 - rng.next() * 0.08 * variationFactor
      break
    case 'diagonal':
      focalX = 0.3 + (rng.next() - 0.5) * 0.15 * variationFactor
      focalY = 0.7 + (rng.next() - 0.5) * 0.1 * variationFactor
      cameraRotation = (rng.next() - 0.5) * 15 * variationFactor * (Math.PI / 180)
      negativeSpace = 0.3 + rng.next() * 0.15
      elementSpacing = 0.1 + rng.next() * 0.06
      break
    case 'asymmetric':
      focalX = 0.25 + rng.next() * 0.5
      focalY = 0.3 + rng.next() * 0.4
      horizonY = 0.4 + rng.next() * 0.3
      cameraOffsetX = (rng.next() - 0.5) * 0.12 * variationFactor
      cameraOffsetY = (rng.next() - 0.5) * 0.08 * variationFactor
      negativeSpace = 0.35 + rng.next() * 0.2
      elementSpacing = 0.12 + rng.next() * 0.08
      break
  }

  cameraZoom += (rng.next() - 0.5) * 0.1 * variationFactor
  cameraOffsetX += (rng.next() - 0.5) * 0.06 * variationFactor
  cameraOffsetY += (rng.next() - 0.5) * 0.04 * variationFactor

  return {
    focalX, focalY, horizonY,
    layout: layouts[layoutIdx],
    cameraZoom, cameraRotation, cameraOffsetX, cameraOffsetY,
    negativeSpace: Math.max(0.1, Math.min(0.5, negativeSpace)),
    elementSpacing: Math.max(0.03, Math.min(0.2, elementSpacing)),
  }
}

/** 确定性高斯分布随机数生成器 */
function gaussianRng(seed: number) {
  let state = seed
  let hasSpare = false
  let spare = 0

  function next(): number {
    if (hasSpare) { hasSpare = false; return spare }
    let u: number, v: number, s: number
    do {
      state = (state * 1103515245 + 12345) & 0x7fffffff
      u = state / 0x7fffffff * 2 - 1
      state = (state * 1103515245 + 12345) & 0x7fffffff
      v = state / 0x7fffffff * 2 - 1
      s = u * u + v * v
    } while (s >= 1 || s === 0)
    const m = Math.sqrt(-2 * Math.log(s) / s)
    spare = v * m
    hasSpare = true
    return u * m
  }

  // Reset state to seed
  state = seed
  hasSpare = false
  spare = 0

  return { next }
}
