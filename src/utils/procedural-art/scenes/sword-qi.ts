// ============================================================
// 剑气纵横 — 剑意能量流 + 灵力漩涡
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawSkyGradient, drawVignette, drawGlow, drawGodRays,
  getTimePalette, hex, drawStars, fbm2D, gradientNoise2D,
  valueNoise2D, drawFogLayer, applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const swordQi: SceneRenderer = {
  type: 'sword-qi' as SceneType,
  name: '剑气纵横',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const palette = getTimePalette(params.timeOfDay)
    const seed = params.seed

    // 暗色天空底
    const darkSky = {
      stops: [
        { position: 0, color: color(5, 5, 20) },
        { position: 0.6, color: color(15, 10, 35) },
        { position: 1, color: color(25, 20, 50) },
      ],
    }
    drawSkyGradient(ctx, w, h, darkSky)
    const starDensity = Math.round(150 * getVariationMultiplier(seed, 10, params.variationFactor))
    drawStars(ctx, w, h, starDensity, seed, 0.5)

    // 地面
    ctx.beginPath()
    for (let x = 0; x < w; x += 3) {
      const gy = h * 0.7 + fbm2D(x * 0.004, 0, { octaves: 5, seed: seed + 999, lacunarity: 2, gain: 0.5 }) * h * 0.15
      if (x === 0) ctx.moveTo(x, gy)
      else ctx.lineTo(x, gy)
    }
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fillStyle = '#050510'
    ctx.fill()

    // 剑气能量流 — 使用贝塞尔曲线 + 噪声扰动
    const swordCount = 4 + Math.floor(gradientNoise2D(seed * 0.1, 0, seed + 555) * 3)

    for (let s = 0; s < swordCount; s++) {
      const sx = valueNoise2D(s * 0.5, seed + 666, seed + s) * w
      const sy = valueNoise2D(s * 0.5, seed + 777, seed + s) * h * 0.5 + h * 0.1

      const qiColors = [
        color(100, 220, 255, 0.7),  // 冰蓝剑气
        color(255, 200, 100, 0.6),  // 金焰剑气
        color(200, 100, 255, 0.6),  // 紫雷剑气
        color(255, 100, 150, 0.5),  // 赤炎剑气
        color(100, 255, 180, 0.6),  // 青木剑气
      ]

      const qiColor = qiColors[s % qiColors.length]
      const trailLength = 100 + Math.random() * 200

      // 主剑痕
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      for (let t = 0; t < trailLength; t += 2) {
        const progress = t / trailLength
        const nx = sx + Math.cos(progress * Math.PI * 3 + s) * w * 0.4
          + gradientNoise2D(t * 0.05, s * 0.5, seed + 888) * w * 0.3
        const ny = sy + progress * h * 0.6
          + Math.sin(progress * Math.PI * 2 + s * 2) * h * 0.15

        const lineAlpha = (1 - progress) * 0.6 * ((qiColor.a ?? 1) / 1)
        const lineWidth = (1 - progress) * 4 + 1

        // 光晕
        drawGlow(ctx, nx, ny, lineWidth * 8, {
          r: qiColor.r, g: qiColor.g, b: qiColor.b, a: lineAlpha * 0.4,
        }, 0.5)

        // 主线
        ctx.strokeStyle = `rgba(${qiColor.r},${qiColor.g},${qiColor.b},${lineAlpha})`
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        ctx.arc(nx, ny, lineWidth, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${qiColor.r},${qiColor.g},${qiColor.b},${lineAlpha})`
        ctx.fill()
      }

      // 剑气发散光芒
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2
        const rayLen = 50 + Math.random() * 150
        const rx = sx + Math.cos(angle) * rayLen
        const ry = sy + Math.sin(angle) * rayLen

        const rayGrad = ctx.createLinearGradient(sx, sy, rx, ry)
        rayGrad.addColorStop(0, `rgba(${qiColor.r},${qiColor.g},${qiColor.b},0.3)`)
        rayGrad.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.strokeStyle = rayGrad
        ctx.lineWidth = 1 + Math.random() * 2
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(rx, ry)
        ctx.stroke()
      }

      ctx.restore()
    }

    // 外周灵力粒子旋转
    const cx = w * 0.5
    const cy = h * 0.35
    for (let i = 0; i < params.qiDensity * 300; i++) {
      const angle = (i / (params.qiDensity * 300)) * Math.PI * 8
        + gradientNoise2D(i * 0.1, seed + 1000, seed) * Math.PI
      const radius = w * 0.2 + gradientNoise2D(i * 0.1, seed + 2000, seed) * w * 0.3
      const px = cx + Math.cos(angle) * radius
      const py = cy + Math.sin(angle) * radius * 0.6
      const particleAlpha = 0.15 + gradientNoise2D(i * 0.1, seed + 3000, seed) * 0.3

      ctx.fillStyle = `rgba(180,200,255,${particleAlpha})`
      ctx.beginPath()
      ctx.arc(px, py, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // 中心能量漩涡
    drawGlow(ctx, cx, cy, w * 0.15, color(100, 200, 255, 0.3), 1)

    drawVignette(ctx, w, h, 0.5)
  },
}
