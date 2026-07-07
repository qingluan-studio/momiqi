import { reactive } from 'vue'
import type { PromptTemplate } from '../types'
import { getItem, setItem } from '../utils/storage'
import { generateId } from '../utils/markdown'

const builtinTemplates: Omit<PromptTemplate, 'id'>[] = [
  { title: '专家问答', content: '你是一位资深的{{领域}}专家。请用专业但易懂的方式回答以下问题：\n\n{{问题}}', category: '通用', isBuiltin: true },
  { title: '代码生成', content: '请用{{语言}}编写一段代码，实现以下功能：\n\n{{需求}}\n\n要求：代码简洁清晰，包含必要的注释。', category: '编程', isBuiltin: true },
  { title: '代码解释', content: '请逐行解释以下{{语言}}代码的逻辑和用途：\n\n```{{语言}}\n{{代码}}\n```', category: '编程', isBuiltin: true },
  { title: 'Bug 修复', content: '以下{{语言}}代码存在 Bug，请找出问题并给出修复方案：\n\n```{{语言}}\n{{代码}}\n```\n\n错误信息：{{错误信息}}', category: '编程', isBuiltin: true },
  { title: '中英翻译', content: '请将以下内容翻译为{{目标语言}}，保持原意和语气：\n\n{{内容}}', category: '翻译', isBuiltin: true },
  { title: '文章总结', content: '请用3-5个要点总结以下内容的核心观点：\n\n{{内容}}', category: '分析', isBuiltin: true },
  { title: '方案分析', content: '请从以下几个维度分析这个{{方案/问题}}：\n1. 优势\n2. 劣势\n3. 风险\n4. 改进建议\n\n{{描述}}', category: '分析', isBuiltin: true },
  { title: '文案撰写', content: '请为{{产品/场景}}撰写一段吸引人的文案，要求：\n- 字数：{{字数}}字左右\n- 风格：{{风格}}\n- 目标受众：{{受众}}', category: '创作', isBuiltin: true },
  { title: '邮件撰写', content: '请帮我写一封{{场景}}邮件，收件人是{{角色}}，要点如下：\n\n{{要点}}', category: '效率', isBuiltin: true },
  { title: '简历优化', content: '请帮我优化以下简历内容，突出亮点，使表达更专业：\n\n{{简历}}', category: '创作', isBuiltin: true },
]

export function usePrompts() {
  const templates = reactive<PromptTemplate[]>(getItem<PromptTemplate[]>('promptTemplates', []))

  function init() {
    if (templates.length === 0) {
      templates.push(...builtinTemplates.map(t => ({ ...t, id: generateId() })))
      save()
    }
  }

  function save() {
    setItem('promptTemplates', [...templates])
  }

  function addTemplate(t: Omit<PromptTemplate, 'id'>) {
    templates.push({ ...t, id: generateId() })
    save()
  }

  function deleteTemplate(id: string) {
    const idx = templates.findIndex(t => t.id === id)
    if (idx < 0 || templates[idx].isBuiltin) return
    templates.splice(idx, 1)
    save()
  }

  function updateTemplate(id: string, data: Partial<Omit<PromptTemplate, 'id' | 'isBuiltin'>>) {
    const t = templates.find(t => t.id === id)
    if (!t) return
    Object.assign(t, data)
    save()
  }

  const categories = ['创作', '编程', '翻译', '分析', '效率', '通用'] as const

  init()

  return { templates, categories, addTemplate, deleteTemplate, updateTemplate }
}
