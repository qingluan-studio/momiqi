// ============================================================
// 程序化噪声引擎 — 整个系统的数学基础
// 基于梯度噪声 + fBm + 域扭曲，不需要任何外部依赖
// ============================================================

/**
 * 基于种子的哈希函数，对 2D/3D 坐标产生伪随机值
 */
function hash2D(ix: number, iy: number, seed: number = 0): number {
  let h = ix * 374761393 + iy * 668265263 + seed * 1013904223
  h = (h ^ (h >>> 13)) * 1274126177
  h = h ^ (h >>> 16)
  return (h & 0x7fffffff) / 0x7fffffff
}

function hash3D(ix: number, iy: number, iz: number, seed: number = 0): number {
  let h = ix * 374761393 + iy * 668265263 + iz * 1103515245 + seed * 1013904223
  h = (h ^ (h >>> 13)) * 1274126177
  h = h ^ (h >>> 16)
  return (h & 0x7fffffff) / 0x7fffffff
}

function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * 2D 值噪声
 */
export function valueNoise2D(x: number, y: number, seed: number = 0): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = smootherstep(x - ix)
  const fy = smootherstep(y - iy)

  const v00 = hash2D(ix, iy, seed)
  const v10 = hash2D(ix + 1, iy, seed)
  const v01 = hash2D(ix, iy + 1, seed)
  const v11 = hash2D(ix + 1, iy + 1, seed)

  const v0 = v00 + (v10 - v00) * fx
  const v1 = v01 + (v11 - v01) * fx

  return v0 + (v1 - v0) * fy
}

/**
 * 3D 值噪声
 */
export function valueNoise3D(x: number, y: number, z: number, seed: number = 0): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = smootherstep(x - ix)
  const fy = smootherstep(y - iy)
  const fz = smootherstep(z - iz)

  const v000 = hash3D(ix, iy, iz, seed)
  const v100 = hash3D(ix + 1, iy, iz, seed)
  const v010 = hash3D(ix, iy + 1, iz, seed)
  const v110 = hash3D(ix + 1, iy + 1, iz, seed)
  const v001 = hash3D(ix, iy, iz + 1, seed)
  const v101 = hash3D(ix + 1, iy, iz + 1, seed)
  const v011 = hash3D(ix, iy + 1, iz + 1, seed)
  const v111 = hash3D(ix + 1, iy + 1, iz + 1, seed)

  const v00 = v000 + (v100 - v000) * fx
  const v10 = v010 + (v110 - v010) * fx
  const v01 = v001 + (v101 - v001) * fx
  const v11 = v011 + (v111 - v011) * fx

  const v0 = v00 + (v10 - v00) * fy
  const v1 = v01 + (v11 - v01) * fy

  return v0 + (v1 - v0) * fz
}

/**
 * 简易 2D 梯度噪声 (基于随机梯度方向)
 */
const GRAD2: [number, number][] = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
]

function dot2(g: [number, number], x: number, y: number): number {
  return g[0] * x + g[1] * y
}

export function gradientNoise2D(x: number, y: number, seed: number = 0): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const sx = smootherstep(fx)
  const sy = smootherstep(fy)

  const n00 = dot2(GRAD2[Math.floor(hash2D(ix, iy, seed) * 8) % 8], fx, fy)
  const n10 = dot2(GRAD2[Math.floor(hash2D(ix + 1, iy, seed) * 8) % 8], fx - 1, fy)
  const n01 = dot2(GRAD2[Math.floor(hash2D(ix, iy + 1, seed) * 8) % 8], fx, fy - 1)
  const n11 = dot2(GRAD2[Math.floor(hash2D(ix + 1, iy + 1, seed) * 8) % 8], fx - 1, fy - 1)

  const nx0 = n00 + (n10 - n00) * sx
  const nx1 = n01 + (n11 - n01) * sx

  return (nx0 + (nx1 - nx0) * sy) * 0.5 + 0.5
}

/**
 * 分形布朗运动 — 多层噪声叠加
 * 用于生成地形、云层等需要丰富细节的场景
 */
export interface FBMOptions {
  octaves?: number
  lacunarity?: number
  gain?: number
  seed?: number
}

export function fbm2D(
  x: number,
  y: number,
  opts: FBMOptions = {}
): number {
  const octaves = opts.octaves ?? 6
  const lacunarity = opts.lacunarity ?? 2.0
  const gain = opts.gain ?? 0.5
  const seed = opts.seed ?? 0

  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    value += amplitude * gradientNoise2D(x * frequency, y * frequency, seed + i * 1000)
    maxValue += amplitude
    amplitude *= gain
    frequency *= lacunarity
  }

  return value / maxValue
}

/**
 * 域扭曲 — 将坐标先扭曲再采样，产生有机流线形状
 * 适合生成云、烟雾、水流等
 */
export function domainWarp2D(
  x: number,
  y: number,
  strength: number = 1.0,
  seed: number = 0
): number {
  const wx = x + gradientNoise2D(x * 0.5, y * 0.5, seed) * strength
  const wy = y + gradientNoise2D(x * 0.5 + 5.2, y * 0.5 + 1.3, seed + 100) * strength
  return gradientNoise2D(wx * 2, wy * 2, seed + 200)
}

/**
 * 脊状噪声 — 取绝对值产生山脉脊线效果
 */
export function ridgeNoise2D(x: number, y: number, seed: number = 0): number {
  return 1 - Math.abs(gradientNoise2D(x, y, seed) * 2 - 1)
}

export function ridgeFbm2D(x: number, y: number, opts: FBMOptions = {}): number {
  const octaves = opts.octaves ?? 4
  const lacunarity = opts.lacunarity ?? 2.0
  const gain = opts.gain ?? 0.5
  const seed = opts.seed ?? 0

  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    value += amplitude * ridgeNoise2D(x * frequency, y * frequency, seed + i * 1000)
    maxValue += amplitude
    amplitude *= gain
    frequency *= lacunarity
  }

  return value / maxValue
}
