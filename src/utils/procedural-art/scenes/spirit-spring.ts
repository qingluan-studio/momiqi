// ============================================================
// 灵泉幽谷 — 瀑布 + 灵泉 + 幽谷森林
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawSkyGradient, drawVignette, drawGlow, drawGodRays,
  getTimePalette, hex, gradientNoise2D, fbm2D, valueNoise2D,
  drawFogLayer, drawStars, applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const spiritSpring: SceneRenderer = {
  type: 'spirit-spring' as SceneType,
  name: '灵泉幽谷',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const palette = getTimePalette(params.timeOfDay)
    const seed = params.seed

    // 天空
    drawSkyGradient(ctx, w, h, palette.skyGradient)
    if (palette.starDensity > 0) {
      drawStars(ctx, w, h, palette.starDensity * 0.5, seed, 0.5)
    }

    // 太阳光柱透过山谷
    const sunX = w * 0.65
    const sunY = h * 0.1
    drawGlow(ctx, sunX, sunY, w * 0.3, palette.horizonGlow, 0.5)
    drawGodRays(ctx, w, h, sunX, sunY + h * 0.05, 10, { r: 255, g: 240, b: 200, a: 0.12 })

    // 远景山谷轮廓
    const valleyLeft: [number, number][] = []
    const valleyRight: [number, number][] = []

    for (let y = 0; y < h; y += 2) {
      const t = y / h
      const valleyWidth = w * (0.15 + t * 0.3 + Math.sin(t * Math.PI * 2) * 0.05)
      const centerX = w * 0.5

      const leftEdge = centerX - valleyWidth / 2
        + gradientNoise2D(y * 0.02, 0, seed + 100) * w * 0.05
      const rightEdge = centerX + valleyWidth / 2
        + gradientNoise2D(y * 0.02, 100, seed + 100) * w * 0.05

      valleyLeft.push([leftEdge, y])
      valleyRight.push([rightEdge, y])
    }

    // 左侧山壁
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (const [x, y] of valleyLeft) ctx.lineTo(x, y)
    ctx.lineTo(0, 0)
    ctx.closePath()

    const leftGrad = ctx.createLinearGradient(0, 0, w * 0.4, 0)
    leftGrad.addColorStop(0, '#1a2a1a')
    leftGrad.addColorStop(0.5, '#2a3a2a')
    leftGrad.addColorStop(1, '#3a4a3a')
    ctx.fillStyle = leftGrad
    ctx.fill()

    // 右侧山壁
    ctx.beginPath()
    ctx.moveTo(w, h)
    for (const [x, y] of valleyRight) ctx.lineTo(x, y)
    ctx.lineTo(w, 0)
    ctx.closePath()

    const rightGrad = ctx.createLinearGradient(w, 0, w * 0.6, 0)
    rightGrad.addColorStop(0, '#1a2a1a')
    rightGrad.addColorStop(0.5, '#2a3a2a')
    rightGrad.addColorStop(1, '#3a4a3a')
    ctx.fillStyle = rightGrad
    ctx.fill()

    // 岩石纹理
    const rockCount = Math.round(30 * getVariationMultiplier(params.seed, 10, params.variationFactor))
    for (let i = 0; i < rockCount; i++) {
      const rx = valueNoise2D(i * 0.1, seed + 200, seed) * w * 0.3
      const ry = valueNoise2D(i * 0.1, seed + 300, seed) * h
      const rd = 20 + valueNoise2D(i * 0.2, seed + 400, seed) * 40

      ctx.fillStyle = `rgba(0,0,0,0.1)`
      ctx.beginPath()
      ctx.arc(rx, ry, rd, 0, Math.PI * 2)
      ctx.fill()
    }

    // 灵泉 — 谷底水面
    const poolY = h * 0.65
    const poolH = h * 0.25

    const poolGrad = ctx.createLinearGradient(0, poolY, 0, poolY + poolH)
    poolGrad.addColorStop(0, 'rgba(80,180,220,0.6)')
    poolGrad.addColorStop(0.3, 'rgba(40,120,180,0.7)')
    poolGrad.addColorStop(0.6, 'rgba(20,60,120,0.8)')
    poolGrad.addColorStop(1, 'rgba(10,30,60,0.9)')

    ctx.beginPath()
    ctx.moveTo(w * 0.2, poolY)
    ctx.quadraticCurveTo(w * 0.5, poolY - 20, w * 0.8, poolY)
    ctx.lineTo(w * 0.85, poolY + poolH)
    ctx.quadraticCurveTo(w * 0.5, poolY + poolH + 15, w * 0.15, poolY + poolH)
    ctx.closePath()
    ctx.fillStyle = poolGrad
    ctx.fill()

    // 水面波光
    const shimmerCount = Math.round(200 * getVariationMultiplier(params.seed, 20, params.variationFactor))
    for (let i = 0; i < shimmerCount; i++) {
      const wx = w * 0.2 + Math.random() * w * 0.6
      const wy = poolY + Math.random() * poolH * 0.6
      const shimmer = Math.sin(wx * 0.1 + params.seed) * 0.3 + 0.5

      if (shimmer > 0.6) {
        ctx.fillStyle = `rgba(200,240,255,${shimmer * 0.3})`
        ctx.fillRect(wx, wy, 2, 2)
      }
    }

    // 灵气粒子从水面升起
    const qiCount = Math.round(params.qiDensity * 200 * getVariationMultiplier(params.seed, 30, params.variationFactor))
    for (let i = 0; i < qiCount; i++) {
      const qx = w * 0.25 + Math.random() * w * 0.5
      const qy = poolY - Math.random() * 100
      const qb = gradientNoise2D(i * 0.1, seed + 500, seed) * 0.7

      if (qb > 0.3) {
        ctx.fillStyle = `rgba(100,220,255,${qb * 0.4})`
        ctx.shadowColor = `rgba(100,200,255,${qb * 0.6})`
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(qx, qy, qb * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.shadowBlur = 0

    // 前景植物剪影
    const plantCount = Math.round(8 * getVariationMultiplier(params.seed, 40, params.variationFactor))
    for (let i = 0; i < plantCount; i++) {
      const px = valueNoise2D(i * 0.3, seed + 600, seed) * w
      const py = poolY + valueNoise2D(i * 0.3, seed + 700, seed) * poolH

      ctx.fillStyle = 'rgba(5,15,5,0.7)'
      for (let b = 0; b < 3; b++) {
        const branchAngle = -Math.PI / 2 + (b - 1) * 0.5
        const branchLen = 20 + Math.random() * 30
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(
          px + Math.cos(branchAngle) * branchLen,
          py + Math.sin(branchAngle) * branchLen
        )
        ctx.lineWidth = 2 + Math.random()
        ctx.strokeStyle = 'rgba(5,15,5,0.6)'
        ctx.stroke()
      }
    }

    drawFogLayer(ctx, w, h, palette.fogColor, params.atmosphere * 0.4, seed + 111)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
    drawVignette(ctx, w, h, 0.4)
  },
}
