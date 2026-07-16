// ============================================================
// 程序化艺术引擎 — 主入口
// ============================================================

export * from './types'
export * from './noise'
export * from './scene-engine'
export * from './prompt-parser'
export * from './styles'
export * from './experts/index'
export { applyStylePostProcess } from './post-process'
export { getScene, getAllScenes, getSceneList } from './scenes/index'

import type { SceneParams } from './types'
import { parsePrompt } from './prompt-parser'
import { getScene } from './scenes/index'
import { generateExpertOutputs, fuseExpertOutputs, getExpertWeights, printExpertReport, assessQuality } from './experts/index'
import type { FusionResult, T6Assessment } from './experts/types'

export interface RenderResult {
  fusion: FusionResult
  assessment: T6Assessment
}

/**
 * 根据提示词渲染场景到 Canvas
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  prompt: string,
  width: number = 1024,
  height: number = 768,
): RenderResult {
  const params = parsePrompt(prompt, width, height)
  return renderSceneWithParams(ctx, params)
}

/**
 * 使用指定参数渲染场景
 */
export function renderSceneWithParams(
  ctx: CanvasRenderingContext2D,
  params: SceneParams,
): RenderResult {
  const scene = getScene(params.sceneType)

  const expertOutputs = generateExpertOutputs(
    params.seed,
    params.sceneType,
    params.style,
    params.timeOfDay,
    params.variationFactor,
    params.width,
    params.height,
  )

  const weights = getExpertWeights(params.style)
  const fusion = fuseExpertOutputs(expertOutputs, weights, 'judge_weighted', params.style)

  scene.render(ctx, params)

  const assessment = assessQuality(fusion.outputs, weights, ctx, params.width, params.height)

  return { fusion, assessment }
}

export { printExpertReport } from './experts/index'
