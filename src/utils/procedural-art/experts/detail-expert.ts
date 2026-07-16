import type { SceneType } from '../types'
import type { ExpertIdentity, DetailOutput } from './types'

export const DETAIL_EXPERT_IDENTITY: ExpertIdentity = {
  name: 'DetailExpert',
  weight: 0.08,
  description: '细节密度专家 — 元素数量、装饰层级、粒子/灵气的密度分配',
}

export function composeDetails(
  seed: number,
  sceneType: SceneType,
  variationFactor: number,
): DetailOutput {
  const rng = lcgRng(seed + 505)

  const baseConfigs: Record<SceneType, {
    elements: number
    ornament: number
    particles: number
    qi: number
    clouds: number
    stars: number
    flora: number
    arch: number
    subElements: number
    microDetail: number
  }> = {
    'cloud-sea-mountains': { elements: 15, ornament: 0.5, particles: 60, qi: 0.6, clouds: 0.8, stars: 0, flora: 0.2, arch: 0, subElements: 10, microDetail: 0.4 },
    'starry-dome':          { elements: 20, ornament: 0.3, particles: 30, qi: 0.4, clouds: 0.2, stars: 1, flora: 0.1, arch: 0, subElements: 5, microDetail: 0.3 },
    'spirit-spring':        { elements: 18, ornament: 0.6, particles: 50, qi: 0.8, clouds: 0.3, stars: 0, flora: 0.7, arch: 0.2, subElements: 12, microDetail: 0.5 },
    'sword-qi':             { elements: 12, ornament: 0.4, particles: 80, qi: 0.9, clouds: 0.1, stars: 0, flora: 0, arch: 0, subElements: 8, microDetail: 0.5 },
    'cloud-palace':         { elements: 20, ornament: 0.8, particles: 40, qi: 0.5, clouds: 0.7, stars: 0.2, flora: 0.3, arch: 0.9, subElements: 15, microDetail: 0.7 },
    'lightning-tribulation': { elements: 10, ornament: 0.3, particles: 90, qi: 0.85, clouds: 0.9, stars: 0.1, flora: 0.1, arch: 0, subElements: 6, microDetail: 0.3 },
    'mystic-cave':          { elements: 14, ornament: 0.7, particles: 25, qi: 0.7, clouds: 0.1, stars: 0, flora: 0.3, arch: 0.6, subElements: 10, microDetail: 0.6 },
    'alchemy-furnace':      { elements: 12, ornament: 0.5, particles: 70, qi: 0.7, clouds: 0.2, stars: 0, flora: 0.1, arch: 0.4, subElements: 8, microDetail: 0.5 },
    'flower-fairyland':     { elements: 25, ornament: 0.7, particles: 40, qi: 0.5, clouds: 0.3, stars: 0.1, flora: 0.9, arch: 0.2, subElements: 15, microDetail: 0.6 },
    'ancient-sword':        { elements: 10, ornament: 0.8, particles: 35, qi: 0.6, clouds: 0.15, stars: 0.1, flora: 0.2, arch: 0.3, subElements: 8, microDetail: 0.7 },
  }

  const base = baseConfigs[sceneType] ?? baseConfigs['cloud-sea-mountains']

  const v = variationFactor
  const vary = (val: number, scale: number) => val * (1 + (rng() - 0.5) * scale * v)

  return {
    elementCount: Math.max(5, Math.round(vary(base.elements, 2))),
    ornamentLevel: clamp(vary(base.ornament, 1), 0, 1),
    particleDensity: Math.max(0, Math.round(vary(base.particles, 1.5))),
    qiDensity: clamp(vary(base.qi, 1), 0, 1),
    cloudDensity: clamp(vary(base.clouds, 1), 0, 1),
    starDensity: Math.max(0, Math.round(vary(base.stars * 300, 1))),
    floraDensity: clamp(vary(base.flora, 1.2), 0, 1),
    architecturalDetail: clamp(vary(base.arch, 1), 0, 1),
    subElementCount: Math.max(2, Math.round(vary(base.subElements, 2))),
    microDetailLevel: clamp(vary(base.microDetail, 0.8), 0, 1),
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
