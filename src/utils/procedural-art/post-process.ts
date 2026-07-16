// ============================================================
// 后处理管线 — 描边检测、色块化、风格化滤镜
// ============================================================

import type { ArtStyle, StyleConfig } from './types'
import { getStyleConfig } from './styles'
import { valueNoise2D } from './noise'

/**
 * Sobel 边缘检测 + 描边叠加
 * 用于 anime 等需要清晰轮廓的风格
 */
export function applyOutline(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number = 0.7,
): void {
  if (strength <= 0) return

  const src = ctx.getImageData(0, 0, w, h)
  const dst = ctx.createImageData(w, h)

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4

      const tl = luminanceAt(src, x - 1, y - 1, w)
      const tc = luminanceAt(src, x, y - 1, w)
      const tr = luminanceAt(src, x + 1, y - 1, w)
      const ml = luminanceAt(src, x - 1, y, w)
      const mr = luminanceAt(src, x + 1, y, w)
      const bl = luminanceAt(src, x - 1, y + 1, w)
      const bc = luminanceAt(src, x, y + 1, w)
      const br = luminanceAt(src, x + 1, y + 1, w)

      const gx = (tr + 2 * mr + br) - (tl + 2 * ml + bl)
      const gy = (bl + 2 * bc + br) - (tl + 2 * tc + tr)
      const edge = Math.sqrt(gx * gx + gy * gy) / 4

      const alpha = Math.min(1, edge * strength * 2)

      dst.data[idx] = 20
      dst.data[idx + 1] = 15
      dst.data[idx + 2] = 30
      dst.data[idx + 3] = Math.round(alpha * 255)
    }
  }

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.putImageData(dst, 0, 0)

  // 用黑色描边再强调一次
  ctx.globalCompositeOperation = 'source-over'
  const edgeLayer = ctx.createImageData(w, h)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4
      const edgePx = dst.data[idx + 3]
      if (edgePx > 120) {
        edgeLayer.data[idx] = 10
        edgeLayer.data[idx + 1] = 8
        edgeLayer.data[idx + 2] = 18
        edgeLayer.data[idx + 3] = Math.round(edgePx * strength * 0.4)
      }
    }
  }
  ctx.putImageData(edgeLayer, 0, 0)
  ctx.restore()
}

function luminanceAt(data: ImageData, x: number, y: number, w: number): number {
  const idx = (y * w + x) * 4
  return data.data[idx] * 0.299 + data.data[idx + 1] * 0.587 + data.data[idx + 2] * 0.114
}

/**
 * 色块化 (Posterization) — 将颜色量化为有限层级
 * 用于 anime cel-shading 效果
 */
export function applyPosterize(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  levels: number,
): void {
  if (levels <= 0) return

  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const step = 255 / (levels - 1)

  for (let i = 0; i < data.length; i += 4) {
    // 跳过透明像素
    if (data[i + 3] < 10) continue

    const r = Math.round(data[i] / step) * step
    const g = Math.round(data[i + 1] / step) * step
    const b = Math.round(data[i + 2] / step) * step

    // 调亮中间调到高光
    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    if (lum > 140) {
      data[i] = Math.min(255, r + 15)
      data[i + 1] = Math.min(255, g + 15)
      data[i + 2] = Math.min(255, b + 15)
    } else {
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * 纹理叠加 — 模拟纸张/水彩/水墨质感
 */
export function applyTexture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number = 0.3,
  seed: number = 0,
): void {
  if (intensity <= 0) return

  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      if (data[idx + 3] < 5) continue

      // 多层噪声合成模拟纸纹
      const n1 = valueNoise2D(x * 0.05, y * 0.05, seed) * 0.5
      const n2 = valueNoise2D(x * 0.15, y * 0.15, seed + 1000) * 0.3
      const n3 = valueNoise2D(x * 0.3, y * 0.3, seed + 2000) * 0.2
      const texture = (n1 + n2 + n3) * intensity

      const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114

      data[idx] = Math.min(255, data[idx] + texture * 30)
      data[idx + 1] = Math.min(255, data[idx + 1] + texture * 25)
      data[idx + 2] = Math.min(255, data[idx + 2] + texture * 20)

      // 在亮部增加细微纹理噪点
      if (lum > 100) {
        data[idx] = Math.min(255, data[idx] + texture * 15)
        data[idx + 1] = Math.min(255, data[idx + 1] + texture * 10)
        data[idx + 2] = Math.min(255, data[idx + 2] + texture * 5)
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * 色彩/光效调整 (亮度、饱和度、对比度)
 */
export function applyColorAdjust(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brightness: number,
  saturation: number,
  contrast: number,
): void {
  if (brightness === 1 && saturation === 1 && contrast === 1) return

  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 5) continue

    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    // 亮度
    r *= brightness
    g *= brightness
    b *= brightness

    // 饱和度
    const gray = r * 0.299 + g * 0.587 + b * 0.114
    r = gray + (r - gray) * saturation
    g = gray + (g - gray) * saturation
    b = gray + (b - gray) * saturation

    // 对比度
    r = (r - 128) * contrast + 128
    g = (g - 128) * contrast + 128
    b = (b - 128) * contrast + 128

    data[i] = Math.max(0, Math.min(255, r))
    data[i + 1] = Math.max(0, Math.min(255, g))
    data[i + 2] = Math.max(0, Math.min(255, b))
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * 完整风格后处理管线
 * 按顺序应用: posterize → colorAdjust → outline → texture
 */
export function applyStylePostProcess(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: ArtStyle,
  seed: number,
): void {
  const cfg = getStyleConfig(style)

  // 1. 色块化 (先做, 因为后续操作需要基于已有像素)
  if (cfg.posterizeLevels > 0) {
    applyPosterize(ctx, w, h, cfg.posterizeLevels)
  }

  // 2. 色彩调整
  applyColorAdjust(
    ctx, w, h,
    cfg.brightnessMul,
    cfg.saturationMul,
    cfg.contrastMul,
  )

  // 3. 描边 (在色彩调整之后, 保证描边颜色稳定)
  if (cfg.outline) {
    applyOutline(ctx, w, h, cfg.outlineStrength)
  }

  // 4. 纹理叠加 (最后叠加)
  if (cfg.textureStrength > 0) {
    applyTexture(ctx, w, h, cfg.textureStrength, seed)
  }
}
