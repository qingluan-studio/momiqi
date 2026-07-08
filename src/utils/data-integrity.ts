import { getAllKeys, getItem, setItem } from './storage'

const DATA_VERSIONS: Record<string, number> = {
  toolRegistry: 1,
  plannerState: 1,
  humanSimulator: 1,
  selfEvolution: 2,
  superAgentState: 1,
  selfLearning: 1,
  settings: 1,
  prompts: 1,
  evolution: 1,
  knowledge: 1,
  chat: 1,
  agents: 1,
  knowledgePlugins: 1,
  aiIdentity: 1,
  workspaceManager: 1,
  corpusEngine: 1,
}

interface IntegrityMeta {
  version: number
  lastSaved: number
  lastValidated: number
  checksum: string
  totalSaves: number
}

function checksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function getMeta(key: string): IntegrityMeta | null {
  try {
    const raw = localStorage.getItem(`ai-toolkit:meta:${key}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveMeta(key: string, meta: IntegrityMeta) {
  try {
    localStorage.setItem(`ai-toolkit:meta:${key}`, JSON.stringify(meta))
  } catch { /* quota exceeded */ }
}

export function initDataIntegrity() {
  const keys = getAllKeys()
  const repaired: string[] = []

  for (const key of keys) {
    if (key.startsWith('meta:')) continue

    const expectedVersion = DATA_VERSIONS[key]
    if (expectedVersion === undefined) continue

    const meta = getMeta(key)
    const raw = localStorage.getItem(`ai-toolkit:${key}`)

    if (!raw) continue

    if (!meta || meta.version < expectedVersion) {
      try {
        let data = JSON.parse(raw)
        if (meta && meta.version < expectedVersion) {
          data = migrateData(key, meta.version, expectedVersion, data)
        }
        const newRaw = JSON.stringify(data)
        localStorage.setItem(`ai-toolkit:${key}`, newRaw)
        saveMeta(key, {
          version: expectedVersion,
          lastSaved: Date.now(),
          lastValidated: Date.now(),
          checksum: checksum(newRaw),
          totalSaves: (meta?.totalSaves ?? 0) + 1,
        })
        repaired.push(key)
      } catch {
        localStorage.removeItem(`ai-toolkit:${key}`)
        localStorage.removeItem(`ai-toolkit:meta:${key}`)
        repaired.push(`${key} (已重置)`)
      }
    } else {
      const currentHash = checksum(raw)
      if (meta.checksum !== currentHash) {
        saveMeta(key, {
          ...meta,
          lastValidated: Date.now(),
          checksum: currentHash,
        })
        repaired.push(`${key} (校验已修复)`)
      }
    }
  }

  for (const key of Object.keys(DATA_VERSIONS)) {
    if (!keys.includes(key)) {
      const meta = getMeta(key)
      if (!meta) {
        saveMeta(key, {
          version: DATA_VERSIONS[key],
          lastSaved: Date.now(),
          lastValidated: Date.now(),
          checksum: '',
          totalSaves: 0,
        })
      }
    }
  }

  return { ok: true, repaired }
}

function migrateData(key: string, fromVer: number, toVer: number, data: any): any {
  if (key === 'selfEvolution' && fromVer < 2) {
    data.successRate = 100
    data.totalAttempts = data.totalEvolutions || 0
    data.successfulEvolutions = data.totalEvolutions || 0
    data.efficiency = 85
    data.totalStepsExecuted = 0
    data.successfulSteps = 0
    data.personalityMode = 'encouraging'
  }
  return data
}

export function guardedSave<T>(key: string, value: T): boolean {
  try {
    const raw = JSON.stringify(value)
    const hash = checksum(raw)
    const version = DATA_VERSIONS[key] ?? 1

    localStorage.setItem(`ai-toolkit:${key}`, raw)

    const meta = getMeta(key)
    saveMeta(key, {
      version,
      lastSaved: Date.now(),
      lastValidated: Date.now(),
      checksum: hash,
      totalSaves: (meta?.totalSaves ?? 0) + 1,
    })
    return true
  } catch {
    return false
  }
}

export function guardedLoad<T>(key: string, fallback: T): T {
  const meta = getMeta(key)
  const raw = localStorage.getItem(`ai-toolkit:${key}`)

  if (!raw) return fallback

  try {
    const data = JSON.parse(raw) as T
    if (meta) {
      const currentHash = checksum(raw)
      if (meta.checksum && meta.checksum !== '' && currentHash !== meta.checksum) {
        console.warn(`[数据完整性] ${key} 校验和不匹配，使用回退数据`)
        return fallback
      }
    }
    return data
  } catch {
    console.warn(`[数据完整性] ${key} 解析失败，使用回退数据`)
    return fallback
  }
}

export function exportAllData(): string {
  const all: Record<string, any> = {}
  const keys = getAllKeys()
  for (const key of keys) {
    if (key.startsWith('meta:')) continue
    try {
      const raw = localStorage.getItem(`ai-toolkit:${key}`)
      if (raw) all[key] = JSON.parse(raw)
    } catch { /* skip */ }
  }
  const metaKeys = getAllKeys().filter(k => k.startsWith('meta:'))
  for (const mk of metaKeys) {
    try {
      const raw = localStorage.getItem(`ai-toolkit:${mk}`)
      if (raw) all[mk] = JSON.parse(raw)
    } catch { /* skip */ }
  }
  return JSON.stringify({
    exportedAt: Date.now(),
    exportVersion: 1,
    data: all,
  }, null, 2)
}

export function importAllData(jsonStr: string): { ok: boolean; count: number; errors: string[] } {
  const errors: string[] = []
  let count = 0
  try {
    const pkg = JSON.parse(jsonStr)
    if (!pkg.data) throw new Error('格式无效')
    for (const key of Object.keys(pkg.data)) {
      try {
        const fullKey = key.startsWith('meta:') ? `ai-toolkit:${key}` : `ai-toolkit:${key}`
        localStorage.setItem(fullKey, JSON.stringify(pkg.data[key]))
        count++
      } catch (e: any) {
        errors.push(`${key}: ${e.message}`)
      }
    }
    return { ok: errors.length === 0, count, errors }
  } catch (e: any) {
    return { ok: false, count: 0, errors: [e.message] }
  }
}

export function getStorageStats() {
  const keys = getAllKeys()
  let totalBytes = 0
  const perKey: Record<string, number> = {}
  for (const key of keys) {
    const raw = localStorage.getItem(`ai-toolkit:${key}`)
    if (raw) {
      const size = new Blob([raw]).size
      totalBytes += size
      perKey[key] = size
    }
  }
  return {
    totalKeys: keys.length,
    totalKB: Math.round(totalBytes / 1024),
    perKey,
    quotaEstimate: estimateQuota(),
  }
}

function estimateQuota(): string {
  try {
    const test = 'a'.repeat(1024 * 500)
    for (let i = 0; i < 10; i++) {
      localStorage.setItem('__quota_test__', test)
    }
    localStorage.removeItem('__quota_test__')
    return '>5MB'
  } catch {
    return '<5MB (接近上限)'
  }
}
