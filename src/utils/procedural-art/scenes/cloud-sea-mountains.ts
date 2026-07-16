// ============================================================
// 仙山云海 — 层叠山峰 + 云海翻涌
// ============================================================

import type { SceneParams, SceneRenderer, Palette } from '../types'
import { SceneType } from '../types'
import {
  color, hsl, hex, drawSkyGradient, drawVignette,
  drawGodRays, drawFogLayer, drawStars, getTimePalette,
  gradientAt, drawGlow, fbm2D, gradientNoise2D, ridgeFbm2D,
  applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const cloudSeaMountains: SceneRenderer = {
  type: 'cloud-sea-mountains' as SceneType,
  name: '仙山云海',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const palette = getTimePalette(params.timeOfDay)
    const seed = params.seed

    // 1. 天空
    drawSkyGradient(ctx, w, h, palette.skyGradient)
    if (palette.starDensity > 0) {
      drawStars(ctx, w, h, palette.starDensity, seed, 0.6)
    }

    // 2. 日月
    const sunX = w * 0.7
    const sunY = h * 0.2
    drawGlow(ctx, sunX, sunY, w * 0.4, palette.horizonGlow, 0.6)
    if (params.timeOfDay !== 'midnight') {
      drawGodRays(ctx, w, h, sunX, sunY, 6, palette.horizonGlow)
    }

    // 3. 远山 (大气散射)
    const farMountainCount = Math.round(5 * getVariationMultiplier(params.seed, 10, params.variationFactor))
    for (let m = 0; m < farMountainCount; m++) {
      const baseX = (m / farMountainCount) * w + (gradientNoise2D(m * 0.5, seed, seed) - 0.5) * w * 0.2
      const mountainH = h * (0.35 + gradientNoise2D(m * 0.5, seed + 1000, seed) * 0.15)
      const mountainW = w * (0.3 + gradientNoise2D(m * 0.5, seed + 2000, seed) * 0.15)

      const atmoFog = gradientAt(palette.skyGradient, 0.25 + (m / farMountainCount) * 0.3)
      atmoFog.a = 0.6 + (1 - m / farMountainCount) * 0.4

      drawMountainSilhouette(ctx, baseX, h, mountainW, mountainH, atmoFog, seed + m * 555, {
        octaves: 4, lacunarity: 1.8, gain: 0.6,
      })
    }

    // 4. 主山 (脊状噪声)
    const mainMountainW = w * 0.7
    const mainMountainH = h * 0.55
    const mainX = w * 0.15

    ctx.save()
    ctx.beginPath()
    const points: [number, number][] = []
    for (let px = 0; px <= w; px += 2) {
      const nx = (px - mainX) / mainMountainW
      if (nx >= 0 && nx <= 1) {
        const baseHeight = Math.sin(nx * Math.PI) * mainMountainH
        const detailHeight = ridgeFbm2D(px * 0.008, 0, {
          octaves: 6, lacunarity: 2.2, gain: 0.5, seed: seed + 777,
        }) * mainMountainH * 0.6
        const y = h - baseHeight - detailHeight
        points.push([px, y])
      }
    }

    if (points.length > 0) {
      ctx.moveTo(points[0][0], h)
      for (const [px, py] of points) {
        ctx.lineTo(px, py)
      }
      ctx.lineTo(points[points.length - 1][0], h)
      ctx.closePath()

      // 渐变色填充山体
      const mountainGrad = ctx.createLinearGradient(0, h - mainMountainH, 0, h)
      mountainGrad.addColorStop(0, '#3a2f5c')
      mountainGrad.addColorStop(0.4, '#2d4a3e')
      mountainGrad.addColorStop(0.7, '#1a3525')
      mountainGrad.addColorStop(1, '#0f2016')
      ctx.fillStyle = mountainGrad
      ctx.fill()

      // 山脊线高光
      ctx.strokeStyle = 'rgba(180,200,220,0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i][0], points[i][1])
        else ctx.lineTo(points[i][0], points[i][1])
      }
      ctx.stroke()
    }
    ctx.restore()

    // 5. 云海
    for (let layer = 0; layer < 3; layer++) {
      const cloudY = h * (0.6 + layer * 0.08)
      const cloudAlpha = 0.3 + layer * 0.15

      for (let px = 0; px < w; px += 4) {
        const cloudVal = fbm2D(px * 0.004, cloudY * 0.005 + layer * 2, {
          octaves: 5, lacunarity: 2.5, gain: 0.45, seed: seed + layer * 999,
        })

        if (cloudVal > 0.45) {
          const h2 = cloudVal * h * 0.12
          const cloudColor = `rgba(240,235,250,${cloudAlpha * (cloudVal - 0.4)})`
          ctx.fillStyle = cloudColor
          ctx.fillRect(px, cloudY - h2, 4, h2 * 2)
        }
      }
    }

    // 6. 灵气光点
    const qiCount = Math.round(params.qiDensity * 200 * getVariationMultiplier(params.seed, 20, params.variationFactor))
    for (let i = 0; i < qiCount; i++) {
      const qx = Math.random() * w
      const qy = Math.random() * h
      const qb = gradientNoise2D(i * 0.1, seed + 5000, seed) * 0.8
      if (qb > 0.5) {
        ctx.fillStyle = `rgba(180,220,255,${qb * 0.3})`
        ctx.beginPath()
        ctx.arc(qx, qy, qb * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 7. 后期
    drawFogLayer(ctx, w, h, palette.fogColor, params.atmosphere * 0.3, seed + 1111, 0.4)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
    drawVignette(ctx, w, h, 0.35)
  },
}

function drawMountainSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  mw: number, mh: number, color: { r: number; g: number; b: number; a?: number },
  seed: number,
  fbmConfig: { octaves: number; lacunarity: number; gain: number },
): void {
  ctx.beginPath()
  const startX = cx
  ctx.moveTo(startX, baseY)

  for (let x = startX; x <= startX + mw; x += 2) {
    const nx = (x - startX) / mw
    const base = Math.sin(nx * Math.PI) * mh
    const detail = fbm2D(x * 0.006, 0, { ...fbmConfig, seed }) * mh * 0.5
    ctx.lineTo(x, baseY - base - detail)
  }

  ctx.lineTo(startX + mw, baseY)
  ctx.closePath()
  ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a ?? 1})`
  ctx.fill()
}
