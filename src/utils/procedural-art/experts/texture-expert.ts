import { valueNoise2D, gradientNoise2D } from '../noise'
import type { ArtStyle } from '../types'
import type { ExpertIdentity, TextureOutput } from './types'

export const TEXTURE_EXPERT_IDENTITY: ExpertIdentity = {
  name: 'TextureExpert',
  weight: 0.17,
  description: '纹理质感专家 — 笔触、纸张纹理、水彩渗化、素描排线、油画肌理',
}

export function composeTexture(
  seed: number,
  style: ArtStyle,
  variationFactor: number,
): TextureOutput {
  const rng = lcgRng(seed + 137)

  let textureType: TextureOutput['textureType']
  let roughness: number
  let strokeAngle: number
  let strokeWidth: number
  let hatchDensity: number
  let paperGrain: number
  let detailScale: number
  let noiseLacunarity: number
  let edgeRoughness: number

  switch (style) {
    case 'anime':
      textureType = 'grain'
      roughness = 0.05 + rng() * 0.05
      strokeAngle = 0
      strokeWidth = 1
      hatchDensity = 0
      paperGrain = 0.02
      detailScale = 1.0
      noiseLacunarity = 2.0
      edgeRoughness = 0
      break

    case 'watercolor':
      textureType = 'watercolor-bleed'
      roughness = 0.3 + rng() * 0.2
      strokeAngle = (rng() - 0.5) * 60
      strokeWidth = 2 + rng() * 4
      hatchDensity = 0.1
      paperGrain = 0.6 + rng() * 0.3
      detailScale = 0.7 + rng() * 0.3
      noiseLacunarity = 3.5 + rng() * 1.5
      edgeRoughness = 0.4 + rng() * 0.3
      break

    case 'ink-wash':
      textureType = 'paper'
      roughness = 0.5 + rng() * 0.3
      strokeAngle = (rng() - 0.5) * 30
      strokeWidth = 3 + rng() * 5
      hatchDensity = 0
      paperGrain = 0.7 + rng() * 0.2
      detailScale = 0.6 + rng() * 0.2
      noiseLacunarity = 3.0 + rng() * 1.0
      edgeRoughness = 0.5 + rng() * 0.3
      break

    case 'sketch':
      textureType = 'sketch-line'
      roughness = 0.4 + rng() * 0.3
      strokeAngle = (rng() - 0.5) * 45
      strokeWidth = 1 + rng() * 2
      hatchDensity = 0.6 + rng() * 0.4
      paperGrain = 0.5 + rng() * 0.3
      detailScale = 0.8 + rng() * 0.2
      noiseLacunarity = 2.5 + rng() * 1.0
      edgeRoughness = 0.2 + rng() * 0.2
      break

    case 'oil':
      textureType = 'brush-stroke'
      roughness = 0.6 + rng() * 0.3
      strokeAngle = (rng() - 0.5) * 90
      strokeWidth = 4 + rng() * 6
      hatchDensity = 0
      paperGrain = 0.1 + rng() * 0.1
      detailScale = 0.5 + rng() * 0.3
      noiseLacunarity = 2.0 + rng() * 1.0
      edgeRoughness = 0.3 + rng() * 0.3
      break

    case 'canvas':
      textureType = 'canvas'
      roughness = 0.15 + rng() * 0.1
      strokeAngle = 0
      strokeWidth = 0
      hatchDensity = 0
      paperGrain = 0.3 + rng() * 0.2
      detailScale = 1.0
      noiseLacunarity = 2.0
      edgeRoughness = 0
      break

    case 'pixel':
      textureType = 'grain'
      roughness = 0.02
      strokeAngle = 0
      strokeWidth = 1
      hatchDensity = 0
      paperGrain = 0
      detailScale = 0.25
      noiseLacunarity = 1.0
      edgeRoughness = 0
      break

    case 'cyberpunk':
      textureType = 'grain'
      roughness = 0.1 + rng() * 0.1
      strokeAngle = 0
      strokeWidth = 1
      hatchDensity = 0
      paperGrain = 0.05
      detailScale = 1.2
      noiseLacunarity = 2.5
      edgeRoughness = 0.05
      break

    default: // realistic, fantasy
      textureType = 'grain'
      roughness = 0.1 + rng() * 0.1
      strokeAngle = 0
      strokeWidth = 1
      hatchDensity = 0
      paperGrain = 0.1
      detailScale = 1.0 + rng() * 0.3
      noiseLacunarity = 2.5 + rng() * 0.5
      edgeRoughness = 0.05
      break
  }

  roughness = clamp(roughness + (rng() - 0.5) * 0.15 * variationFactor, 0, 1)
  paperGrain = clamp(paperGrain + (rng() - 0.5) * 0.1 * variationFactor, 0, 1)
  edgeRoughness = clamp(edgeRoughness + (rng() - 0.5) * 0.1 * variationFactor, 0, 1)

  return {
    textureType, roughness, strokeAngle, strokeWidth,
    hatchDensity, paperGrain, detailScale, noiseLacunarity, edgeRoughness,
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
