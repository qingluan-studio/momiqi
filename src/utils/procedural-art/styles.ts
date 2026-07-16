// ============================================================
// 风格定义系统 — 5 种艺术风格 + 风格感知渲染工具
// ============================================================

import type { ArtStyle, StyleConfig, Color, TimeOfDay } from './types'
import { color, hsl } from './scene-engine'
import { valueNoise2D } from './noise'

// ---------- 5 种风格定义 ----------

export const STYLE_CONFIGS: Record<ArtStyle, StyleConfig> = {
  anime: {
    name: 'anime',
    label: '二次元',
    brightnessMul: 1.15,
    saturationMul: 1.35,
    contrastMul: 1.25,
    hueShift: 0,
    outline: true,
    outlineStrength: 0.7,
    posterizeLevels: 5,
    shading: 'cel',
    textureStrength: 0.05,
    glowMultiplier: 1.3,
    description: '明亮鲜艳、清晰描边、色块分明的动漫/新海诚风格',
  },

  'ink-wash': {
    name: 'ink-wash',
    label: '水墨画',
    brightnessMul: 0.85,
    saturationMul: 0.15,
    contrastMul: 1.4,
    hueShift: -15,
    outline: false,
    outlineStrength: 0,
    posterizeLevels: 6,
    shading: 'soft',
    textureStrength: 0.8,
    glowMultiplier: 0.4,
    description: '墨色晕染、淡雅素净、意境悠远的中国水墨风格',
  },

  realistic: {
    name: 'realistic',
    label: '写实',
    brightnessMul: 1.0,
    saturationMul: 0.9,
    contrastMul: 1.1,
    hueShift: 0,
    outline: false,
    outlineStrength: 0,
    posterizeLevels: 0,
    shading: 'gradient',
    textureStrength: 0.15,
    glowMultiplier: 0.7,
    description: '自然色彩、细腻过渡、真实光影的写实风格',
  },

  fantasy: {
    name: 'fantasy',
    label: '幻想',
    brightnessMul: 1.05,
    saturationMul: 1.15,
    contrastMul: 1.1,
    hueShift: 10,
    outline: false,
    outlineStrength: 0,
    posterizeLevels: 0,
    shading: 'gradient',
    textureStrength: 0.0,
    glowMultiplier: 1.5,
    description: '绚丽多彩、光效璀璨、史诗感的幻想风格',
  },

  watercolor: {
    name: 'watercolor',
    label: '水彩',
    brightnessMul: 1.1,
    saturationMul: 0.75,
    contrastMul: 0.85,
    hueShift: 5,
    outline: false,
    outlineStrength: 0,
    posterizeLevels: 0,
    shading: 'soft',
    textureStrength: 0.55,
    glowMultiplier: 0.5,
    description: '柔和渗化、轻透淡彩、笔触自然的水彩风格',
  },

  sketch: {
    name: 'sketch',
    label: '手绘素描',
    brightnessMul: 1.05,
    saturationMul: 0.1,
    contrastMul: 1.6,
    hueShift: 0,
    outline: true,
    outlineStrength: 0.9,
    posterizeLevels: 0,
    shading: 'high-contrast',
    textureStrength: 0.65,
    glowMultiplier: 0.1,
    description: '炭笔勾线、排线调子、素描质感的手绘黑白风格',
  },

  oil: {
    name: 'oil',
    label: '油画',
    brightnessMul: 1.0,
    saturationMul: 1.1,
    contrastMul: 1.15,
    hueShift: 5,
    outline: false,
    outlineStrength: 0,
    posterizeLevels: 0,
    shading: 'gradient',
    textureStrength: 0.55,
    glowMultiplier: 0.6,
    description: '厚涂笔触、油彩肌理、浓郁饱和的古典油画风格',
  },

  pixel: {
    name: 'pixel',
    label: '像素风',
    brightnessMul: 1.1,
    saturationMul: 1.3,
    contrastMul: 1.3,
    hueShift: 0,
    outline: true,
    outlineStrength: 0.5,
    posterizeLevels: 8,
    shading: 'cel',
    textureStrength: 0.1,
    glowMultiplier: 0.8,
    description: '复古像素、块状色阶、8bit游戏美术风格',
  },

  cyberpunk: {
    name: 'cyberpunk',
    label: '赛博仙侠',
    brightnessMul: 0.9,
    saturationMul: 1.5,
    contrastMul: 1.4,
    hueShift: 15,
    outline: false,
    outlineStrength: 0,
    posterizeLevels: 0,
    shading: 'high-contrast',
    textureStrength: 0.08,
    glowMultiplier: 2.0,
    description: '霓虹荧光、暗黑高对比、科幻修真融合的赛博朋克风格',
  },
}

/** 获取风格配置 */
export function getStyleConfig(style: ArtStyle): StyleConfig {
  return STYLE_CONFIGS[style] ?? STYLE_CONFIGS.fantasy
}

// ---------- 风格感知的调色板覆写 ----------

/**
 * 根据风格调整天空渐变色
 * 返回新的 Gradient 或 null (表示使用默认)
 */
export function styleSkyGradient(style: ArtStyle, baseGradient: {
  stops: Array<{ position: number; color: Color }>
}): { stops: Array<{ position: number; color: Color }> } {
  const cfg = getStyleConfig(style)
  const stops = baseGradient.stops.map(stop => {
    const c = stop.color
    const r = Math.min(255, Math.round(c.r * cfg.brightnessMul * cfg.saturationMul))
    const g = Math.min(255, Math.round(c.g * cfg.brightnessMul))
    const b = Math.min(255, Math.round(c.b * cfg.brightnessMul * (1 + (1 - cfg.saturationMul) * 0.3)))

    if (style === 'ink-wash') {
      const gray = r * 0.3 + g * 0.59 + b * 0.11
      const tintR = Math.min(255, gray + 20)
      const tintG = Math.min(255, gray + 10)
      const tintB = Math.min(255, gray + 15)
      return { position: stop.position, color: color(tintR, tintG, tintB, c.a) }
    }

    if (style === 'anime') {
      const sr = Math.min(255, Math.round(r * 1.1))
      const sg = Math.min(255, Math.round(g * 1.05))
      const sb = Math.min(255, Math.round(b * 1.15))
      return { position: stop.position, color: color(sr, sg, sb, c.a) }
    }

    if (style === 'watercolor') {
      const dr = Math.min(255, r + 15)
      const dg = Math.min(255, g + 8)
      const db = Math.min(255, b + 5)
      return { position: stop.position, color: color(dr, dg, db, (c.a ?? 1) * 0.92) }
    }

    return stop
  })

  return { stops }
}

/**
 * 风格感知的辉光颜色调整
 */
export function styleGlowColor(style: ArtStyle, base: Color): Color {
  const cfg = getStyleConfig(style)
  return {
    r: base.r,
    g: base.g,
    b: base.b,
    a: (base.a ?? 0.5) * cfg.glowMultiplier,
  }
}

/**
 * 风格感知的地面/地形颜色偏移
 */
export function styleTerrainColor(style: ArtStyle, baseColor: string): string {
  if (style === 'ink-wash') {
    return baseColor.replace(/[\d.]+\)$/, (match) => {
      const vals = match.replace(')', '').split(',').map(Number)
      if (vals.length >= 3) {
        const gray = vals[0] * 0.3 + vals[1] * 0.59 + vals[2] * 0.11
        const r = Math.min(255, gray * 0.9 + 20)
        const g = Math.min(255, gray * 0.95 + 10)
        const b = Math.min(255, gray + 15)
        const a = vals[3] ?? 1
        return `${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`
      }
      return match
    })
  }
  if (style === 'watercolor') {
    return baseColor.replace(/[\d.]+\)$/, (match) => {
      const vals = match.replace(')', '').split(',').map(Number)
      if (vals.length >= 3) {
        return `${Math.round(vals[0] * 1.05)},${Math.round(vals[1] * 0.95)},${Math.round(vals[2] * 0.9)},${vals[3] ?? 1})`
      }
      return match
    })
  }
  return baseColor
}

// ---------- 动态构图变化引擎 ----------

/**
 * 生成基于 seed 的确定性随机偏移
 * 用于同 seed 下每次渲染保持一致, 但不同 seed 呈现不同构图
 */
export function getCameraOffset(
  seed: number,
  variationFactor: number,
): { offsetX: number; offsetY: number; zoom: number; rotation: number } {
  const n1 = valueNoise2D(seed * 0.01, 0, seed)
  const n2 = valueNoise2D(seed * 0.01, 1000, seed)
  const n3 = valueNoise2D(seed * 0.01, 2000, seed)
  const n4 = valueNoise2D(seed * 0.01, 3000, seed)

  return {
    offsetX: (n1 - 0.5) * 0.15 * variationFactor,
    offsetY: (n2 - 0.5) * 0.1 * variationFactor,
    zoom: 1.0 + (n3 - 0.5) * 0.1 * variationFactor,
    rotation: (n4 - 0.5) * 0.03 * variationFactor,
  }
}

/**
 * 获取动态变化参数 (用于控制元素数量/大小/密度等)
 */
export function getVariationMultiplier(
  seed: number,
  key: number,
  variationFactor: number,
): number {
  const n = valueNoise2D(seed * 0.01, key * 100, seed)
  return 1.0 + (n - 0.5) * variationFactor
}

/** 获取动态随机颜色偏移 */
export function getStyleColorShift(style: ArtStyle, seed: number): number {
  const cfg = getStyleConfig(style)
  const n = valueNoise2D(seed * 0.01, 5000, seed)
  return cfg.hueShift + (n - 0.5) * 15
}

// ---------- 风格列表 (供 UI 使用) ----------

export function getStyleList(): Array<{ value: ArtStyle; label: string; desc: string }> {
  return Object.entries(STYLE_CONFIGS).map(([key, cfg]) => ({
    value: key as ArtStyle,
    label: cfg.label,
    desc: cfg.description,
  }))
}
