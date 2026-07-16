// ============================================================
// 洞府秘境 — 灵石洞府 + 宝光 + 灵脉
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawVignette, drawGlow, hex, fbm2D,
  gradientNoise2D, valueNoise2D, applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const mysticCave: SceneRenderer = {
  type: 'mystic-cave' as SceneType,
  name: '洞府秘境',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const seed = params.seed

    // 暗调岩壁背景
    const caveBg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8)
    caveBg.addColorStop(0, '#1a1525')
    caveBg.addColorStop(0.5, '#0d0a18')
    caveBg.addColorStop(1, '#050510')
    ctx.fillStyle = caveBg
    ctx.fillRect(0, 0, w, h)

    // 洞顶钟乳石
    for (let i = 0; i < Math.round(15 * getVariationMultiplier(params.seed, 10, params.variationFactor)); i++) {
      const sx = w * 0.1 + valueNoise2D(i * 0.2, seed + 100, seed) * w * 0.8
      const slen = 40 + valueNoise2D(i * 0.2, seed + 200, seed) * 80
      const sw = 4 + valueNoise2D(i * 0.2, seed + 300, seed) * 8

      ctx.beginPath()
      ctx.moveTo(sx - sw, 0)
      ctx.quadraticCurveTo(sx - 2, slen * 0.5, sx, slen)
      ctx.quadraticCurveTo(sx + 2, slen * 0.5, sx + sw, 0)
      ctx.closePath()

      const stalGrad = ctx.createLinearGradient(0, 0, 0, slen)
      stalGrad.addColorStop(0, '#1a1530')
      stalGrad.addColorStop(0.5, '#252040')
      stalGrad.addColorStop(1, '#302a50')
      ctx.fillStyle = stalGrad
      ctx.fill()
    }

    // 水晶簇 / 灵石
    const crystalCount = Math.round(8 * getVariationMultiplier(params.seed, 20, params.variationFactor))
    for (let i = 0; i < crystalCount; i++) {
      const cx = w * 0.15 + valueNoise2D(i * 0.2, seed + 400, seed) * w * 0.7
      const cy = h * 0.4 + valueNoise2D(i * 0.2, seed + 500, seed) * h * 0.4
      const cs = 15 + valueNoise2D(i * 0.2, seed + 600, seed) * 25

      // 光芒
      const crystalColors = [
        color(100, 200, 255, 0.5),   // 冰蓝
        color(200, 150, 255, 0.5),   // 紫晶
        color(150, 255, 200, 0.5),   // 翡翠
        color(255, 200, 150, 0.5),   // 金晶
      ]
      const cc = crystalColors[i % crystalColors.length]
      drawGlow(ctx, cx, cy, cs * 2.5, cc, 0.7)

      // 晶体形状 (六边形)
      ctx.fillStyle = hex({ ...cc, a: 0.6 })
      ctx.beginPath()
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2 - Math.PI / 2
        const px = cx + Math.cos(angle) * cs
        const py = cy + Math.sin(angle) * cs * 1.3
        if (j === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()

      // 反光面
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + cs * 0.5, cy - cs * 0.6)
      ctx.lineTo(cx + cs * 0.3, cy)
      ctx.closePath()
      ctx.fill()
    }

    // 灵脉流淌 (发光线)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    const veinCount = Math.round(5 * getVariationMultiplier(params.seed, 30, params.variationFactor))
    for (let v = 0; v < veinCount; v++) {
      const startX = valueNoise2D(v * 0.3, seed + 700, seed) * w
      const startY = valueNoise2D(v * 0.3, seed + 800, seed) * h
      const veinColor = [
        color(100, 180, 255, 0.6),
        color(180, 120, 255, 0.5),
        color(100, 255, 180, 0.5),
      ]

      ctx.strokeStyle = hex(veinColor[v % 3])
      ctx.lineWidth = 2 + Math.random() * 2
      ctx.shadowColor = hex({ ...veinColor[v % 3], a: 0.6 })
      ctx.shadowBlur = 10

      ctx.beginPath()
      ctx.moveTo(startX, startY)

      const steps = 8
      let vx = startX
      let vy = startY
      for (let s = 0; s < steps; s++) {
        vx += gradientNoise2D(s * 0.5, v * 10 + s, seed + 900) * 60 - 30
        vy = Math.min(h * 0.9, vy + 20 + Math.random() * 30)
        ctx.lineTo(vx, vy)
      }

      ctx.stroke()
    }

    ctx.shadowBlur = 0
    ctx.restore()

    // 地面反光
    const floorGrad = ctx.createLinearGradient(0, h * 0.65, 0, h)
    floorGrad.addColorStop(0, 'rgba(0,0,0,0)')
    floorGrad.addColorStop(0.3, 'rgba(20,30,60,0.3)')
    floorGrad.addColorStop(1, 'rgba(5,5,15,0.8)')
    ctx.fillStyle = floorGrad
    ctx.fillRect(0, h * 0.65, w, h * 0.35)

    // 漂浮灵气粒子
    for (let i = 0; i < params.qiDensity * 150; i++) {
      const qx = Math.random() * w
      const qy = Math.random() * h
      const qb = gradientNoise2D(i * 0.1, seed + 1000, seed) * 0.5

      if (qb > 0.3) {
        ctx.fillStyle = `rgba(150,200,255,${qb * 0.4})`
        ctx.shadowColor = `rgba(100,180,255,${qb * 0.5})`
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.arc(qx, qy, qb * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.shadowBlur = 0

    drawVignette(ctx, w, h, 0.6)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
  },
}
