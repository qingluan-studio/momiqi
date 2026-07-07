const STORAGE_PREFIX = 'ai-toolkit:'

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    console.warn('localStorage write failed for key:', key)
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

export function getAllKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(STORAGE_PREFIX)) {
      keys.push(k.slice(STORAGE_PREFIX.length))
    }
  }
  return keys
}
