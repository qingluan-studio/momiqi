import { valueNoise2D, gradientNoise2D } from '../noise'
import type { TimeOfDay } from '../types'
import type { ExpertIdentity, LightingOutput } from './types'

export const LIGHTING_EXPERT_IDENTITY: ExpertIdentity = {
  name: 'LightingExpert',
  weight: 0.18,
  description: '光照照明专家 — 光源方向、阴影柔和度、边缘光、体积光散射、大气散射',
}

export function composeLighting(
  seed: number,
  timeOfDay: TimeOfDay,
  variationFactor: number,
  w: number,
  h: number,
): LightingOutput {
  const rng = lcgRng(seed + 271)

  const timeConfig: Record<TimeOfDay, {
    sunAngle: number
    ambient: number
    directional: number
    shadow: number
    rim: number
    volumetric: number
    scattering: number
    rays: number
  }> = {
    dawn:    { sunAngle: Math.PI * 0.08, ambient: 0.45, directional: 0.6, shadow: 0.7, rim: 0.5, volumetric: 0.6, scattering: 0.7, rays: 6 },
    morning: { sunAngle: Math.PI * 0.22, ambient: 0.6,  directional: 0.7, shadow: 0.5, rim: 0.3, volumetric: 0.3, scattering: 0.4, rays: 4 },
    noon:    { sunAngle: Math.PI * 0.42, ambient: 0.7,  directional: 0.9, shadow: 0.3, rim: 0.1, volumetric: 0.1, scattering: 0.2, rays: 2 },
    dusk:    { sunAngle: Math.PI * 0.58, ambient: 0.45, directional: 0.65, shadow: 0.65, rim: 0.6, volumetric: 0.55, scattering: 0.7, rays: 7 },
    night:   { sunAngle: Math.PI * 0.72, ambient: 0.25, directional: 0.2, shadow: 0.85, rim: 0.4, volumetric: 0.2, scattering: 0.3, rays: 1 },
    midnight: { sunAngle: Math.PI * 0.85, ambient: 0.15, directional: 0.1, shadow: 0.95, rim: 0.3, volumetric: 0.1, scattering: 0.15, rays: 0 },
  }

  const tc = timeConfig[timeOfDay]

  const sunAngle = tc.sunAngle + (rng() - 0.5) * 0.3 * variationFactor
  const lightSourceX = w * (0.5 + Math.cos(sunAngle) * 0.4 + (rng() - 0.5) * 0.1 * variationFactor)
  const lightSourceY = h * (0.2 - Math.sin(sunAngle) * 0.2 + (rng() - 0.5) * 0.05 * variationFactor)

  return {
    lightSourceX: Math.max(0, Math.min(w, lightSourceX)),
    lightSourceY: Math.max(0, Math.min(h, lightSourceY)),
    ambientIntensity: clamp(tc.ambient + (rng() - 0.5) * 0.1 * variationFactor, 0.05, 1),
    directionalIntensity: clamp(tc.directional + (rng() - 0.5) * 0.1 * variationFactor, 0, 1),
    shadowSoftness: clamp(tc.shadow + (rng() - 0.5) * 0.1 * variationFactor, 0, 1),
    rimLightIntensity: clamp(tc.rim + (rng() - 0.5) * 0.15 * variationFactor, 0, 1),
    volumetricLight: clamp(tc.volumetric + (rng() - 0.5) * 0.08 * variationFactor, 0, 1),
    godRayAngle: sunAngle + (rng() - 0.5) * 0.15 * variationFactor,
    godRayCount: Math.max(0, Math.round(tc.rays + (rng() - 0.5) * 2 * variationFactor)),
    bounceLight: clamp(0.1 + rng() * 0.15, 0, 0.4),
    atmosphericScattering: clamp(tc.scattering + (rng() - 0.5) * 0.1 * variationFactor, 0, 1),
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
