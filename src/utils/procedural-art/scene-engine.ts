// ============================================================
// 场景引擎 — 渲染管线、粒子系统、画面合成
// ============================================================

import type { Color, Gradient, Particle, TimeOfDay } from './types'
import { valueNoise2D, gradientNoise2D, fbm2D } from './noise'

export { valueNoise2D, gradientNoise2D, fbm2D, ridgeFbm2D } from './noise'
export type { FBMOptions } from './noise'

// Re-export style & post-process utilities
export {
  getStyleConfig,
  getStyleList,
  styleSkyGradient,
  styleGlowColor,
  styleTerrainColor,
  getCameraOffset,
  getVariationMultiplier,
  getStyleColorShift,
} from './styles'
export { applyStylePostProcess } from './post-process'

// ---------- 颜色工具 ----------

export function hex(c: Color): string {
  const a = c.a ?? 1
  return `rgba(${c.r},${c.g},${c.b},${a})`
}

export function lerpColor(a: Color, b: Color, t: number): Color {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: (a.a ?? 1) + ((b.a ?? 1) - (a.a ?? 1)) * t,
  }
}

export function color(r: number, g: number, b: number, a?: number): Color {
  return { r, g, b, a }
}

export function hsl(h: number, s: number, l: number, a?: number): Color {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(1, s))
  l = Math.max(0, Math.min(1, l))
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  }
}

export function gradientAt(grad: Gradient, t: number): Color {
  const clamped = Math.max(0, Math.min(1, t))
  if (grad.stops.length === 0) return color(0, 0, 0)
  if (grad.stops.length === 1) return grad.stops[0].color

  for (let i = 0; i < grad.stops.length - 1; i++) {
    const s0 = grad.stops[i]
    const s1 = grad.stops[i + 1]
    if (clamped >= s0.position && clamped <= s1.position) {
      const lt = (clamped - s0.position) / (s1.position - s0.position)
      return lerpColor(s0.color, s1.color, lt)
    }
  }

  if (clamped <= grad.stops[0].position) return grad.stops[0].color
  return grad.stops[grad.stops.length - 1].color
}

// ---------- 绘制辅助 ----------

export function drawSkyGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  grad: Gradient
): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h)
  for (const stop of grad.stops) {
    skyGrad.addColorStop(stop.position, hex(stop.color))
  }
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h)
}

export function drawHorizonGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizonY: number,
  topGrad: Gradient,
  bottomGrad: Gradient
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  for (const stop of topGrad.stops) {
    grad.addColorStop(stop.position * (horizonY / h), hex(stop.color))
  }
  for (const stop of bottomGrad.stops) {
    grad.addColorStop(
      (horizonY / h) + stop.position * (1 - horizonY / h),
      hex(stop.color)
    )
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

// ---------- 粒子系统 ----------

export function spawnParticles(
  particles: Particle[],
  count: number,
  w: number,
  h: number,
  color: Color,
  sizeRange: [number, number],
  lifeRange: [number, number],
  speedRange: [number, number],
  region?: { x: number; y: number; w: number; h: number }
): void {
  const rx = region?.x ?? 0
  const ry = region?.y ?? 0
  const rw = region?.w ?? w
  const rh = region?.h ?? h

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0])
    const maxLife = lifeRange[0] + Math.random() * (lifeRange[1] - lifeRange[0])
    particles.push({
      x: rx + Math.random() * rw,
      y: ry + Math.random() * rh,
      vx: Math.cos(angle) * speed * 0.3,
      vy: Math.sin(angle) * speed * 0.3 - speed * 0.5,
      life: Math.random() * maxLife,
      maxLife,
      size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
      color: { ...color, a: color.a },
      alpha: color.a ?? 1,
    })
  }
}

export function updateParticles(particles: Particle[], dt: number, w: number, h: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.life -= dt

    // 噪声风场
    const windAngle = gradientNoise2D(p.x * 0.005, p.y * 0.005, 9999) * Math.PI * 4
    p.vx += Math.cos(windAngle) * 0.01 * dt
    p.vy += Math.sin(windAngle) * 0.01 * dt - 0.005 * dt // slight upward drift

    p.alpha = (p.color.a ?? 1) * Math.sin((p.life / p.maxLife) * Math.PI)

    if (p.life <= 0 || p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
      particles.splice(i, 1)
    }
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  ctx.save()
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.alpha)
    ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${p.alpha})`
    ctx.shadowColor = `rgba(${p.color.r},${p.color.g},${p.color.b},${p.alpha * 0.8})`
    ctx.shadowBlur = p.size * 3
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// ---------- 通用特效 ----------

/** 绘制光晕 (径向渐变) */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: Color,
  intensity: number = 1
): void {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
  grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${(color.a ?? 1) * intensity})`)
  grad.addColorStop(0.5, `rgba(${color.r},${color.g},${color.b},${(color.a ?? 1) * intensity * 0.3})`)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

/** 绘制上帝光柱 (多个径向渐变合成) */
export function drawGodRays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sx: number,
  sy: number,
  count: number = 8,
  color: Color = { r: 255, g: 240, b: 200, a: 0.15 }
): void {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const length = h * (0.5 + Math.random() * 0.5)
    const ex = sx + Math.cos(angle) * length
    const ey = sy + Math.sin(angle) * length

    const grad = ctx.createLinearGradient(sx, sy, ex, ey)
    grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${color.a})`)
    grad.addColorStop(0.3, `rgba(${color.r},${color.g},${color.b},${(color.a ?? 0) * 0.5})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    const spread = 30 + Math.random() * 60
    ctx.lineTo(ex + Math.cos(angle + 0.3) * spread, ey + Math.sin(angle + 0.3) * spread)
    ctx.lineTo(ex + Math.cos(angle - 0.3) * spread, ey + Math.sin(angle - 0.3) * spread)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

/** 暗角效果 */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number = 0.5
): void {
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(0,0,0,${intensity})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

/** 色相偏移后期处理 */
export function applyHueShift(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shift: number
): void {
  if (Math.abs(shift) < 0.01) return
  ctx.save()
  ctx.globalCompositeOperation = 'hue'
  ctx.fillStyle = `hsla(${shift},50%,50%,0.3)`
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

// ---------- 星图绘制 ----------

export function drawStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  density: number = 200,
  seed: number = 0,
  regionHeight: number = 1
): void {
  for (let i = 0; i < density; i++) {
    const x = valueNoise2D(i * 0.1, seed, seed) * w
    const y = valueNoise2D(i * 0.1, seed + 1000, seed) * h * regionHeight
    const brightness = valueNoise2D(i * 0.1, seed + 2000, seed)
    const size = brightness * 2.5

    if (brightness > 0.3) {
      ctx.globalAlpha = brightness * 0.8
      ctx.fillStyle = brightness > 0.7
        ? `rgba(255,255,255,${brightness})`
        : `rgba(200,220,255,${brightness * 0.5})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()

      // 亮星有十字光芒
      if (brightness > 0.85) {
        ctx.strokeStyle = `rgba(255,255,255,${brightness * 0.3})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(x - size * 4, y)
        ctx.lineTo(x + size * 4, y)
        ctx.moveTo(x, y - size * 4)
        ctx.lineTo(x, y + size * 4)
        ctx.stroke()
      }
    }
  }
  ctx.globalAlpha = 1
}

// ---------- 雾层绘制 ----------

export function drawFogLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fogColor: Color,
  density: number = 0.4,
  seed: number = 0,
  baseY: number = 0.3
): void {
  const imageData = ctx.getImageData(0, 0, w, h)
  const fogH = h * (1 - baseY)

  for (let py = 0; py < fogH; py++) {
    const t = py / fogH
    for (let px = 0; px < w; px++) {
      const noiseVal = fbm2D(px * 0.008, py * 0.008, {
        octaves: 4,
        lacunarity: 2.3,
        gain: 0.5,
        seed,
      })
      const fogAlpha = noiseVal * density * t

      if (fogAlpha > 0.01) {
        const idx = ((py + Math.floor(h * baseY)) * w + px) * 4
        imageData.data[idx] = imageData.data[idx] * (1 - fogAlpha) + fogColor.r * fogAlpha
        imageData.data[idx + 1] = imageData.data[idx + 1] * (1 - fogAlpha) + fogColor.g * fogAlpha
        imageData.data[idx + 2] = imageData.data[idx + 2] * (1 - fogAlpha) + fogColor.b * fogAlpha
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// ---------- 时间 → 天空颜色 ----------

export function getTimePalette(timeOfDay: TimeOfDay): {
  skyGradient: Gradient
  horizonGlow: Color
  starDensity: number
  fogColor: Color
  ambientLight: Color
} {
  switch (timeOfDay) {
    case 'dawn':
      return {
        skyGradient: {
          stops: [
            { position: 0, color: color(20, 15, 40) },
            { position: 0.3, color: color(80, 40, 90) },
            { position: 0.55, color: color(220, 100, 80) },
            { position: 0.7, color: color(255, 180, 120) },
            { position: 1, color: color(200, 160, 140) },
          ],
        },
        horizonGlow: color(255, 150, 80, 0.4),
        starDensity: 50,
        fogColor: color(200, 150, 180),
        ambientLight: color(255, 200, 180),
      }
    case 'morning':
      return {
        skyGradient: {
          stops: [
            { position: 0, color: color(60, 100, 180) },
            { position: 0.5, color: color(140, 180, 230) },
            { position: 1, color: color(200, 220, 240) },
          ],
        },
        horizonGlow: color(255, 220, 180, 0.3),
        starDensity: 0,
        fogColor: color(200, 210, 230),
        ambientLight: color(255, 250, 240),
      }
    case 'noon':
      return {
        skyGradient: {
          stops: [
            { position: 0, color: color(30, 80, 180) },
            { position: 0.5, color: color(100, 160, 230) },
            { position: 1, color: color(180, 200, 220) },
          ],
        },
        horizonGlow: color(255, 240, 200, 0.2),
        starDensity: 0,
        fogColor: color(200, 210, 230),
        ambientLight: color(255, 255, 250),
      }
    case 'dusk':
      return {
        skyGradient: {
          stops: [
            { position: 0, color: color(15, 10, 40) },
            { position: 0.25, color: color(60, 30, 80) },
            { position: 0.5, color: color(200, 80, 60) },
            { position: 0.7, color: color(255, 140, 60) },
            { position: 1, color: color(180, 120, 80) },
          ],
        },
        horizonGlow: color(255, 100, 50, 0.5),
        starDensity: 30,
        fogColor: color(180, 120, 150),
        ambientLight: color(255, 180, 140),
      }
    case 'night':
      return {
        skyGradient: {
          stops: [
            { position: 0, color: color(5, 5, 20) },
            { position: 0.4, color: color(10, 10, 40) },
            { position: 0.7, color: color(20, 15, 50) },
            { position: 1, color: color(30, 25, 55) },
          ],
        },
        horizonGlow: color(30, 20, 60, 0.3),
        starDensity: 300,
        fogColor: color(30, 30, 60),
        ambientLight: color(100, 100, 180),
      }
    case 'midnight':
      return {
        skyGradient: {
          stops: [
            { position: 0, color: color(2, 2, 10) },
            { position: 0.5, color: color(5, 5, 25) },
            { position: 1, color: color(10, 10, 30) },
          ],
        },
        horizonGlow: color(10, 10, 40, 0.2),
        starDensity: 400,
        fogColor: color(20, 20, 50),
        ambientLight: color(60, 60, 140),
      }
  }
}
