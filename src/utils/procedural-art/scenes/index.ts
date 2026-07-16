// ============================================================
// 场景注册表 — 管理所有场景渲染器
// ============================================================

import type { SceneRenderer, SceneType } from '../types'
import { cloudSeaMountains } from './cloud-sea-mountains'
import { starryDome } from './starry-dome'
import { spiritSpring } from './spirit-spring'
import { swordQi } from './sword-qi'
import { cloudPalace } from './cloud-palace'
import { lightningTribulation } from './lightning-tribulation'
import { mysticCave } from './mystic-cave'
import { alchemyFurnace } from './alchemy-furnace'
import { flowerFairyland } from './flower-fairyland'
import { ancientSword } from './ancient-sword'

const sceneMap: Record<SceneType, SceneRenderer> = {
  'cloud-sea-mountains': cloudSeaMountains,
  'starry-dome': starryDome,
  'spirit-spring': spiritSpring,
  'sword-qi': swordQi,
  'cloud-palace': cloudPalace,
  'lightning-tribulation': lightningTribulation,
  'mystic-cave': mysticCave,
  'alchemy-furnace': alchemyFurnace,
  'flower-fairyland': flowerFairyland,
  'ancient-sword': ancientSword,
}

export function getScene(type: SceneType): SceneRenderer {
  return sceneMap[type]
}

export function getAllScenes(): SceneRenderer[] {
  return Object.values(sceneMap)
}

export function getSceneList(): { type: SceneType; name: string }[] {
  return Object.values(sceneMap).map(s => ({
    type: s.type,
    name: s.name,
  }))
}
