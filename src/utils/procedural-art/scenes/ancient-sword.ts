// ============================================================
// 古剑遗迹 — 石中剑 + 荒古战场
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawSkyGradient, drawVignette, drawGlow, drawGodRays,
  getTimePalette, hex, gradientNoise2D, fbm2D, valueNoise2D,
  drawStars, drawFogLayer, applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const ancientSword: SceneRenderer = {
  type: 'ancient-sword' as SceneType,
  name: '古剑遗迹',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const palette = getTimePalette(params.timeOfDay)
    const seed = params.seed
    const isNight = params.timeOfDay === 'night' || params.timeOfDay === 'midnight'

    // 荒古天空
    const ancientSky = {
      stops: [
        { position: 0, color: isNight ? color(5, 5, 20) : color(100, 120, 180) },
        { position: 0.5, color: isNight ? color(20, 15, 40) : color(160, 170, 210) },
        { position: 1, color: isNight ? color(30, 20, 50) : color(200, 190, 200) },
      ],
    }
    drawSkyGradient(ctx, w, h, ancientSky)

    if (isNight) {
      drawStars(ctx, w, h, Math.round(200 * getVariationMultiplier(params.seed, 10, params.variationFactor)), seed, 0.7)
    }

    // 天光
    const lightX = w * 0.55
    const lightY = h * 0.15
    drawGlow(ctx, lightX, lightY, w * 0.35, {
      r: isNight ? 150 : 255,
      g: isNight ? 180 : 240,
      b: isNight ? 220 : 200,
      a: 0.25,
    }, 0.5)

    // 荒芜地面
    ctx.beginPath()
    for (let x = 0; x < w; x += 2) {
      const gy = h * 0.6 + fbm2D(x * 0.003, 0, {
        octaves: 6, seed: seed + 100, lacunarity: 2.2, gain: 0.5,
      }) * h * 0.2
        + gradientNoise2D(x * 0.01, 0, seed + 200) * h * 0.05

      if (x === 0) ctx.moveTo(x, gy)
      else ctx.lineTo(x, gy)
    }
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()

    const groundGrad = ctx.createLinearGradient(0, h * 0.6, 0, h)
    groundGrad.addColorStop(0, '#3a3020')
    groundGrad.addColorStop(0.5, '#2a1a15')
    groundGrad.addColorStop(1, '#1a0a08')
    ctx.fillStyle = groundGrad
    ctx.fill()

    // 岩石碎块
    for (let i = 0; i < Math.round(20 * getVariationMultiplier(params.seed, 20, params.variationFactor)); i++) {
      const rx = valueNoise2D(i * 0.2, seed + 300, seed) * w
      const ry = h * 0.6 + valueNoise2D(i * 0.2, seed + 400, seed) * h * 0.3
      const rr = 8 + valueNoise2D(i * 0.2, seed + 500, seed) * 20

      ctx.fillStyle = 'rgba(50,40,30,0.6)'
      ctx.beginPath()
      const vs = 5 + Math.floor(valueNoise2D(i * 0.2, seed + 600, seed) * 4)
      for (let v = 0; v < vs; v++) {
        const angle = (v / vs) * Math.PI * 2
        const dist = rr * (0.6 + valueNoise2D(v * 0.5, i, seed + 700) * 0.4)
        const px = rx + Math.cos(angle) * dist
        const py = ry + Math.sin(angle) * dist
        if (v === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
    }

    // 古剑
    const swordBaseX = w * 0.48
    const swordBaseY = h * 0.65
    const swordHeight = h * 0.35
    const swordWidth = 6

    ctx.save()

    // 剑身光晕
    drawGlow(ctx, swordBaseX, swordBaseY - swordHeight * 0.4, swordHeight * 0.5, {
      r: isNight ? 150 : 255,
      g: isNight ? 200 : 255,
      b: isNight ? 255 : 250,
      a: 0.3,
    }, 0.7)

    // 剑柄
    const hiltY = swordBaseY
    const hiltH = swordHeight * 0.15
    ctx.fillStyle = '#3a2020'
    ctx.fillRect(swordBaseX - swordWidth * 1.5, hiltY, swordWidth * 3, hiltH)

    // 剑格
    ctx.fillStyle = '#5a4a30'
    ctx.fillRect(swordBaseX - swordWidth * 3, hiltY - 4, swordWidth * 6, 8)

    // 剑身 (略微倾斜)
    ctx.save()
    ctx.translate(swordBaseX, hiltY)
    ctx.rotate(-0.15)

    // 剑刃
    const bladeGrad = ctx.createLinearGradient(-swordWidth * 0.5, 0, swordWidth * 0.5, 0)
    bladeGrad.addColorStop(0, '#8a9aaa')
    bladeGrad.addColorStop(0.2, '#c0d0e0')
    bladeGrad.addColorStop(0.5, '#e0e8f0')
    bladeGrad.addColorStop(0.8, '#c0d0e0')
    bladeGrad.addColorStop(1, '#8a8a9a')

    ctx.fillStyle = bladeGrad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-swordWidth * 0.3, -swordHeight * 0.6)
    ctx.lineTo(0, -swordHeight * 0.85)
    ctx.lineTo(swordWidth * 0.3, -swordHeight * 0.6)
    ctx.closePath()
    ctx.fill()

    // 剑脊中线
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -swordHeight * 0.8)
    ctx.stroke()

    // 剑尖星光
    drawGlow(ctx, 0, -swordHeight * 0.85, 20, {
      r: 255, g: 255, b: 255, a: 0.6,
    }, 1)

    ctx.restore()
    ctx.restore()

    // 剑鞘 / 石台裂缝
    ctx.strokeStyle = 'rgba(100,90,80,0.4)'
    ctx.lineWidth = 1
    for (let i = 0; i < Math.round(5 * getVariationMultiplier(params.seed, 30, params.variationFactor)); i++) {
      const cx = swordBaseX + (i - 2) * 30
      const cy = swordBaseY + 10
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + gradientNoise2D(i * 0.5, seed + 800, seed) * 40 - 20, cy + 30 + i * 10)
      ctx.stroke()
    }

    // 铭文光芒 (符文环绕)
    const runeCount = Math.round(8 * getVariationMultiplier(params.seed, 40, params.variationFactor))
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    
    for (let r = 0; r < runeCount; r++) {
      const angle = (r / runeCount) * Math.PI * 2 + seed * 0.05
      const runeRadius = swordHeight * 0.3
      const rx = swordBaseX + Math.cos(angle) * runeRadius
      const ry = swordBaseY - swordHeight * 0.3 + Math.sin(angle) * runeRadius * 0.6

      const runeAlpha = 0.3 + Math.sin(seed * 0.1 + r) * 0.2

      ctx.fillStyle = `rgba(200,220,255,${runeAlpha})`
      ctx.shadowColor = `rgba(180,200,255,${runeAlpha})`
      ctx.shadowBlur = 6

      // 简单符文符号
      ctx.beginPath()
      ctx.arc(rx, ry, 4, 0, Math.PI * 2)
      ctx.fill()

      // 符文线
      ctx.strokeStyle = `rgba(200,220,255,${runeAlpha * 0.5})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(rx, ry - 5)
      ctx.lineTo(rx, ry + 5)
      ctx.stroke()
    }

    ctx.shadowBlur = 0
    ctx.restore()

    drawVignette(ctx, w, h, 0.4)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
  },
}
