import type { ArtStyle } from '../types'
import type { ExpertIdentity, StyleOutput } from './types'

export const STYLE_EXPERT_IDENTITY: ExpertIdentity = {
  name: 'StyleExpert',
  weight: 0.15,
  description: '风格控制专家 — 描边、色块化、光晕、线条画、笔触湿度、颜彩渗化',
}

export function composeStyleParams(
  seed: number,
  style: ArtStyle,
  variationFactor: number,
): StyleOutput {
  const rng = lcgRng(seed + 999)

  const presets: Record<ArtStyle, StyleOutput> = {
    anime: {
      outlineEnabled: true, outlineStrength: 0.7, posterizeLevels: 5,
      shadingMode: 'cel', textureStrength: 0.05, glowMultiplier: 1.3,
      brightnessMul: 1.15, saturationMul: 1.35, contrastMul: 1.25, hueShift: 0,
      lineArt: true, lineArtDensity: 0.6,
      brushWetness: 0.05, brushOpacity: 1.0, colorBleed: 0.02,
    },
    'ink-wash': {
      outlineEnabled: false, outlineStrength: 0, posterizeLevels: 6,
      shadingMode: 'soft', textureStrength: 0.8, glowMultiplier: 0.4,
      brightnessMul: 0.85, saturationMul: 0.15, contrastMul: 1.4, hueShift: -15,
      lineArt: false, lineArtDensity: 0,
      brushWetness: 0.85, brushOpacity: 0.7, colorBleed: 0.6,
    },
    realistic: {
      outlineEnabled: false, outlineStrength: 0, posterizeLevels: 0,
      shadingMode: 'gradient', textureStrength: 0.15, glowMultiplier: 0.7,
      brightnessMul: 1.0, saturationMul: 0.9, contrastMul: 1.1, hueShift: 0,
      lineArt: false, lineArtDensity: 0,
      brushWetness: 0.1, brushOpacity: 1.0, colorBleed: 0,
    },
    fantasy: {
      outlineEnabled: false, outlineStrength: 0, posterizeLevels: 0,
      shadingMode: 'gradient', textureStrength: 0.0, glowMultiplier: 1.5,
      brightnessMul: 1.05, saturationMul: 1.15, contrastMul: 1.1, hueShift: 10,
      lineArt: false, lineArtDensity: 0,
      brushWetness: 0.05, brushOpacity: 1.0, colorBleed: 0,
    },
    watercolor: {
      outlineEnabled: false, outlineStrength: 0, posterizeLevels: 0,
      shadingMode: 'soft', textureStrength: 0.55, glowMultiplier: 0.5,
      brightnessMul: 1.1, saturationMul: 0.75, contrastMul: 0.85, hueShift: 5,
      lineArt: false, lineArtDensity: 0,
      brushWetness: 0.7, brushOpacity: 0.75, colorBleed: 0.4,
    },
    sketch: {
      outlineEnabled: true, outlineStrength: 0.9, posterizeLevels: 0,
      shadingMode: 'high-contrast', textureStrength: 0.65, glowMultiplier: 0.1,
      brightnessMul: 1.05, saturationMul: 0.1, contrastMul: 1.6, hueShift: 0,
      lineArt: true, lineArtDensity: 0.9,
      brushWetness: 0, brushOpacity: 0.9, colorBleed: 0,
    },
    oil: {
      outlineEnabled: false, outlineStrength: 0, posterizeLevels: 0,
      shadingMode: 'gradient', textureStrength: 0.55, glowMultiplier: 0.6,
      brightnessMul: 1.0, saturationMul: 1.1, contrastMul: 1.15, hueShift: 5,
      lineArt: false, lineArtDensity: 0,
      brushWetness: 0.6, brushOpacity: 0.8, colorBleed: 0.15,
    },
    pixel: {
      outlineEnabled: true, outlineStrength: 0.5, posterizeLevels: 8,
      shadingMode: 'cel', textureStrength: 0.1, glowMultiplier: 0.8,
      brightnessMul: 1.1, saturationMul: 1.3, contrastMul: 1.3, hueShift: 0,
      lineArt: false, lineArtDensity: 0,
      brushWetness: 0, brushOpacity: 1.0, colorBleed: 0,
    },
    cyberpunk: {
      outlineEnabled: false, outlineStrength: 0, posterizeLevels: 0,
      shadingMode: 'high-contrast', textureStrength: 0.08, glowMultiplier: 2.0,
      brightnessMul: 0.9, saturationMul: 1.5, contrastMul: 1.4, hueShift: 15,
      lineArt: false, lineArtDensity: 0,
      brushWetness: 0, brushOpacity: 1.0, colorBleed: 0.02,
    },
  }

  const preset = presets[style] ?? presets.fantasy
  const v = variationFactor

  return {
    outlineEnabled: preset.outlineEnabled,
    outlineStrength: clamp(preset.outlineStrength + (rng() - 0.5) * 0.1 * v, 0, 1),
    posterizeLevels: Math.max(0, preset.posterizeLevels + Math.round((rng() - 0.5) * 2 * v)),
    shadingMode: preset.shadingMode,
    textureStrength: clamp(preset.textureStrength + (rng() - 0.5) * 0.1 * v, 0, 1),
    glowMultiplier: clamp(preset.glowMultiplier + (rng() - 0.5) * 0.2 * v, 0, 3),
    brightnessMul: clamp(preset.brightnessMul + (rng() - 0.5) * 0.1 * v, 0.5, 2),
    saturationMul: clamp(preset.saturationMul + (rng() - 0.5) * 0.1 * v, 0, 3),
    contrastMul: clamp(preset.contrastMul + (rng() - 0.5) * 0.1 * v, 0.5, 2.5),
    hueShift: preset.hueShift + (rng() - 0.5) * 10 * v,
    lineArt: preset.lineArt,
    lineArtDensity: clamp(preset.lineArtDensity + (rng() - 0.5) * 0.1 * v, 0, 1),
    brushWetness: clamp(preset.brushWetness + (rng() - 0.5) * 0.1 * v, 0, 1),
    brushOpacity: clamp(preset.brushOpacity + (rng() - 0.5) * 0.05 * v, 0.5, 1),
    colorBleed: clamp(preset.colorBleed + (rng() - 0.5) * 0.1 * v, 0, 1),
  }
}

function lcgRng(seed: number) {
  let state = seed
  return function next(): number {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
