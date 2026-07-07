import { reactive } from 'vue'
import { getItem, setItem } from '../utils/storage'

export type EvolutionStage = 'tai-awakening' | 'tai-active' | 'cai-horizon' | 'gai-ascent'

interface EvolutionState {
  totalTokens: number
  stage: EvolutionStage
}

const stageThresholds: { stage: EvolutionStage; tokens: number; label: string }[] = [
  { stage: 'tai-awakening', tokens: 0, label: 'TAI 觉醒期' },
  { stage: 'tai-active', tokens: 10_000, label: 'TAI 活跃期' },
  { stage: 'cai-horizon', tokens: 50_000, label: 'CAI 地平线' },
  { stage: 'gai-ascent', tokens: 200_000, label: 'GAI 升维期' },
]

function computeStage(tokens: number): EvolutionStage {
  const thresholds = [...stageThresholds].reverse()
  for (const t of thresholds) {
    if (tokens >= t.tokens) return t.stage
  }
  return 'tai-awakening'
}

export function useEvolution() {
  const state = reactive<EvolutionState>({
    totalTokens: getItem<number>('evolutionTotalTokens', 0),
    stage: 'tai-awakening',
  })
  state.stage = computeStage(state.totalTokens)

  function addTokens(count: number) {
    state.totalTokens += count
    state.stage = computeStage(state.totalTokens)
    setItem('evolutionTotalTokens', state.totalTokens)
  }

  function getStageInfo() {
    const current = stageThresholds.find(t => t.stage === state.stage)
    const nextIdx = stageThresholds.findIndex(t => t.stage === state.stage) + 1
    const next = nextIdx < stageThresholds.length ? stageThresholds[nextIdx] : null
    const progress = next ? Math.min(1, (state.totalTokens - (current?.tokens || 0)) / (next.tokens - (current?.tokens || 0))) : 1
    return {
      label: current?.label || 'TAI 觉醒期',
      progress: Math.round(progress * 100),
      totalTokens: state.totalTokens,
      nextLabel: next?.label || '已抵达顶点',
      nextTokens: next?.tokens || 0,
    }
  }

  const stageIcons: Record<EvolutionStage, string> = {
    'tai-awakening': 'M13 10V3L4 14h7v7l9-11h-7z',
    'tai-active': 'M13 10V3L4 14h7v7l9-11h-7z',
    'cai-horizon': 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    'gai-ascent': 'M12 2l2.4 7.2 7.6.6-5.8 4.6 1.8 7.2-6-4.6-6 4.6 1.8-7.2-5.8-4.6 7.6-.6z',
  }

  return { state, addTokens, getStageInfo, stageIcons }
}
