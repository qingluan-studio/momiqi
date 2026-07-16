// ============================================================
// 程序化艺术引擎 — 主入口
// ============================================================

export * from './types'
export * from './noise'
export * from './scene-engine'
export * from './prompt-parser'
export * from './styles'
export { applyStylePostProcess } from './post-process'
export { getScene, getAllScenes, getSceneList } from './scenes/index'

import type { SceneParams } from './types'
import { parsePrompt } from './prompt-parser'
import { getScene } from './scenes/index'

/**
 * 根据提示词渲染场景到 Canvas
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  prompt: string,
  width: number = 1024,
  height: number = 768,
): void {
  const params = parsePrompt(prompt, width, height)
  const scene = getScene(params.sceneType)
  scene.render(ctx, params)
}

/**
 * 使用指定参数渲染场景
 */
export function renderSceneWithParams(
  ctx: CanvasRenderingContext2D,
  params: SceneParams,
): void {
  const scene = getScene(params.sceneType)
  scene.render(ctx, params)
}
