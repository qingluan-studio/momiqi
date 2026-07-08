import { reactive, computed } from 'vue'
import { guardedLoad, guardedSave } from '../utils/data-integrity'
import { generateId } from '../utils/markdown'

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

export interface TaskStep {
  id: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dependsOn: string[]
  assignedTool: string
  assignedToolName: string
  estimatedMinutes: number
  actualMinutes: number
  result: string
  errorLog: string
  retryCount: number
  maxRetries: number
}

export interface PlanTemplate {
  id: string
  name: string
  description: string
  category: string
  steps: Omit<TaskStep, 'id' | 'status' | 'result' | 'errorLog' | 'retryCount' | 'actualMinutes'>[]
  tags: string[]
  createdAt: number
  usageCount: number
}

export interface ActivePlan {
  id: string
  title: string
  description: string
  goal: string
  steps: TaskStep[]
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  createdAt: number
  startedAt: number
  completedAt: number
  estimatedTotalMinutes: number
  actualTotalMinutes: number
  progress: number
  category: string
  tags: string[]
}

interface PlannerState {
  plans: ActivePlan[]
  templates: PlanTemplate[]
  history: ActivePlan[]
  activePlanId: string | null
}

const BUILTIN_TEMPLATES: Omit<PlanTemplate, 'id' | 'createdAt' | 'usageCount'>[] = [
  {
    name: '项目初始化',
    description: '创建新项目并配置开发环境',
    category: '开发',
    steps: [
      { description: '创建项目目录结构', priority: 'critical', dependsOn: [], assignedTool: '', assignedToolName: '', estimatedMinutes: 5, maxRetries: 2 },
      { description: '初始化包管理器', priority: 'high', dependsOn: [], assignedTool: '', assignedToolName: '', estimatedMinutes: 3, maxRetries: 3 },
      { description: '安装核心依赖', priority: 'high', dependsOn: ['1'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 5 },
      { description: '配置代码规范 (lint/format)', priority: 'medium', dependsOn: ['2'], assignedTool: '', assignedToolName: '', estimatedMinutes: 5, maxRetries: 2 },
      { description: '创建入口文件', priority: 'high', dependsOn: ['3'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
      { description: '验证项目可运行', priority: 'high', dependsOn: ['4', '5'], assignedTool: '', assignedToolName: '', estimatedMinutes: 5, maxRetries: 3 },
    ],
    tags: ['项目', '初始化', '脚手架'],
  },
  {
    name: 'Bug修复流程',
    description: '系统化定位和修复 Bug',
    category: '调试',
    steps: [
      { description: '复现 Bug 并记录步骤', priority: 'critical', dependsOn: [], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
      { description: '分析日志和错误堆栈', priority: 'high', dependsOn: ['1'], assignedTool: '', assignedToolName: '', estimatedMinutes: 15, maxRetries: 3 },
      { description: '定位可疑代码段', priority: 'high', dependsOn: ['2'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 3 },
      { description: '编写修复代码', priority: 'high', dependsOn: ['3'], assignedTool: '', assignedToolName: '', estimatedMinutes: 20, maxRetries: 5 },
      { description: '本地测试验证', priority: 'high', dependsOn: ['4'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 3 },
      { description: '回归测试', priority: 'medium', dependsOn: ['5'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
    ],
    tags: ['Bug', '调试', '修复'],
  },
  {
    name: 'API 端点开发',
    description: '从零开发一个新的 API 端点',
    category: '开发',
    steps: [
      { description: '定义请求/响应数据结构', priority: 'critical', dependsOn: [], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
      { description: '编写路由和中间件', priority: 'high', dependsOn: ['1'], assignedTool: '', assignedToolName: '', estimatedMinutes: 15, maxRetries: 3 },
      { description: '实现业务逻辑', priority: 'high', dependsOn: ['2'], assignedTool: '', assignedToolName: '', estimatedMinutes: 30, maxRetries: 5 },
      { description: '添加错误处理', priority: 'high', dependsOn: ['3'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
      { description: '编写单元测试', priority: 'medium', dependsOn: ['4'], assignedTool: '', assignedToolName: '', estimatedMinutes: 20, maxRetries: 3 },
      { description: 'API 文档更新', priority: 'low', dependsOn: ['5'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 1 },
    ],
    tags: ['API', '后端', '开发'],
  },
  {
    name: '前端页面开发',
    description: '开发新的前端页面或组件',
    category: '开发',
    steps: [
      { description: '设计 UI 结构和组件拆分', priority: 'critical', dependsOn: [], assignedTool: '', assignedToolName: '', estimatedMinutes: 15, maxRetries: 2 },
      { description: '创建组件文件和样式', priority: 'high', dependsOn: ['1'], assignedTool: '', assignedToolName: '', estimatedMinutes: 20, maxRetries: 3 },
      { description: '实现交互逻辑', priority: 'high', dependsOn: ['2'], assignedTool: '', assignedToolName: '', estimatedMinutes: 25, maxRetries: 4 },
      { description: '对接 API 和数据流', priority: 'high', dependsOn: ['3'], assignedTool: '', assignedToolName: '', estimatedMinutes: 20, maxRetries: 3 },
      { description: '移动端适配', priority: 'medium', dependsOn: ['2'], assignedTool: '', assignedToolName: '', estimatedMinutes: 15, maxRetries: 2 },
      { description: '性能优化和测试', priority: 'medium', dependsOn: ['4', '5'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
    ],
    tags: ['前端', '组件', '页面'],
  },
  {
    name: '数据迁移',
    description: '数据库结构变更和数据迁移',
    category: '运维',
    steps: [
      { description: '备份当前数据库', priority: 'critical', dependsOn: [], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 3 },
      { description: '编写迁移脚本', priority: 'high', dependsOn: ['1'], assignedTool: '', assignedToolName: '', estimatedMinutes: 20, maxRetries: 5 },
      { description: '在测试环境执行', priority: 'high', dependsOn: ['2'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 3 },
      { description: '验证数据完整性', priority: 'high', dependsOn: ['3'], assignedTool: '', assignedToolName: '', estimatedMinutes: 15, maxRetries: 2 },
      { description: '生产环境执行', priority: 'critical', dependsOn: ['4'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
      { description: '监控和回滚准备', priority: 'high', dependsOn: ['5'], assignedTool: '', assignedToolName: '', estimatedMinutes: 5, maxRetries: 1 },
    ],
    tags: ['数据库', '迁移', '运维'],
  },
  {
    name: '内容创作',
    description: '撰写技术文章、文档或报告',
    category: '创作',
    steps: [
      { description: '确定主题和受众', priority: 'high', dependsOn: [], assignedTool: '', assignedToolName: '', estimatedMinutes: 5, maxRetries: 2 },
      { description: '收集资料和大纲', priority: 'high', dependsOn: ['1'], assignedTool: '', assignedToolName: '', estimatedMinutes: 20, maxRetries: 3 },
      { description: '撰写初稿', priority: 'high', dependsOn: ['2'], assignedTool: '', assignedToolName: '', estimatedMinutes: 40, maxRetries: 5 },
      { description: '校对和润色', priority: 'medium', dependsOn: ['3'], assignedTool: '', assignedToolName: '', estimatedMinutes: 15, maxRetries: 3 },
      { description: '配图和排版', priority: 'low', dependsOn: ['4'], assignedTool: '', assignedToolName: '', estimatedMinutes: 10, maxRetries: 2 },
      { description: '发布和推广', priority: 'low', dependsOn: ['5'], assignedTool: '', assignedToolName: '', estimatedMinutes: 5, maxRetries: 1 },
    ],
    tags: ['创作', '文档', '写作'],
  },
]

const DEFAULT_STATE: PlannerState = {
  plans: [],
  templates: [],
  history: [],
  activePlanId: null,
}

export function usePlanner() {
  const state = reactive<PlannerState>(
    guardedLoad<PlannerState>('plannerState', { ...DEFAULT_STATE })
  )

  const activePlan = computed(() =>
    state.activePlanId ? state.plans.find((p) => p.id === state.activePlanId) : null
  )

  const completedPlans = computed(() =>
    [...state.history].sort((a, b) => b.completedAt - a.completedAt)
  )

  function save() {
    guardedSave('plannerState', { ...state })
  }

  function initTemplates() {
    if (state.templates.length > 0) return
    for (const tpl of BUILTIN_TEMPLATES) {
      const entity: PlanTemplate = {
        ...tpl,
        id: generateId(),
        createdAt: Date.now(),
        usageCount: 0,
      }
      state.templates.push(entity)
    }
    save()
  }

  function createPlan(title: string, goal: string, category: string = '', tags: string[] = []): ActivePlan {
    const plan: ActivePlan = {
      id: generateId(),
      title,
      description: '',
      goal,
      steps: [],
      status: 'draft',
      createdAt: Date.now(),
      startedAt: 0,
      completedAt: 0,
      estimatedTotalMinutes: 0,
      actualTotalMinutes: 0,
      progress: 0,
      category,
      tags,
    }
    state.plans.push(plan)
    save()
    return plan
  }

  function createPlanFromTemplate(templateId: string, goal: string): ActivePlan | null {
    const tpl = state.templates.find((t) => t.id === templateId)
    if (!tpl) return null

    tpl.usageCount++
    const plan: ActivePlan = {
      id: generateId(),
      title: `${tpl.name} - ${goal.substring(0, 30)}...`,
      description: tpl.description,
      goal,
      steps: tpl.steps.map((s, i) => ({
        ...s,
        id: generateId(),
        status: 'pending' as TaskStatus,
        result: '',
        errorLog: '',
        retryCount: 0,
        actualMinutes: 0,
      })),
      status: 'draft',
      createdAt: Date.now(),
      startedAt: 0,
      completedAt: 0,
      estimatedTotalMinutes: tpl.steps.reduce((sum, s) => sum + s.estimatedMinutes, 0),
      actualTotalMinutes: 0,
      progress: 0,
      category: tpl.category,
      tags: tpl.tags,
    }
    state.plans.push(plan)
    save()
    return plan
  }

  function addStep(planId: string, step: Omit<TaskStep, 'id' | 'status' | 'result' | 'errorLog' | 'retryCount' | 'actualMinutes'>): TaskStep {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) throw new Error('计划不存在')

    const newStep: TaskStep = {
      ...step,
      id: generateId(),
      status: 'pending',
      result: '',
      errorLog: '',
      retryCount: 0,
      actualMinutes: 0,
    }
    plan.steps.push(newStep)
    plan.estimatedTotalMinutes += step.estimatedMinutes
    recalcProgress(plan)
    save()
    return newStep
  }

  function updateStepStatus(planId: string, stepId: string, status: TaskStatus, result: string = '', errorLog: string = '') {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return

    const step = plan.steps.find((s) => s.id === stepId)
    if (!step) return

    step.status = status
    if (result) step.result = result
    if (errorLog) step.errorLog = errorLog

    if (status === 'completed') {
      step.actualMinutes = step.estimatedMinutes
    }

    recalcProgress(plan)
    save()
  }

  function retryStep(planId: string, stepId: string) {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return

    const step = plan.steps.find((s) => s.id === stepId)
    if (!step) return

    if (step.retryCount >= step.maxRetries) return

    step.retryCount++
    step.status = 'pending'
    step.result = ''
    step.errorLog = ''
    recalcProgress(plan)
    save()
  }

  function startPlan(planId: string) {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return
    plan.status = 'active'
    plan.startedAt = Date.now()
    state.activePlanId = planId
    save()
  }

  function pausePlan(planId: string) {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return
    plan.status = 'paused'
    if (state.activePlanId === planId) state.activePlanId = null
    save()
  }

  function completePlan(planId: string) {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return
    plan.status = 'completed'
    plan.completedAt = Date.now()
    plan.progress = 100
    if (state.activePlanId === planId) state.activePlanId = null
    state.plans = state.plans.filter((p) => p.id !== planId)
    state.history.push(plan)
    save()
  }

  function cancelPlan(planId: string) {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return
    plan.status = 'cancelled'
    if (state.activePlanId === planId) state.activePlanId = null
    state.plans = state.plans.filter((p) => p.id !== planId)
    state.history.push(plan)
    save()
  }

  function deletePlan(planId: string) {
    if (state.activePlanId === planId) state.activePlanId = null
    state.plans = state.plans.filter((p) => p.id !== planId)
    save()
  }

  function recalcProgress(plan: ActivePlan) {
    if (plan.steps.length === 0) {
      plan.progress = 0
      return
    }
    const completed = plan.steps.filter((s) => s.status === 'completed').length
    const total = plan.steps.length
    plan.progress = Math.round((completed / total) * 100)
  }

  function getNextStep(planId: string): TaskStep | null {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan || plan.status !== 'active') return null

    for (const step of plan.steps) {
      if (step.status !== 'pending') continue
      if (step.dependsOn.length === 0) return step
      const allDepsComplete = step.dependsOn.every((depId) => {
        const dep = plan.steps.find((s) => s.id === depId)
        return dep && dep.status === 'completed'
      })
      if (allDepsComplete) return step
    }
    return null
  }

  function autoAdvance(planId: string) {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return

    const next = getNextStep(planId)
    if (next) {
      updateStepStatus(planId, next.id, 'in_progress')
    } else {
      const allDone = plan.steps.every((s) => s.status === 'completed')
      const hasFailed = plan.steps.some((s) => s.status === 'failed')

      if (allDone) {
        completePlan(planId)
      } else if (hasFailed) {
        const failedSteps = plan.steps.filter((s) => s.status === 'failed')
        for (const fs of failedSteps) {
          if (fs.retryCount < fs.maxRetries) {
            retryStep(planId, fs.id)
          }
        }
      }
    }
  }

  function suggestStepCompletion(step: TaskStep): string {
    return `步骤: ${step.description}
状态: ${step.status}
预计: ${step.estimatedMinutes}分钟
依赖: ${step.dependsOn.length > 0 ? `等待步骤 ${step.dependsOn.join(', ')} 完成` : '无'}
建议工具: ${step.assignedToolName || '根据任务描述自动匹配'}
操作: 请执行此步骤并报告结果`
  }

  function suggestPlanForGoal(goal: string): string {
    const keywords = goal.toLowerCase().split(/[\s,，]+/).filter(Boolean)
    const scored = state.templates.map((t) => {
      let score = 0
      const nameLow = t.name.toLowerCase()
      const descLow = t.description.toLowerCase()
      const tagsLow = t.tags.map((tg) => tg.toLowerCase())
      const catLow = t.category.toLowerCase()
      for (const kw of keywords) {
        if (kw.length < 2) continue
        if (nameLow.includes(kw)) score += 5
        if (catLow.includes(kw)) score += 3
        if (descLow.includes(kw)) score += 2
        if (tagsLow.some((tg) => tg.includes(kw))) score += 2
      }
      return { template: t, score }
    })
    const best = scored.sort((a, b) => b.score - a.score)
    if (best.length > 0 && best[0].score > 0) {
      return `推荐使用模板「${best[0].template.name}」: ${best[0].template.description}`
    }
    return '未找到匹配模板。建议使用自定义计划。'
  }

  return {
    state,
    activePlan,
    completedPlans,
    initTemplates,
    createPlan,
    createPlanFromTemplate,
    addStep,
    updateStepStatus,
    retryStep,
    startPlan,
    pausePlan,
    completePlan,
    cancelPlan,
    deletePlan,
    getNextStep,
    autoAdvance,
    suggestStepCompletion,
    suggestPlanForGoal,
  }
}
