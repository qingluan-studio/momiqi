// ============================================================
// 丹炉炼火 — 丹炉 + 烈焰 + 丹气升腾
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawVignette, drawGlow, hex, fbm2D,
  gradientNoise2D, valueNoise2D, drawGodRays, applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const alchemyFurnace: SceneRenderer = {
  type: 'alchemy-furnace' as SceneType,
  name: '丹炉炼火',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const seed = params.seed

    // 暗红背景
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.8)
    bgGrad.addColorStop(0, '#1a0a05')
    bgGrad.addColorStop(0.4, '#0d0502')
    bgGrad.addColorStop(1, '#050201')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    // 丹炉位置
    const furnaceX = w * 0.5
    const furnaceY = h * 0.55
    const furnaceR = Math.min(w, h) * 0.15

    // 炉火光芒
    drawGlow(ctx, furnaceX, furnaceY, furnaceR * 2, {
      r: 255, g: 120, b: 30, a: 0.4,
    }, 0.8)
    drawGlow(ctx, furnaceX, furnaceY, furnaceR * 3.5, {
      r: 255, g: 80, b: 20, a: 0.2,
    }, 0.5)

    // 火焰粒子上升
    for (let i = 0; i < Math.round(200 * getVariationMultiplier(params.seed, 10, params.variationFactor)); i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * furnaceR * 0.5
      const fx = furnaceX + Math.cos(angle) * dist
      const fy = furnaceY - Math.random() * furnaceR * 2 - dist * 0.5

      const t = fy / (furnaceY - furnaceR * 2)
      const flameAlpha = Math.max(0, (1 - Math.abs(t - 0.5) * 2)) * 0.4

      ctx.fillStyle = `rgba(255,${Math.floor(150 + Math.random() * 105)},${Math.floor(Math.random() * 60)},${flameAlpha})`
      ctx.beginPath()
      ctx.arc(fx, fy, 1 + Math.random() * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // 丹炉主体
    ctx.save()

    // 炉身
    const bodyGrad = ctx.createLinearGradient(furnaceX - furnaceR, 0, furnaceX + furnaceR, 0)
    bodyGrad.addColorStop(0, '#2a1a10')
    bodyGrad.addColorStop(0.3, '#4a3020')
    bodyGrad.addColorStop(0.5, '#5a3830')
    bodyGrad.addColorStop(0.7, '#4a3020')
    bodyGrad.addColorStop(1, '#2a1a10')

    ctx.beginPath()
    ctx.ellipse(furnaceX, furnaceY, furnaceR, furnaceR * 0.7, 0, 0, Math.PI * 2)
    ctx.fillStyle = bodyGrad
    ctx.fill()
    ctx.strokeStyle = '#6a4a30'
    ctx.lineWidth = 2
    ctx.stroke()

    // 炉盖
    ctx.beginPath()
    ctx.moveTo(furnaceX - furnaceR * 0.7, furnaceY - furnaceR * 0.5)
    ctx.quadraticCurveTo(furnaceX, furnaceY - furnaceR * 1.2, furnaceX + furnaceR * 0.7, furnaceY - furnaceR * 0.5)
    ctx.quadraticCurveTo(furnaceX + furnaceR * 0.3, furnaceY - furnaceR * 0.3, furnaceX, furnaceY - furnaceR * 0.25)
    ctx.quadraticCurveTo(furnaceX - furnaceR * 0.3, furnaceY - furnaceR * 0.3, furnaceX - furnaceR * 0.7, furnaceY - furnaceR * 0.5)
    ctx.closePath()
    ctx.fillStyle = '#3a2525'
    ctx.fill()
    ctx.strokeStyle = '#5a3a30'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 炉盖宝珠
    const orbX = furnaceX
    const orbY = furnaceY - furnaceR * 0.95
    drawGlow(ctx, orbX, orbY, furnaceR * 0.2, {
      r: 255, g: 200, b: 100, a: 0.8,
    }, 1)
    ctx.fillStyle = '#ffcc44'
    ctx.beginPath()
    ctx.arc(orbX, orbY, furnaceR * 0.06, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // 丹气上升 (彩色烟雾)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < Math.round(50 * getVariationMultiplier(params.seed, 20, params.variationFactor)); i++) {
      const dx = furnaceX + gradientNoise2D(i * 0.2, seed + 100, seed) * furnaceR * 1.5 - furnaceR * 0.75
      const dy = furnaceY - furnaceR * 0.5 - i * 3
      const dalph = 0.02 + (1 - i / 50) * 0.06

      const danColors = [
        `rgba(255,200,100,${dalph})`,   // 金色丹气
        `rgba(200,150,255,${dalph})`,   // 紫色丹气
        `rgba(100,200,255,${dalph})`,   // 蓝色丹气
      ]

      ctx.fillStyle = danColors[Math.floor(gradientNoise2D(i * 0.2, seed + 200, seed) * 3)]
      ctx.beginPath()
      ctx.arc(dx, dy, 8 + Math.random() * 12, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()

    // 丹炉底座火焰纹
    ctx.strokeStyle = 'rgba(255,150,50,0.4)'
    ctx.lineWidth = 2
    ctx.shadowColor = 'rgba(255,100,30,0.6)'
    ctx.shadowBlur = 10

    const flamePatterns = Math.round(5 * getVariationMultiplier(params.seed, 30, params.variationFactor))
    for (let f = 0; f < flamePatterns; f++) {
      const angle = (f / flamePatterns) * Math.PI * 2
      const fx = furnaceX + Math.cos(angle) * furnaceR * 0.85
      const fy = furnaceY + Math.sin(angle) * furnaceR * 0.5

      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.quadraticCurveTo(fx + 5, fy + 15, fx, fy + 30)
      ctx.stroke()
    }
    ctx.shadowBlur = 0

    // 周围环境
    const floorGrad = ctx.createLinearGradient(0, h * 0.7, 0, h)
    floorGrad.addColorStop(0, 'rgba(0,0,0,0)')
    floorGrad.addColorStop(1, 'rgba(10,5,2,0.9)')
    ctx.fillStyle = floorGrad
    ctx.fillRect(0, h * 0.7, w, h * 0.3)

    drawVignette(ctx, w, h, 0.6)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
  },
}
