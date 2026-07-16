// ============================================================
// 中文提示词解析器 — 从文字描述提取场景参数 + 风格识别
// ============================================================

import type { SceneParams, SceneType, ArtStyle, TimeOfDay } from './types'

const SCENE_KEYWORDS: Record<string, SceneType> = {
  仙山: 'cloud-sea-mountains',
  云海: 'cloud-sea-mountains',
  山峰: 'cloud-sea-mountains',
  飘渺: 'cloud-sea-mountains',

  星空: 'starry-dome',
  星辰: 'starry-dome',
  银河: 'starry-dome',
  宇宙: 'starry-dome',
  天穹: 'starry-dome',

  灵泉: 'spirit-spring',
  幽谷: 'spirit-spring',
  瀑布: 'spirit-spring',
  清泉: 'spirit-spring',

  剑气: 'sword-qi',
  剑意: 'sword-qi',
  剑芒: 'sword-qi',
  刀光: 'sword-qi',

  宫殿: 'cloud-palace',
  仙宫: 'cloud-palace',
  云殿: 'cloud-palace',
  天宫: 'cloud-palace',
  神殿: 'cloud-palace',

  雷劫: 'lightning-tribulation',
  天雷: 'lightning-tribulation',
  渡劫: 'lightning-tribulation',
  劫云: 'lightning-tribulation',
  闪电: 'lightning-tribulation',

  洞府: 'mystic-cave',
  秘境: 'mystic-cave',
  洞穴: 'mystic-cave',
  矿脉: 'mystic-cave',

  丹炉: 'alchemy-furnace',
  炼丹: 'alchemy-furnace',
  炉火: 'alchemy-furnace',
  炼药: 'alchemy-furnace',

  花海: 'flower-fairyland',
  仙境: 'flower-fairyland',
  灵树: 'flower-fairyland',
  桃花: 'flower-fairyland',
  樱花: 'flower-fairyland',

  古剑: 'ancient-sword',
  遗迹: 'ancient-sword',
  石中剑: 'ancient-sword',
  战场: 'ancient-sword',
  废墟: 'ancient-sword',
}

const TIME_KEYWORDS: Record<string, TimeOfDay> = {
  清晨: 'dawn',
  黎明: 'dawn',
  早晨: 'morning',
  上午: 'morning',
  正午: 'noon',
  中午: 'noon',
  黄昏: 'dusk',
  傍晚: 'dusk',
  夜晚: 'night',
  深夜: 'midnight',
  黑暗: 'midnight',
}

const ATMOSPHERE_KEYWORDS: Record<string, number> = {
  浓雾: 0.8,
  雾气: 0.6,
  朦胧: 0.5,
  清晰: 0.1,
  强烈: 1.0,
  浓郁: 0.9,
  淡雅: 0.2,
  飘渺: 0.7,
}

const QI_KEYWORDS: Record<string, number> = {
  灵气充沛: 1.0,
  灵气浓郁: 0.9,
  灵气: 0.5,
  灵力: 0.5,
  枯竭: 0.1,
  稀薄: 0.2,
}

const HUE_KEYWORDS: Record<string, number> = {
  赤红: 0,
  红色: 0,
  金辉: 45,
  金色: 45,
  翠绿: 120,
  绿色: 120,
  湛蓝: 210,
  蓝色: 210,
  紫色: 270,
  紫霞: 270,
}

/** 风格关键词 */
const STYLE_KEYWORDS: Record<string, ArtStyle> = {
  二次元: 'anime',
  动漫: 'anime',
  日系: 'anime',
  新海诚: 'anime',
  吉卜力: 'anime',
  水墨: 'ink-wash',
  国画: 'ink-wash',
  墨色: 'ink-wash',
  水彩: 'watercolor',
  水粉: 'watercolor',
  写实: 'realistic',
  真实: 'realistic',
  现实: 'realistic',
  幻想: 'fantasy',
  绚丽: 'fantasy',
  华丽: 'fantasy',
  素描: 'sketch',
  手绘: 'sketch',
  炭笔: 'sketch',
  速写: 'sketch',
  油画: 'oil',
  厚涂: 'oil',
  像素: 'pixel',
  像素风: 'pixel',
  像素画: 'pixel',
  赛博: 'cyberpunk',
  赛博朋克: 'cyberpunk',
  霓虹: 'cyberpunk',
  机械: 'cyberpunk',
}

/**
 * 从中文提示词解析场景参数
 */
export function parsePrompt(
  prompt: string,
  width: number = 1024,
  height: number = 768,
): SceneParams {
  let sceneType: SceneType = 'cloud-sea-mountains'
  let timeOfDay: TimeOfDay = 'noon'
  let style: ArtStyle = 'fantasy'
  let atmosphere = 0.3
  let qiDensity = 0.3
  let hueShift = 0
  let seed = 0
  let variationFactor = 0.3
  const keywords: string[] = []

  // 1. 提取场景种子
  for (let i = 0; i < prompt.length; i++) {
    seed = ((seed << 5) - seed + prompt.charCodeAt(i)) | 0
  }
  seed = Math.abs(seed)

  // 2. 场景类型匹配
  let bestSceneScore = 0
  for (const [key, scene] of Object.entries(SCENE_KEYWORDS)) {
    if (prompt.includes(key)) {
      const score = key.length * 2
      if (score > bestSceneScore) {
        bestSceneScore = score
        sceneType = scene
      }
    }
  }

  // 3. 时间匹配
  for (const [key, time] of Object.entries(TIME_KEYWORDS)) {
    if (prompt.includes(key)) {
      timeOfDay = time
      break
    }
  }

  // 4. 风格匹配
  for (const [key, artStyle] of Object.entries(STYLE_KEYWORDS)) {
    if (prompt.includes(key)) {
      style = artStyle
      break
    }
  }

  // 5. 气氛强度
  for (const [key, val] of Object.entries(ATMOSPHERE_KEYWORDS)) {
    if (prompt.includes(key)) {
      atmosphere = val
      break
    }
  }

  // 6. 灵气密度
  for (const [key, val] of Object.entries(QI_KEYWORDS)) {
    if (prompt.includes(key)) {
      qiDensity = val
      break
    }
  }

  // 7. 色相偏移
  for (const [key, val] of Object.entries(HUE_KEYWORDS)) {
    if (prompt.includes(key)) {
      hueShift = val
      break
    }
  }

  // 8. 额外关键词
  for (const key of [
    '宏大', '庄严', '清冷', '炽热', '浩渺', '神秘', '幽深',
    '辉煌', '荒凉', '生机', '战意', '宁静', '狂野', '圣洁',
    '阴暗', '光明', '炽烈', '冰寒',
  ]) {
    if (prompt.includes(key) && keywords.length < 5) {
      keywords.push(key)
    }
  }

  return {
    sceneType,
    timeOfDay,
    seed,
    width,
    height,
    style,
    variationFactor,
    atmosphere,
    qiDensity,
    hueShift,
    keywords,
  }
}
