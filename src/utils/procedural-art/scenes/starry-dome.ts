// ============================================================
// 星辰天穹 — 银河星空 + 极光 + 流星
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawSkyGradient, drawVignette, drawGlow,
  getTimePalette, hex, fbm2D, gradientNoise2D, valueNoise2D,
  applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const starryDome: SceneRenderer = {
  type: 'starry-dome' as SceneType,
  name: '星辰天穹',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const seed = params.seed

    // 深空背景
    const deepSky = {
      stops: [
        { position: 0, color: color(2, 2, 15) },
        { position: 0.5, color: color(5, 5, 30) },
        { position: 1, color: color(15, 10, 40) },
      ],
    }
    drawSkyGradient(ctx, w, h, deepSky)

    // 银河带
    ctx.save()
    for (let y = 0; y < h; y += 2) {
      const galaxyBase = Math.sin(y * 0.003 + seed * 0.1) * w * 0.3 + w * 0.5
      const galaxyWidth = w * 0.15 * (0.5 + 0.5 * Math.sin(y * 0.002))

      for (let x = Math.floor(galaxyBase - galaxyWidth); x < Math.ceil(galaxyBase + galaxyWidth); x += 2) {
        const dist = Math.abs(x - galaxyBase) / galaxyWidth
        const galaxyAlpha = (1 - dist * dist) * 0.08
          * (0.7 + 0.3 * gradientNoise2D(x * 0.02, y * 0.02, seed + 5555))

        if (galaxyAlpha > 0.005) {
          ctx.fillStyle = `rgba(150,180,255,${galaxyAlpha})`
          ctx.fillRect(x, y, 2, 2)
        }
      }
    }
    ctx.restore()

    // 星云斑斓
    const nebulaCount = Math.round(15 * getVariationMultiplier(seed, 10, params.variationFactor))
    for (let i = 0; i < nebulaCount; i++) {
      const nx = valueNoise2D(i * 0.1, seed, seed + 10000) * w
      const ny = valueNoise2D(i * 0.1, seed + 20000, seed + 10000) * h
      const ns = 40 + valueNoise2D(i * 0.1, seed + 30000, seed + 10000) * 80

      const nebulaColors = [
        color(180, 100, 255, 0.06),
        color(100, 180, 255, 0.05),
        color(255, 100, 180, 0.04),
        color(100, 255, 200, 0.04),
      ]

      drawGlow(ctx, nx, ny, ns, nebulaColors[i % 4], 0.6)
    }

    // 星星
    const starCount = Math.round(500 * getVariationMultiplier(seed, 20, params.variationFactor))
    for (let i = 0; i < starCount; i++) {
      const sx = valueNoise2D(i * 0.1, seed + 40000, seed) * w
      const sy = valueNoise2D(i * 0.1, seed + 50000, seed) * h
      const sb = valueNoise2D(i * 0.1, seed + 60000, seed)
      const ss = sb * 2.5

      if (sb > 0.25) {
        ctx.globalAlpha = sb * 0.8
        ctx.fillStyle = sb > 0.7 ? 'white' : `rgba(200,220,255,${sb})`
        ctx.beginPath()
        ctx.arc(sx, sy, ss, 0, Math.PI * 2)
        ctx.fill()

        // 大星星有光晕
        if (sb > 0.8) {
          drawGlow(ctx, sx, sy, ss * 6, color(255, 255, 255, 0.3), 0.5)
        }

        // 彩色星星
        if (sb > 0.6 && sb <= 0.8) {
          const starColor = sb > 0.75
            ? color(255, 200, 150, sb * 0.4)
            : color(180, 200, 255, sb * 0.3)
          drawGlow(ctx, sx, sy, ss * 4, starColor, 0.4)
        }
      }
    }
    ctx.globalAlpha = 1

    // 流星
    const meteorCount = 3 + Math.floor(valueNoise2D(seed * 0.1, seed + 70000, seed) * 5)
    for (let i = 0; i < meteorCount; i++) {
      const mx = valueNoise2D(i * 0.3, seed + 80000, seed + i) * w
      const my = valueNoise2D(i * 0.3, seed + 90000, seed + i) * h * 0.5
      const angle = -Math.PI / 4 + (valueNoise2D(i * 0.3, seed + 100000, seed + i) - 0.5) * 0.4
      const length = 40 + Math.random() * 80

      const grad = ctx.createLinearGradient(mx, my, mx + Math.cos(angle) * length, my + Math.sin(angle) * length)
      grad.addColorStop(0, 'rgba(255,255,255,0.9)')
      grad.addColorStop(0.2, 'rgba(255,255,255,0.5)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')

      ctx.strokeStyle = grad
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(mx, my)
      ctx.lineTo(mx + Math.cos(angle) * length, my + Math.sin(angle) * length)
      ctx.stroke()
    }

    // 地面剪影
    const groundY = h * 0.8
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x < w; x += 4) {
      const gy = groundY + fbm2D(x * 0.005, 0, {
        octaves: 4, lacunarity: 2, gain: 0.5, seed: seed + 12345,
      }) * h * 0.1
      ctx.lineTo(x, gy)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = '#080815'
    ctx.fill()

    applyStylePostProcess(ctx, w, h, params.style, params.seed)
    drawVignette(ctx, w, h, 0.45)
  },
}
