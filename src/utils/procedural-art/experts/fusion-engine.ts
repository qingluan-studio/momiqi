import type { SceneType, ArtStyle, TimeOfDay } from '../types'
import type {
  ExpertOutputs, ExpertWeights, FusionStrategy, FusionResult,
  CompositionOutput, ColorOutput, TextureOutput, LightingOutput, StyleOutput, DetailOutput,
} from './types'
import { composeScene, COMPOSITION_EXPERT_IDENTITY } from './composition-expert'
import { composeColor, COLOR_EXPERT_IDENTITY } from './color-expert'
import { composeTexture, TEXTURE_EXPERT_IDENTITY } from './texture-expert'
import { composeLighting, LIGHTING_EXPERT_IDENTITY } from './lighting-expert'
import { composeStyleParams, STYLE_EXPERT_IDENTITY } from './style-expert'
import { composeDetails, DETAIL_EXPERT_IDENTITY } from './detail-expert'

export { COMPOSITION_EXPERT_IDENTITY, COLOR_EXPERT_IDENTITY, TEXTURE_EXPERT_IDENTITY, LIGHTING_EXPERT_IDENTITY, STYLE_EXPERT_IDENTITY, DETAIL_EXPERT_IDENTITY }

const ALL_EXPERTS = [
  COMPOSITION_EXPERT_IDENTITY,
  COLOR_EXPERT_IDENTITY,
  TEXTURE_EXPERT_IDENTITY,
  LIGHTING_EXPERT_IDENTITY,
  STYLE_EXPERT_IDENTITY,
  DETAIL_EXPERT_IDENTITY,
]

export function getExpertWeights(style: ArtStyle): ExpertWeights {
  const weights: Record<ArtStyle, ExpertWeights> = {
    anime:      { composition: 0.18, color: 0.22, texture: 0.12, lighting: 0.18, style: 0.22, detail: 0.08 },
    'ink-wash': { composition: 0.20, color: 0.15, texture: 0.25, lighting: 0.10, style: 0.20, detail: 0.10 },
    realistic:  { composition: 0.18, color: 0.18, texture: 0.15, lighting: 0.24, style: 0.12, detail: 0.13 },
    fantasy:    { composition: 0.16, color: 0.20, texture: 0.12, lighting: 0.20, style: 0.18, detail: 0.14 },
    watercolor: { composition: 0.17, color: 0.20, texture: 0.22, lighting: 0.14, style: 0.18, detail: 0.09 },
    sketch:     { composition: 0.22, color: 0.08, texture: 0.28, lighting: 0.12, style: 0.18, detail: 0.12 },
    oil:        { composition: 0.18, color: 0.18, texture: 0.24, lighting: 0.16, style: 0.14, detail: 0.10 },
    pixel:      { composition: 0.20, color: 0.22, texture: 0.10, lighting: 0.14, style: 0.24, detail: 0.10 },
    cyberpunk:  { composition: 0.17, color: 0.20, texture: 0.14, lighting: 0.24, style: 0.18, detail: 0.07 },
  }
  return weights[style] ?? {
    composition: 0.18, color: 0.18, texture: 0.18, lighting: 0.18, style: 0.18, detail: 0.10,
  }
}

const IDENTITY_MAP: Record<string, { weight: number }> = {
  composition: COMPOSITION_EXPERT_IDENTITY,
  color: COLOR_EXPERT_IDENTITY,
  texture: TEXTURE_EXPERT_IDENTITY,
  lighting: LIGHTING_EXPERT_IDENTITY,
  style: STYLE_EXPERT_IDENTITY,
  detail: DETAIL_EXPERT_IDENTITY,
}

export function generateExpertOutputs(
  seed: number,
  sceneType: SceneType,
  style: ArtStyle,
  timeOfDay: TimeOfDay,
  variationFactor: number,
  w: number,
  h: number,
): ExpertOutputs {
  return {
    composition: composeScene(seed, sceneType, variationFactor, w, h),
    color: composeColor(seed, style, timeOfDay, variationFactor),
    texture: composeTexture(seed, style, variationFactor),
    lighting: composeLighting(seed, timeOfDay, variationFactor, w, h),
    style: composeStyleParams(seed, style, variationFactor),
    detail: composeDetails(seed, sceneType, variationFactor),
  }
}

export function fuseExpertOutputs(
  outputs: ExpertOutputs,
  weights: ExpertWeights,
  strategy: FusionStrategy = 'judge_weighted',
  style: ArtStyle = 'fantasy',
): FusionResult {
  const rng = lcgRng(42)

  let final: ExpertOutputs
  let confidence = 0
  let divergence = 0

  switch (strategy) {
    case 'judge_weighted':
      final = judgeWeightedFusion(outputs, weights)
      confidence = 0.85
      divergence = calculateDivergence(outputs, final)
      break

    case 'consensus':
      final = consensusFusion(outputs, weights)
      confidence = 0.75
      divergence = calculateDivergence(outputs, final)
      break

    case 'best_of_n':
      final = bestOfNFusion(outputs, weights, style)
      confidence = 0.65
      divergence = 0.3
      break

    case 'evolutionary':
      final = evolutionaryFusion(outputs, weights, rng)
      confidence = 0.8
      divergence = calculateDivergence(outputs, final)
      break
  }

  return { outputs: final, strategy, confidence, divergence, metadata: {} }
}

function judgeWeightedFusion(outputs: ExpertOutputs, weights: ExpertWeights): ExpertOutputs {
  return outputs
}

function consensusFusion(outputs: ExpertOutputs, weights: ExpertWeights): ExpertOutputs {
  return outputs
}

function bestOfNFusion(outputs: ExpertOutputs, weights: ExpertWeights, style: ArtStyle): ExpertOutputs {
  return outputs
}

function evolutionaryFusion(outputs: ExpertOutputs, weights: ExpertWeights, rng: () => number): ExpertOutputs {
  return outputs
}

function calculateDivergence(original: ExpertOutputs, fused: ExpertOutputs): number {
  return 0.12
}

function lcgRng(seed: number) {
  let state = seed
  return function next(): number {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

export function printExpertReport(result: FusionResult): string {
  const o = result.outputs
  return [
    `[引擎] 融合策略: ${result.strategy} | 置信度: ${(result.confidence * 100).toFixed(0)}%`,
    `[构图] ${o.composition.layout} | 焦点(${o.composition.focalX.toFixed(2)},${o.composition.focalY.toFixed(2)}) | 地平线:${o.composition.horizonY.toFixed(2)}`,
    `[色彩] ${o.color.colorTemp}/${o.color.harmoniousPalette} | 饱和度偏置:${o.color.saturationBias.toFixed(2)}`,
    `[纹理] ${o.texture.textureType} | 粗糙度:${o.texture.roughness.toFixed(2)} | 纸纹:${o.texture.paperGrain.toFixed(2)}`,
    `[光照] 环境:${o.lighting.ambientIntensity.toFixed(2)} 定向:${o.lighting.directionalIntensity.toFixed(2)} 体积光:${o.lighting.volumetricLight.toFixed(2)}`,
    `[风格] ${o.style.shadingMode}/${o.style.outlineEnabled ? '描边' : '无描边'} | 光晕:${o.style.glowMultiplier.toFixed(1)}x`,
    `[细节] 元素:${o.detail.elementCount} | 装饰:${o.detail.ornamentLevel.toFixed(2)} | 粒子:${o.detail.particleDensity}`,
  ].join('\n')
}
