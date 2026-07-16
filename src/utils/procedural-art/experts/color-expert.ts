import { gradientNoise2D } from '../noise'
import type { ArtStyle, TimeOfDay } from '../types'
import type { ExpertIdentity, ColorOutput } from './types'

export const COLOR_EXPERT_IDENTITY: ExpertIdentity = {
  name: 'ColorExpert',
  weight: 0.22,
  description: '色彩调色专家 — 色温、饱和度、对比度、和谐配色方案',
}

export function composeColor(
  seed: number,
  style: ArtStyle,
  timeOfDay: TimeOfDay,
  variationFactor: number,
): ColorOutput {
  const rng = lcgRng(seed + 42)

  const timePalettes: Record<TimeOfDay, {
    skyTop: [number, number, number]
    skyMid: [number, number, number]
    skyHorizon: [number, number, number]
    ambient: [number, number, number]
    fog: [number, number, number]
    colorTemp: 'warm' | 'cool' | 'neutral'
  }> = {
    dawn:    { skyTop: [10,10,30], skyMid: [60,30,80], skyHorizon: [255,150,80], ambient: [255,180,120], fog: [180,120,150], colorTemp: 'warm' },
    morning: { skyTop: [50,90,170], skyMid: [130,170,220], skyHorizon: [200,220,240], ambient: [255,250,240], fog: [200,210,230], colorTemp: 'neutral' },
    noon:    { skyTop: [20,70,170], skyMid: [90,150,220], skyHorizon: [170,195,220], ambient: [255,255,250], fog: [200,210,230], colorTemp: 'neutral' },
    dusk:    { skyTop: [10,5,30], skyMid: [50,20,70], skyHorizon: [255,100,50], ambient: [255,160,100], fog: [150,100,130], colorTemp: 'warm' },
    night:   { skyTop: [3,3,15], skyMid: [10,10,35], skyHorizon: [30,20,60], ambient: [80,80,160], fog: [30,30,60], colorTemp: 'cool' },
    midnight: { skyTop: [1,1,8], skyMid: [5,5,20], skyHorizon: [15,15,40], ambient: [50,50,120], fog: [20,20,40], colorTemp: 'cool' },
  }

  const tp = timePalettes[timeOfDay]

  const colorTemp = style === 'ink-wash'
    ? 'cool'
    : style === 'anime' || style === 'fantasy'
    ? 'warm'
    : tp.colorTemp

  const saturationBias = style === 'ink-wash'
    ? 0.15 + rng() * 0.1
    : style === 'watercolor'
    ? 0.6 + rng() * 0.2
    : style === 'anime'
    ? 1.3 + rng() * 0.3
    : style === 'sketch'
    ? 0.1 + rng() * 0.05
    : 0.8 + rng() * 0.3

  function vary(c: [number, number, number], amount: number): [number, number, number] {
    return [
      Math.max(0, Math.min(255, Math.round(c[0] + (rng() - 0.5) * amount * 2))),
      Math.max(0, Math.min(255, Math.round(c[1] + (rng() - 0.5) * amount * 2))),
      Math.max(0, Math.min(255, Math.round(c[2] + (rng() - 0.5) * amount * 2))),
    ]
  }

  const vScale = 30 * variationFactor
  const skyTop = vary(tp.skyTop, vScale)
  const skyMid = vary(tp.skyMid, vScale)
  const skyHorizon = vary(tp.skyHorizon, vScale)
  const ambientLight = vary(tp.ambient, vScale * 0.5)
  const fogColor = vary(tp.fog, vScale * 0.5)

  const terrains: Record<ArtStyle, [number, number, number]> = {
    anime:      [80,140,60],
    'ink-wash': [40,45,40],
    realistic:  [60,100,45],
    fantasy:    [30,60,100],
    watercolor: [120,150,100],
    sketch:     [60,65,55],
    oil:        [50,90,50],
    pixel:      [70,130,55],
    cyberpunk:  [10,20,40],
  }

  const terrainBase = vary(terrains[style] ?? [60,100,50], vScale * 0.6)
  const terrainHighlight = [
    Math.min(255, terrainBase[0] + 40 + rng() * 20),
    Math.min(255, terrainBase[1] + 30 + rng() * 15),
    Math.min(255, terrainBase[2] + 15 + rng() * 10),
  ]
  const terrainShadow = [
    Math.max(0, terrainBase[0] - 40 - rng() * 20),
    Math.max(0, terrainBase[1] - 30 - rng() * 15),
    Math.max(0, terrainBase[2] - 20 - rng() * 10),
  ]

  const accents = generateAccents(style, rng)
  const paletteName = style === 'ink-wash'
    ? 'monochromatic'
    : style === 'anime'
    ? 'complementary'
    : style === 'fantasy'
    ? 'triadic'
    : style === 'watercolor'
    ? 'analogous'
    : 'complementary'

  return {
    skyTop: { r: skyTop[0], g: skyTop[1], b: skyTop[2] },
    skyMid: { r: skyMid[0], g: skyMid[1], b: skyMid[2] },
    skyHorizon: { r: skyHorizon[0], g: skyHorizon[1], b: skyHorizon[2] },
    terrainBase: { r: terrainBase[0], g: terrainBase[1], b: terrainBase[2] },
    terrainHighlight: { r: terrainHighlight[0], g: terrainHighlight[1], b: terrainHighlight[2] },
    terrainShadow: { r: terrainShadow[0], g: terrainShadow[1], b: terrainShadow[2] },
    accent1: { r: accents[0][0], g: accents[0][1], b: accents[0][2] },
    accent2: { r: accents[1][0], g: accents[1][1], b: accents[1][2] },
    accent3: { r: accents[2][0], g: accents[2][1], b: accents[2][2] },
    fogColor: { r: fogColor[0], g: fogColor[1], b: fogColor[2] },
    ambientLight: { r: ambientLight[0], g: ambientLight[1], b: ambientLight[2] },
    colorTemp,
    saturationBias,
    harmoniousPalette: paletteName,
  }
}

function generateAccents(style: ArtStyle, rng: () => number): [number, number, number][] {
  const presets: Record<ArtStyle, [number, number, number][]> = {
    anime:      [[255,80,80],[255,200,50],[100,200,255]],
    'ink-wash': [[80,70,60],[120,100,80],[160,140,120]],
    realistic:  [[200,160,100],[100,150,80],[150,100,60]],
    fantasy:    [[200,100,255],[100,255,200],[255,200,100]],
    watercolor: [[200,150,130],[130,180,160],[180,160,200]],
    sketch:     [[80,80,80],[120,120,120],[160,160,160]],
    oil:        [[200,60,40],[40,120,200],[200,180,60]],
    pixel:      [[255,50,50],[50,255,50],[50,180,255]],
    cyberpunk:  [[255,0,128],[0,255,255],[128,0,255]],
  }

  const preset = presets[style] ?? [[200,100,80],[80,150,200],[150,200,100]]
  return preset.map(c => [
    Math.max(0, Math.min(255, c[0] + (rng() - 0.5) * 40)),
    Math.max(0, Math.min(255, c[1] + (rng() - 0.5) * 40)),
    Math.max(0, Math.min(255, c[2] + (rng() - 0.5) * 40)),
  ]) as [number, number, number][]
}

function lcgRng(seed: number) {
  let state = seed
  return function next(): number {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}
