// ============================================================
// 类型定义 — 场景参数、颜色、渲染状态、风格系统
// ============================================================

/** 颜色 (RGBA, 0-255) */
export interface Color {
  r: number
  g: number
  b: number
  a?: number
}

/** 16 进制颜色字符串 */
export type HexColor = string

export interface GradientStop {
  position: number
  color: Color
}

export interface Gradient {
  stops: GradientStop[]
}

/** 时间段 */
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'dusk' | 'night' | 'midnight'

/** 场景类型 */
export type SceneType =
  | 'cloud-sea-mountains'
  | 'starry-dome'
  | 'spirit-spring'
  | 'sword-qi'
  | 'cloud-palace'
  | 'lightning-tribulation'
  | 'mystic-cave'
  | 'alchemy-furnace'
  | 'flower-fairyland'
  | 'ancient-sword'

/** 艺术风格 */
export type ArtStyle =
  | 'anime'       // 二次元 — cel shading + outlines
  | 'ink-wash'    // 水墨画 — desaturated + soft edges
  | 'realistic'   // 写实 — enhanced details + natural colors
  | 'fantasy'     // 幻想 — vibrant + glow (默认)
  | 'watercolor'  // 水彩 — soft bleed + texture overlay
  | 'sketch'      // 手绘素描 — high contrast + hatch lines
  | 'oil'         // 油画 — thick brush strokes + impasto
  | 'pixel'       // 像素风 — posterized + blocky
  | 'cyberpunk'   // 赛博仙侠 — neon glow + high contrast

/** 风格着色模式 */
export type ShadingMode = 'cel' | 'gradient' | 'soft' | 'high-contrast'

/** 风格定义 */
export interface StyleConfig {
  name: string
  label: string
  /** 亮度倍率 */
  brightnessMul: number
  /** 饱和度倍率 */
  saturationMul: number
  /** 对比度倍率 */
  contrastMul: number
  /** 色相偏移量 (度) */
  hueShift: number
  /** 描边开关 */
  outline: boolean
  /** 描边强度 */
  outlineStrength: number
  /** 色块化层级数 (0 = 不色块化) */
  posterizeLevels: number
  /** 着色模式 */
  shading: ShadingMode
  /** 纹理强度 0..1 */
  textureStrength: number
  /** 光晕强度倍率 */
  glowMultiplier: number
  /** 色调风格描述 */
  description: string
}

/** 从提示词解析出的场景参数 */
export interface SceneParams {
  sceneType: SceneType
  timeOfDay: TimeOfDay
  seed: number
  width: number
  height: number
  /** 艺术风格 */
  style: ArtStyle
  /** 变化因子 0..1 (越高越随机) */
  variationFactor: number
  /** 气氛强度 0..1 */
  atmosphere: number
  /** 灵气粒子密度 */
  qiDensity: number
  /** 颜色偏移 (色相) */
  hueShift: number
  /** 额外关键词 */
  keywords: string[]
}

/** 渲染器接口 */
export interface SceneRenderer {
  readonly type: SceneType
  readonly name: string
  render(ctx: CanvasRenderingContext2D, params: SceneParams): void
}

/** 粒子定义 */
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: Color
  alpha: number
}

/** fBm 配置 */
export interface FbmConfig {
  octaves: number
  lacunarity: number
  gain: number
  scale: number
}

/** 调色板 */
export interface Palette {
  sky: Gradient
  terrain: Gradient
  accent: Color
  fog: Color
  highlight: Color
  shadow: Color
}
