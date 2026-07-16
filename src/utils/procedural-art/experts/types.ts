import type { ArtStyle, SceneType, TimeOfDay, Color } from '../types'

export interface ExpertIdentity {
  name: string
  weight: number
  description: string
}

export interface CompositionOutput {
  focalX: number
  focalY: number
  horizonY: number
  layout: 'golden-ratio' | 'rule-of-thirds' | 'centered' | 'diagonal' | 'asymmetric'
  cameraZoom: number
  cameraRotation: number
  cameraOffsetX: number
  cameraOffsetY: number
  negativeSpace: number
  elementSpacing: number
}

export interface ColorOutput {
  skyTop: Color
  skyMid: Color
  skyHorizon: Color
  terrainBase: Color
  terrainHighlight: Color
  terrainShadow: Color
  accent1: Color
  accent2: Color
  accent3: Color
  fogColor: Color
  ambientLight: Color
  colorTemp: 'warm' | 'cool' | 'neutral'
  saturationBias: number
  harmoniousPalette: string
}

export interface TextureOutput {
  textureType: 'grain' | 'brush-stroke' | 'paper' | 'canvas' | 'watercolor-bleed' | 'sketch-line'
  roughness: number
  strokeAngle: number
  strokeWidth: number
  hatchDensity: number
  paperGrain: number
  detailScale: number
  noiseLacunarity: number
  edgeRoughness: number
}

export interface LightingOutput {
  lightSourceX: number
  lightSourceY: number
  ambientIntensity: number
  directionalIntensity: number
  shadowSoftness: number
  rimLightIntensity: number
  volumetricLight: number
  godRayAngle: number
  godRayCount: number
  bounceLight: number
  atmosphericScattering: number
}

export interface StyleOutput {
  outlineEnabled: boolean
  outlineStrength: number
  posterizeLevels: number
  shadingMode: 'cel' | 'gradient' | 'soft' | 'high-contrast'
  textureStrength: number
  glowMultiplier: number
  brightnessMul: number
  saturationMul: number
  contrastMul: number
  hueShift: number
  lineArt: boolean
  lineArtDensity: number
  brushWetness: number
  brushOpacity: number
  colorBleed: number
}

export interface DetailOutput {
  elementCount: number
  ornamentLevel: number
  particleDensity: number
  qiDensity: number
  cloudDensity: number
  starDensity: number
  floraDensity: number
  architecturalDetail: number
  subElementCount: number
  microDetailLevel: number
}

export interface ExpertOutputs {
  composition: CompositionOutput
  color: ColorOutput
  texture: TextureOutput
  lighting: LightingOutput
  style: StyleOutput
  detail: DetailOutput
}

export interface ExpertWeights {
  composition: number
  color: number
  texture: number
  lighting: number
  style: number
  detail: number
}

export type FusionStrategy = 'consensus' | 'judge_weighted' | 'best_of_n' | 'evolutionary'

export interface FusionResult {
  outputs: ExpertOutputs
  strategy: FusionStrategy
  confidence: number
  divergence: number
  metadata: Record<string, number>
}

export interface T6Assessment {
  compositionBalance: number
  colorHarmony: number
  textureRichness: number
  lightingQuality: number
  styleConsistency: number
  variationUniqueness: number
  overall: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}
