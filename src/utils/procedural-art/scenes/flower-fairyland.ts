// ============================================================
// 花海仙境 — 樱花灵树 + 花海 + 蝶舞
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawSkyGradient, drawVignette, drawGlow, drawGodRays,
  getTimePalette, hex, gradientNoise2D, fbm2D, valueNoise2D,
  drawFogLayer, drawStars, applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const flowerFairyland: SceneRenderer = {
  type: 'flower-fairyland' as SceneType,
  name: '花海仙境',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const palette = getTimePalette(params.timeOfDay)
    const seed = params.seed

    // 柔和天空
    const fairySky = {
      stops: [
        { position: 0, color: color(80, 120, 200) },
        { position: 0.4, color: color(180, 180, 230) },
        { position: 0.7, color: color(255, 200, 180) },
        { position: 1, color: color(240, 200, 200) },
      ],
    }
    drawSkyGradient(ctx, w, h, fairySky)

    // 远山
    for (let i = 0; i < Math.round(3 * getVariationMultiplier(params.seed, 10, params.variationFactor)); i++) {
      const mx = (i / 3) * w + (gradientNoise2D(i * 0.5, seed + 100, seed) - 0.5) * w * 0.15
      const mh = h * 0.2
      const mw = w * 0.4

      ctx.fillStyle = `rgba(180,${150 + i * 20},200,0.3)`
      ctx.beginPath()
      ctx.moveTo(mx, h * 0.55)
      for (let x = mx; x <= mx + mw; x += 3) {
        const nx = (x - mx) / mw
        const y = h * 0.55 - Math.sin(nx * Math.PI) * mh
          - fbm2D(x * 0.005, 0, { octaves: 3, seed: seed + i * 999 }) * mh * 0.5
        ctx.lineTo(x, y)
      }
      ctx.lineTo(mx + mw, h * 0.55)
      ctx.closePath()
      ctx.fill()
    }

    // 花海地面
    for (let x = 0; x < w; x += 3) {
      const groundY = h * 0.55 + fbm2D(x * 0.004, 0, {
        octaves: 4, seed: seed + 200, lacunarity: 2, gain: 0.5,
      }) * h * 0.05

      const flowerH = 15 + gradientNoise2D(x * 0.1, seed + 300, seed) * 10

      // 花杆
      ctx.strokeStyle = '#2a6a2a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, groundY)
      ctx.lineTo(x, groundY - flowerH)
      ctx.stroke()

      // 花朵
      const flowerColors = [
        'rgba(255,150,200,0.7)',
        'rgba(255,200,150,0.7)',
        'rgba(200,150,255,0.7)',
        'rgba(255,255,200,0.6)',
        'rgba(150,200,255,0.7)',
      ]
      const fc = flowerColors[Math.floor(gradientNoise2D(x * 0.1, seed + 400, seed) * flowerColors.length)]

      ctx.fillStyle = fc
      ctx.shadowColor = fc.replace('0.7', '0.3').replace('0.6', '0.3')
      ctx.shadowBlur = 3
      ctx.beginPath()
      ctx.arc(x, groundY - flowerH, 4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0

    // 地面底色
    ctx.fillStyle = 'rgba(30,60,30,0.4)'
    ctx.fillRect(0, h * 0.55, w, h * 0.45)

    // 灵树
    const treeX = w * 0.35
    const treeY = h * 0.5
    const treeH = h * 0.3

    // 树干
    ctx.strokeStyle = '#4a3020'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(treeX, treeY + treeH)
    ctx.quadraticCurveTo(treeX + 5, treeY + treeH * 0.5, treeX + 3, treeY)
    ctx.stroke()

    // 树枝
    for (let b = 0; b < 5; b++) {
      const bx = treeX + (b - 2) * 30
      const by = treeY + treeH * (0.3 + b * 0.12)
      const branchLen = 40 + Math.random() * 30
      const bangle = (b - 2) * 0.6 - Math.PI / 2

      ctx.strokeStyle = '#4a3020'
      ctx.lineWidth = 2 + (4 - b) * 0.5
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + Math.cos(bangle) * branchLen, by + Math.sin(bangle) * branchLen)
      ctx.stroke()
    }

    // 树冠 (粉色小花)
    for (let c = 0; c < Math.round(300 * getVariationMultiplier(params.seed, 20, params.variationFactor)); c++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.random() * w * 0.12
      const cx = treeX + Math.cos(a) * d
      const cy = treeY + Math.sin(a) * d * 0.7 - treeH * 0.2

      const petalAlpha = 0.4 + Math.random() * 0.3

      ctx.fillStyle = `rgba(${240 + Math.floor(Math.random() * 15)},${150 + Math.floor(Math.random() * 50)},${180 + Math.floor(Math.random() * 40)},${petalAlpha})`
      ctx.beginPath()
      ctx.arc(cx, cy, 2 + Math.random() * 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // 树下光晕
    drawGlow(ctx, treeX, treeY, w * 0.15, { r: 255, g: 200, b: 220, a: 0.2 }, 0.6)

    // 花瓣飘落
    for (let i = 0; i < Math.round(60 * getVariationMultiplier(params.seed, 30, params.variationFactor)); i++) {
      const px = treeX + (Math.random() - 0.5) * w * 0.3
      const py = treeY - treeH * 0.2 + Math.random() * treeH * 0.5
      const psize = 1.5 + Math.random() * 2

      ctx.fillStyle = `rgba(255,${180 + Math.floor(Math.random() * 40)},${190 + Math.floor(Math.random() * 40)},0.5)`
      ctx.beginPath()
      ctx.ellipse(px, py, psize, psize * 0.5, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }

    // 灵气光点
    for (let i = 0; i < params.qiDensity * 200; i++) {
      const qx = Math.random() * w
      const qy = Math.random() * h * 0.7
      const qb = gradientNoise2D(i * 0.1, seed + 500, seed) * 0.6

      if (qb > 0.35) {
        ctx.fillStyle = `rgba(255,220,255,${qb * 0.35})`
        ctx.shadowColor = `rgba(255,200,255,${qb * 0.4})`
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(qx, qy, qb * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.shadowBlur = 0

    drawVignette(ctx, w, h, 0.25)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
  },
}
