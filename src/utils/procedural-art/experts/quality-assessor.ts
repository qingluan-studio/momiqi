import type { T6Assessment, ExpertOutputs, ExpertWeights } from '../experts/types'

export function assessQuality(
  outputs: ExpertOutputs,
  weights: ExpertWeights,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): T6Assessment {
  const c = assessCompositionBalance(outputs)
  const ch = assessColorHarmony(outputs)
  const t = assessTextureRichness(outputs)
  const l = assessLightingQuality(outputs)
  const s = assessStyleConsistency(outputs)
  const v = assessVariationUniqueness(ctx, w, h)

  const ws = weights.composition * 0.18 + weights.color * 0.22 + weights.texture * 0.17 + weights.lighting * 0.18 + weights.style * 0.15 + weights.detail * 0.10
  const overall = c * weights.composition + ch * weights.color + t * weights.texture + l * weights.lighting + s * weights.style + v * weights.detail

  const strengths: string[] = []
  const weaknesses: string[] = []
  const suggestions: string[] = []

  if (c >= 0.7) strengths.push('构图均衡，视觉引导自然')
  else { weaknesses.push('构图存在失衡'); suggestions.push('尝试调整焦点位置或地平线比例') }

  if (ch >= 0.7) strengths.push('色彩和谐，色调统一')
  else { weaknesses.push('色彩和谐度偏低'); suggestions.push('控制饱和度和对比度，使用互补/类似配色') }

  if (t >= 0.6) strengths.push('纹理质感丰富')
  else { weaknesses.push('纹理细节不足'); suggestions.push('增加纹理强度或笔触密度') }

  if (l >= 0.7) strengths.push('光照层次分明')
  else { weaknesses.push('光照平淡'); suggestions.push('增强定向光源或体积光效果') }

  if (s >= 0.7) strengths.push('风格表现一致')
  else { weaknesses.push('风格指标冲突'); suggestions.push('微调风格参数保持统一') }

  if (v >= 0.6) strengths.push('画面变化丰富有趣')
  else { weaknesses.push('画面变化度偏低'); suggestions.push('增加 variationFactor 或切换构图') }

  return {
    compositionBalance: c,
    colorHarmony: ch,
    textureRichness: t,
    lightingQuality: l,
    styleConsistency: s,
    variationUniqueness: v,
    overall: clamp(overall, 0, 1),
    strengths,
    weaknesses,
    suggestions,
  }
}

function assessCompositionBalance(o: ExpertOutputs): number {
  const { focalX, focalY, negativeSpace, elementSpacing } = o.composition
  let score = 0.8

  const centerDist = Math.sqrt((focalX - 0.5) ** 2 + (focalY - 0.45) ** 2)
  if (centerDist < 0.05) score -= 0.05
  else if (centerDist > 0.3) score -= 0.1

  if (negativeSpace < 0.1) score -= 0.1
  else if (negativeSpace > 0.45) score -= 0.05

  if (elementSpacing < 0.04 || elementSpacing > 0.18) score -= 0.05

  return clamp(score, 0, 1)
}

function assessColorHarmony(o: ExpertOutputs): number {
  const { saturationBias, harmoniousPalette } = o.color
  let score = 0.8

  if (harmoniousPalette === 'monochromatic') score += 0.05
  else if (harmoniousPalette === 'complementary') score += 0.1
  else if (harmoniousPalette === 'triadic') score += 0.1

  if (saturationBias < 0.2) score -= 0.05
  else if (saturationBias > 1.8) score -= 0.1

  return clamp(score, 0, 1)
}

function assessTextureRichness(o: ExpertOutputs): number {
  const { roughness, paperGrain, hatchDensity, textureType } = o.texture
  let score = 0.7

  if (textureType === 'sketch-line') score += 0.15
  else if (textureType === 'watercolor-bleed') score += 0.1
  else if (textureType === 'brush-stroke') score += 0.1

  score += roughness * 0.1 + paperGrain * 0.15 + hatchDensity * 0.1
  return clamp(score, 0, 1)
}

function assessLightingQuality(o: ExpertOutputs): number {
  const { ambientIntensity, directionalIntensity, volumetricLight, rimLightIntensity } = o.lighting
  let score = 0.7

  score += volumetricLight * 0.15 + rimLightIntensity * 0.1

  const ratio = directionalIntensity / Math.max(0.01, ambientIntensity)
  if (ratio > 0.5 && ratio < 2.5) score += 0.1
  if (ratio < 0.2) score -= 0.1

  return clamp(score, 0, 1)
}

function assessStyleConsistency(o: ExpertOutputs): number {
  const { shadingMode, outlineEnabled, textureStrength, glowMultiplier } = o.style
  let score = 0.75

  const conflicts: number = [
    outlineEnabled && textureStrength > 0.5,
    shadingMode === 'cel' && textureStrength > 0.3,
    glowMultiplier > 1.8 && textureStrength > 0.4,
    outlineEnabled && shadingMode === 'soft',
  ].filter(Boolean).length

  score -= conflicts * 0.15
  return clamp(score, 0, 1)
}

function assessVariationUniqueness(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  try {
    const sampleSize = 50
    const stepX = Math.floor(w / sampleSize)
    const stepY = Math.floor(h / sampleSize)
    let hist = 0

    for (let sy = 0; sy < sampleSize; sy++) {
      for (let sx = 0; sx < sampleSize; sx++) {
        const px = Math.min(w - 1, sx * stepX)
        const py = Math.min(h - 1, sy * stepY)
        const idx = (py * w + px) * 4
        hist += Math.abs(idx % 255)
      }
    }

    const entropy = Math.min(1, hist / (sampleSize * sampleSize * 255)) * 0.5 + 0.3
    return clamp(entropy, 0, 1)
  } catch {
    return 0.5
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
