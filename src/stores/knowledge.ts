import { reactive } from 'vue'
import { getItem, setItem } from '../utils/storage'
import { generateId } from '../utils/markdown'

export interface KnowledgeNote {
  id: string
  title: string
  content: string
  category: string
  source: 'manual' | 'auto-learn'
  sessionId?: string
  createdAt: number
  updatedAt: number
}

const CATEGORIES = ['通用', '编程', 'AI', '产品', '运维', '其他'] as const

export function useKnowledgeStore() {
  const notes = reactive<KnowledgeNote[]>(getItem<KnowledgeNote[]>('knowledgeNotes', []))

  function save() {
    setItem('knowledgeNotes', [...notes])
  }

  function addNote(title: string, content: string, category: string, source: 'manual' | 'auto-learn' = 'manual', sessionId?: string): KnowledgeNote {
    const note: KnowledgeNote = {
      id: generateId(),
      title,
      content,
      category,
      source,
      sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    notes.unshift(note)
    save()
    return note
  }

  function updateNote(id: string, updates: Partial<Pick<KnowledgeNote, 'title' | 'content' | 'category'>>) {
    const idx = notes.findIndex(n => n.id === id)
    if (idx < 0) return
    Object.assign(notes[idx], updates, { updatedAt: Date.now() })
    save()
  }

  function deleteNote(id: string) {
    const idx = notes.findIndex(n => n.id === id)
    if (idx < 0) return
    notes.splice(idx, 1)
    save()
  }

  function getByCategory(category: string): KnowledgeNote[] {
    return notes.filter(n => n.category === category)
  }

  function searchNotes(query: string): KnowledgeNote[] {
    const q = query.toLowerCase()
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    )
  }

  function getAutoLearned(): KnowledgeNote[] {
    return notes.filter(n => n.source === 'auto-learn')
  }

  return {
    notes,
    categories: CATEGORIES,
    addNote, updateNote, deleteNote,
    getByCategory, searchNotes, getAutoLearned,
  }
}
