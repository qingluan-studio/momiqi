// ============================================================
// 九霄云殿 — 悬浮在云端的仙宫
// ============================================================

import type { SceneParams, SceneRenderer } from '../types'
import { SceneType } from '../types'
import {
  color, drawSkyGradient, drawVignette, drawGlow, drawGodRays,
  getTimePalette, hex, gradientNoise2D, fbm2D, valueNoise2D,
  drawStars, drawFogLayer, applyStylePostProcess, getVariationMultiplier,
} from '../scene-engine'

export const cloudPalace: SceneRenderer = {
  type: 'cloud-palace' as SceneType,
  name: '九霄云殿',

  render(ctx: CanvasRenderingContext2D, params: SceneParams) {
    const { w, h } = { w: params.width, h: params.height }
    const palette = getTimePalette(params.timeOfDay)
    const seed = params.seed
    const isNight = params.timeOfDay === 'night' || params.timeOfDay === 'midnight'

    // 天空
    const celestialSky = {
      stops: [
        { position: 0, color: isNight ? color(5, 5, 25) : color(20, 30, 80) },
        { position: 0.3, color: isNight ? color(15, 10, 40) : color(60, 80, 150) },
        { position: 0.6, color: isNight ? color(30, 20, 60) : color(150, 160, 220) },
        { position: 1, color: isNight ? color(40, 30, 70) : color(220, 210, 240) },
      ],
    }
    drawSkyGradient(ctx, w, h, celestialSky)
    if (isNight) {
      drawStars(ctx, w, h, Math.round(250 * getVariationMultiplier(params.seed, 30, params.variationFactor)), seed, 0.7)
    }

    // 天光
    const heavenX = w * 0.5
    const heavenY = h * 0.15
    drawGlow(ctx, heavenX, heavenY, w * 0.5, { r: 255, g: 240, b: 200, a: 0.3 }, 0.6)
    drawGodRays(ctx, w, h, heavenX, heavenY, 12, { r: 255, g: 240, b: 200, a: 0.1 })

    // 云层基底
    for (let layer = 0; layer < 4; layer++) {
      const cloudBaseY = h * (0.5 + layer * 0.08)

      for (let x = 0; x < w; x += 3) {
        const cloudVal = fbm2D(x * 0.005, cloudBaseY * 0.003 + layer * 3, {
          octaves: 5, lacunarity: 2.3, gain: 0.45, seed: seed + layer * 500,
        })

        if (cloudVal > 0.4) {
          const ch = cloudVal * 40 * (1 + layer * 0.3)
          const alpha = (cloudVal - 0.4) * 0.3 * (1 - layer * 0.15)

          ctx.fillStyle = `rgba(255,245,235,${Math.min(0.8, alpha)})`
          ctx.fillRect(x, cloudBaseY - ch, 3, ch * 2)
        }
      }
    }

    // 仙宫建筑 (在云端中间)
    const palaceX = w * 0.35
    const palaceY = h * 0.3
    const palaceW = w * 0.3
    const palaceH = h * 0.25

    drawCelestialPalace(ctx, palaceX, palaceY, palaceW, palaceH, isNight, seed)

    // 连接各殿的云桥
    for (let b = 0; b < Math.round(3 * getVariationMultiplier(params.seed, 40, params.variationFactor)); b++) {
      const bx = palaceX - 50 + b * (palaceW / 2)
      const by = palaceY + palaceH * 0.2 + b * 30

      ctx.strokeStyle = 'rgba(200,200,220,0.3)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.quadraticCurveTo(
        bx + 40, by + 30 * (b % 2 === 0 ? -1 : 1),
        bx + 80, by + 20
      )
      ctx.stroke()
    }

    // 灵气旋
    for (let i = 0; i < params.qiDensity * 250; i++) {
      const angle = (i / (params.qiDensity * 250)) * Math.PI * 6
      const radius = palaceW * 0.7 + gradientNoise2D(i * 0.05, seed + 800, seed) * w * 0.2
      const qx = palaceX + palaceW / 2 + Math.cos(angle) * radius
      const qy = palaceY + palaceH / 2 + Math.sin(angle) * radius * 0.5

      const qAlpha = 0.1 + gradientNoise2D(i * 0.05, seed + 900, seed) * 0.3
      ctx.fillStyle = `rgba(220,240,255,${qAlpha})`
      ctx.shadowColor = `rgba(200,220,255,${qAlpha})`
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.arc(qx, qy, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0

    // 飞鹤剪影
    for (let i = 0; i < Math.round(5 * getVariationMultiplier(params.seed, 50, params.variationFactor)); i++) {
      const craneX = valueNoise2D(i * 0.3, seed + 1000, seed) * w
      const craneY = palaceY - 30 + valueNoise2D(i * 0.3, seed + 1100, seed) * 100
      const craneAngle = valueNoise2D(i * 0.3, seed + 1200, seed) * Math.PI * 0.5 - Math.PI * 0.25

      drawCrane(ctx, craneX, craneY, craneAngle)
    }

    drawVignette(ctx, w, h, 0.3)
    applyStylePostProcess(ctx, w, h, params.style, params.seed)
  },
}

function drawCelestialPalace(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, pw: number, ph: number,
  isNight: boolean, seed: number,
): void {
  const glowColor = isNight ? 'rgba(180,200,255,0.3)' : 'rgba(255,240,200,0.4)'

  // 主殿
  drawGlow(ctx, px + pw / 2, py + ph / 2, pw * 0.6, {
    r: isNight ? 180 : 255, g: isNight ? 200 : 240,
    b: isNight ? 255 : 200, a: 0.3,
  }, 1)

  // 主体
  ctx.fillStyle = isNight
    ? 'rgba(40,45,80,0.85)'
    : 'rgba(200,180,160,0.85)'

  ctx.beginPath()
  ctx.moveTo(px + pw * 0.1, py + ph)
  ctx.lineTo(px + pw * 0.1, py + ph * 0.4)
  ctx.lineTo(px + pw * 0.5, py)
  ctx.lineTo(px + pw * 0.9, py + ph * 0.4)
  ctx.lineTo(px + pw * 0.9, py + ph)
  ctx.lineTo(px + pw * 0.7, py + ph)
  ctx.lineTo(px + pw * 0.7, py + ph * 0.5)
  ctx.lineTo(px + pw * 0.3, py + ph * 0.5)
  ctx.lineTo(px + pw * 0.3, py + ph)
  ctx.closePath()
  ctx.fill()

  // 飞檐
  ctx.strokeStyle = glowColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(px + pw * 0.5, py)
  ctx.lineTo(px + pw * 0.15, py + ph * 0.35)
  ctx.moveTo(px + pw * 0.5, py)
  ctx.lineTo(px + pw * 0.85, py + ph * 0.35)
  ctx.stroke()

  // 旁殿
  ctx.fillStyle = isNight
    ? 'rgba(30,35,60,0.8)'
    : 'rgba(170,155,140,0.8)'

  // 左偏殿
  ctx.beginPath()
  ctx.moveTo(px - pw * 0.05, py + ph)
  ctx.lineTo(px - pw * 0.05, py + ph * 0.6)
  ctx.lineTo(px + pw * 0.15, py + ph * 0.35)
  ctx.lineTo(px + pw * 0.15, py + ph)
  ctx.closePath()
  ctx.fill()

  // 右偏殿
  ctx.beginPath()
  ctx.moveTo(px + pw * 0.85, py + ph)
  ctx.lineTo(px + pw * 0.85, py + ph * 0.35)
  ctx.lineTo(px + pw * 1.05, py + ph * 0.6)
  ctx.lineTo(px + pw * 1.05, py + ph)
  ctx.closePath()
  ctx.fill()

  // 窗户发光
  const winColor = isNight ? 'rgba(255,220,150,0.7)' : 'rgba(255,240,200,0.5)'
  for (let wy = 0; wy < 2; wy++) {
    for (let wx = 0; wx < 2; wx++) {
      const winX = px + pw * 0.25 + wx * pw * 0.25
      const winY = py + ph * 0.55 + wy * ph * 0.15

      ctx.fillStyle = winColor
      ctx.fillRect(winX - pw * 0.04, winY - ph * 0.04, pw * 0.08, ph * 0.08)
    }
  }

  // 屋顶宝珠
  const orbY = py - ph * 0.05
  drawGlow(ctx, px + pw / 2, orbY, pw * 0.06, {
    r: 255, g: 255, b: 200, a: 0.8,
  }, 1)
  ctx.fillStyle = '#fffbe6'
  ctx.beginPath()
  ctx.arc(px + pw / 2, orbY, pw * 0.02, 0, Math.PI * 2)
  ctx.fill()
}

function drawCrane(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, angle: number,
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1.5

  // 身体
  ctx.beginPath()
  ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2)
  ctx.stroke()

  // 翅膀
  ctx.beginPath()
  ctx.moveTo(-2, 0)
  ctx.quadraticCurveTo(-5, -10, 10, -12)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-2, 0)
  ctx.quadraticCurveTo(0, -8, 8, -10)
  ctx.stroke()

  ctx.restore()
}
