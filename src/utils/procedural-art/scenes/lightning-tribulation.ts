// ============================================================
// 雷劫降临 — 天雷滚滚 + 闪电 + 暗云压顶
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawSkyGradient, drawVignette, drawGlow,
  hex, fbm2D, gradientNoise2D, valueNoise2D,
  applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const lightningTribulation: SceneRenderer = {
  type: 'lightning-tribulation' as SceneType,
  name: '雷劫降临',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const seed = params.seed

    // 压抑天空
    const stormSky = {
      stops: [
        { position: 0, color: color(5, 5, 15) },
        { position: 0.3, color: color(15, 10, 30) },
        { position: 0.5, color: color(30, 20, 50) },
        { position: 1, color: color(40, 30, 55) },
      ],
    }
    drawSkyGradient(ctx, w, h, stormSky)

    // 雷云
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    const cloudCount = Math.round(8 * getVariationMultiplier(params.seed, 10, params.variationFactor))
    for (let c = 0; c < cloudCount; c++) {
      const cx = (c / cloudCount) * w
      const cy = h * 0.15 + gradientNoise2D(c * 0.5, seed + 100, seed) * h * 0.2
      const cw = w * 0.2 + gradientNoise2D(c * 0.5, seed + 200, seed) * w * 0.15

      for (let y = cy; y < cy + h * 0.4; y += 2) {
        const t = (y - cy) / (h * 0.4)
        const alpha = (1 - t * t) * 0.15

        for (let x = cx - cw; x < cx + cw; x += 2) {
          const noiseVal = fbm2D(x * 0.01, y * 0.01, {
            octaves: 3, lacunarity: 3, gain: 0.4, seed: seed + c * 999,
          })

          if (noiseVal > 0.45) {
            const cloudAlpha = (noiseVal - 0.45) * alpha
            ctx.fillStyle = `rgba(30,25,50,${cloudAlpha})`
            ctx.fillRect(x, y, 2, 2)
          }
        }
      }
    }
    ctx.restore()

    // 闪电
    const lightningCount = Math.round((3 + Math.floor(valueNoise2D(seed * 0.1, seed + 300, seed) * 4)) * getVariationMultiplier(params.seed, 20, params.variationFactor))

    for (let l = 0; l < lightningCount; l++) {
      const lx = valueNoise2D(l * 0.3, seed + 400, seed + l) * w
      const ly = h * 0.1 + valueNoise2D(l * 0.3, seed + 500, seed + l) * h * 0.15
      const endY = h * 0.6 + valueNoise2D(l * 0.3, seed + 600, seed + l) * h * 0.25

      drawLightning(ctx, lx, ly, endY, lx, seed + l * 1000)

      // 闪电照亮周围
      drawGlow(ctx, lx, ly, w * 0.3, { r: 200, g: 200, b: 255, a: 0.15 }, 0.4)
    }

    // 地面
    const groundY = h * 0.75
    ctx.beginPath()
    for (let x = 0; x < w; x += 3) {
      const gy = groundY + fbm2D(x * 0.005, 0, {
        octaves: 5, seed: seed + 700, lacunarity: 2, gain: 0.5,
      }) * h * 0.08

      if (x === 0) ctx.moveTo(x, gy)
      else ctx.lineTo(x, gy)
    }
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()

    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h)
    groundGrad.addColorStop(0, '#151020')
    groundGrad.addColorStop(1, '#080810')
    ctx.fillStyle = groundGrad
    ctx.fill()

    // 灵气漩涡 (渡劫者位置)
    const tribulationX = w * 0.5
    const tribulationY = h * 0.7

    // 灵力罩
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = 30 + ring * 20
      const ringAlpha = 0.3 - ring * 0.08

      ctx.strokeStyle = `rgba(150,200,255,${ringAlpha})`
      ctx.lineWidth = 2 - ring * 0.3
      ctx.beginPath()
      ctx.arc(tribulationX, tribulationY, ringRadius, 0, Math.PI * 2)
      ctx.stroke()

      // 旋转光线
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + params.seed * 0.1
        const rx = tribulationX + Math.cos(angle) * ringRadius
        const ry = tribulationY + Math.sin(angle) * ringRadius

        ctx.fillStyle = `rgba(200,230,255,${ringAlpha * 0.5})`
        ctx.beginPath()
        ctx.arc(rx, ry, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()

    // 中心光柱
    drawGlow(ctx, tribulationX, tribulationY, 60, { r: 255, g: 255, b: 255, a: 0.25 }, 1)

    // 散射雷电粒子
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2
      const distance = 30 + valueNoise2D(i * 0.1, seed + 800, seed) * 40
      const px = tribulationX + Math.cos(angle) * distance
      const py = tribulationY + Math.sin(angle) * distance * 0.7

      ctx.fillStyle = `rgba(180,200,255,0.4)`
      ctx.beginPath()
      ctx.arc(px, py, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    drawVignette(ctx, w, h, 0.5)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
  },
}

function drawLightning(
  ctx: CanvasRenderingContext2D,
  startX: number, startY: number,
  endY: number, endX: number, seed: number,
): void {
  const segments = 8 + Math.floor(gradientNoise2D(seed * 0.1, 0, seed) * 6)
  let cx = startX
  let cy = startY

  // 主闪电
  ctx.strokeStyle = 'rgba(200,200,255,0.9)'
  ctx.lineWidth = 3
  ctx.shadowColor = 'rgba(180,180,255,0.8)'
  ctx.shadowBlur = 15

  ctx.beginPath()
  ctx.moveTo(cx, cy)

  const segmentHeight = (endY - startY) / segments
  for (let s = 1; s <= segments; s++) {
    const xOffset = gradientNoise2D(s * 0.5, seed + s * 100, seed) * 30 - 15
    cx = endX + xOffset
    cy = startY + segmentHeight * s
    ctx.lineTo(cx, cy)
  }

  ctx.stroke()
  ctx.shadowBlur = 0

  // 分支闪电
  const branchCount = 2 + Math.floor(gradientNoise2D(seed * 0.2, 100, seed) * 3)
  for (let b = 0; b < branchCount; b++) {
    const splitY = startY + (endY - startY) * (0.3 + b * 0.2)
    const splitX = endX + gradientNoise2D(b * 0.5, seed + b * 200, seed) * 20 - 10

    ctx.strokeStyle = 'rgba(180,180,255,0.5)'
    ctx.lineWidth = 1.5
    ctx.shadowColor = 'rgba(150,150,255,0.4)'
    ctx.shadowBlur = 8

    ctx.beginPath()
    ctx.moveTo(splitX, splitY)

    const branchSegments = 3
    let bx = splitX
    let by = splitY
    for (let s = 1; s <= branchSegments; s++) {
      bx += gradientNoise2D(s * 0.8, seed + b * 300 + s, seed) * 40 - 20
      by += (endY - splitY) / branchSegments
      ctx.lineTo(bx, by)
    }
    ctx.stroke()
  }
  ctx.shadowBlur = 0
}
