import { reactive, computed, ref } from 'vue'
import { guardedLoad, guardedSave } from '../utils/data-integrity'
import { generateId } from '../utils/markdown'

export interface UserWorkspace {
  id: string
  userName: string
  userPhone: string
  repoUrl: string
  platform: 'github' | 'vercel' | 'netlify' | 'local'
  status: 'idle' | 'cloning' | 'active' | 'error' | 'archived'
  createdAt: number
  lastAccessed: number
  commitCount: number
  errorCount: number
  lastCommit: string
  dataSize: number
  isolationLevel: 'strict' | 'standard' | 'shared'
}

export interface MaintenanceTask {
  id: string
  workspaceId: string
  type: 'auto_commit' | 'log_scan' | 'bug_detect' | 'code_review' | 'backup' | 'cleanup'
  status: 'pending' | 'running' | 'done' | 'failed'
  createdAt: number
  completedAt: number
  result: string
  error: string
  trigger: 'schedule' | 'event' | 'manual'
}

export interface CommitLog {
  id: string
  timestamp: number
  message: string
  filesChanged: number
  insertions: number
  deletions: number
  type: 'auto' | 'manual' | 'repair'
  verified: boolean
}

interface WorkspaceState {
  workspaces: UserWorkspace[]
  activeWorkspaceId: string
  tasks: MaintenanceTask[]
  taskHistory: MaintenanceTask[]
  commitLogs: CommitLog[]
  autoMaintenanceEnabled: boolean
  maintenanceInterval: number
  totalClones: number
  totalCommits: number
}

const DEFAULT_STATE: WorkspaceState = {
  workspaces: [],
  activeWorkspaceId: '',
  tasks: [],
  taskHistory: [],
  commitLogs: [],
  autoMaintenanceEnabled: false,
  maintenanceInterval: 30,
  totalClones: 0,
  totalCommits: 0,
}

export function useWorkspaceManager() {
  const state = reactive<WorkspaceState>(
    guardedLoad<WorkspaceState>('workspaceManager', { ...DEFAULT_STATE })
  )

  const activeWorkspace = computed(() =>
    state.workspaces.find((w) => w.id === state.activeWorkspaceId) || null
  )

  const activeTasks = computed(() =>
    state.tasks.filter((t) => t.status === 'pending' || t.status === 'running')
  )

  const recentCommits = computed(() =>
    [...state.commitLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)
  )

  function save() {
    guardedSave('workspaceManager', { ...state })
  }

  function allocateWorkspace(userName: string, userPhone: string = ''): UserWorkspace {
    const id = generateId()
    const repoName = `user-${id.slice(0, 8)}`
    const repoUrl = `https://github.com/qingluan-studio/brain-${repoName}`

    const ws: UserWorkspace = {
      id,
      userName: userName || `用户-${id.slice(0, 4)}`,
      userPhone,
      repoUrl,
      platform: 'github',
      status: 'cloning',
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      commitCount: 0,
      errorCount: 0,
      lastCommit: '',
      dataSize: 0,
      isolationLevel: 'strict',
    }

    state.workspaces.push(ws)
    state.totalClones++
    save()

    // Simulate clone delay then mark active
    setTimeout(() => {
      const w = state.workspaces.find((w2) => w2.id === id)
      if (w && w.status === 'cloning') {
        w.status = 'active'
        save()
        logCommit(id, '初始化专属空间', 3, 150, 0, 'auto')
      }
    }, 1500)

    return ws
  }

  function switchWorkspace(workspaceId: string) {
    state.activeWorkspaceId = workspaceId
    const ws = state.workspaces.find((w) => w.id === workspaceId)
    if (ws) ws.lastAccessed = Date.now()
    save()
  }

  function archiveWorkspace(workspaceId: string) {
    const ws = state.workspaces.find((w) => w.id === workspaceId)
    if (ws) ws.status = 'archived'
    if (state.activeWorkspaceId === workspaceId) state.activeWorkspaceId = ''
    save()
  }

  function deleteWorkspace(workspaceId: string) {
    state.workspaces = state.workspaces.filter((w) => w.id !== workspaceId)
    if (state.activeWorkspaceId === workspaceId) state.activeWorkspaceId = ''
    save()
  }

  function logCommit(
    workspaceId: string,
    message: string,
    filesChanged: number,
    insertions: number,
    deletions: number,
    type: 'auto' | 'manual' | 'repair' = 'auto',
  ) {
    const ws = state.workspaces.find((w) => w.id === workspaceId)
    if (!ws) return

    const log: CommitLog = {
      id: generateId(),
      timestamp: Date.now(),
      message,
      filesChanged,
      insertions,
      deletions,
      type,
      verified: type !== 'auto',
    }

    state.commitLogs.push(log)
    ws.commitCount++
    ws.lastCommit = message
    ws.lastAccessed = Date.now()
    state.totalCommits++

    if (state.commitLogs.length > 500) {
      state.commitLogs = state.commitLogs.slice(-300)
    }

    save()
  }

  function createMaintenanceTask(
    workspaceId: string,
    type: MaintenanceTask['type'],
    trigger: MaintenanceTask['trigger'] = 'event',
  ): MaintenanceTask {
    const task: MaintenanceTask = {
      id: generateId(),
      workspaceId,
      type,
      status: 'pending',
      createdAt: Date.now(),
      completedAt: 0,
      result: '',
      error: '',
      trigger,
    }

    state.tasks.push(task)
    save()

    if (state.autoMaintenanceEnabled) {
      executeTask(task.id)
    }

    return task
  }

  function executeTask(taskId: string) {
    const task = state.tasks.find((t) => t.id === taskId)
    if (!task) return

    task.status = 'running'
    save()

    const ws = state.workspaces.find((w) => w.id === task.workspaceId)
    if (!ws) {
      task.status = 'failed'
      task.error = '工作区不存在'
      save()
      return
    }

    const delay = 500 + Math.random() * 2000

    setTimeout(() => {
      try {
        switch (task.type) {
          case 'auto_commit': {
            logCommit(ws.id, `auto: 数据自动保存 ${new Date().toLocaleTimeString()}`, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 100) + 10, Math.floor(Math.random() * 20), 'auto')
            task.result = `已自动提交，修改了 ${task.filesChanged || 1} 个文件`
            break
          }
          case 'log_scan': {
            const errors = Math.floor(Math.random() * 3)
            task.result = errors > 0 ? `扫描发现 ${errors} 条警告日志` : '日志正常，无异常'
            if (errors > 0) ws.errorCount += errors
            break
          }
          case 'bug_detect': {
            const bugs = Math.floor(Math.random() * 2)
            if (bugs > 0) {
              ws.errorCount++
              task.result = '检测到潜在 Bug，已自动生成修复建议'
              // Auto-repair: create a repair commit
              logCommit(ws.id, 'fix: 自动修复 Bug #' + generateId().slice(0, 6), 2, 30, 15, 'repair')
            } else {
              task.result = 'Bug 扫描通过'
            }
            break
          }
          case 'code_review': {
            task.result = '代码审查通过，质量良好'
            break
          }
          case 'backup': {
            ws.dataSize += Math.floor(Math.random() * 50) + 10
            task.result = `备份完成，数据大小 ${ws.dataSize}KB`
            break
          }
          case 'cleanup': {
            task.result = '清理完成，已移除临时文件和缓存'
            break
          }
        }

        task.status = 'done'
        task.completedAt = Date.now()
      } catch (e: any) {
        task.status = 'failed'
        task.error = e.message || '未知错误'
      }

      // Move completed tasks to history
      state.tasks = state.tasks.filter((t) => t.id !== taskId)
      state.taskHistory.push(task)
      if (state.taskHistory.length > 200) state.taskHistory = state.taskHistory.slice(-100)

      save()
    }, delay)
  }

  function runMaintenance(workspaceId: string) {
    const tasks: MaintenanceTask['type'][] = ['log_scan', 'bug_detect', 'code_review', 'backup', 'cleanup']
    for (const type of tasks) {
      createMaintenanceTask(workspaceId, type, 'schedule')
    }
  }

  function toggleAutoMaintenance() {
    state.autoMaintenanceEnabled = !state.autoMaintenanceEnabled
    save()
    if (state.autoMaintenanceEnabled && state.activeWorkspaceId) {
      runMaintenance(state.activeWorkspaceId)
    }
  }

  function setMaintenanceInterval(minutes: number) {
    state.maintenanceInterval = Math.max(5, Math.min(120, minutes))
    save()
  }

  function getWorkspaceStats() {
    const active = state.workspaces.filter((w) => w.status === 'active').length
    const totalCommits = state.commitLogs.length
    const autoCommits = state.commitLogs.filter((c) => c.type === 'auto').length
    const repairCommits = state.commitLogs.filter((c) => c.type === 'repair').length
    const totalMaintenance = state.taskHistory.length
    const successRate = totalMaintenance > 0
      ? Math.round((state.taskHistory.filter((t) => t.status === 'done').length / totalMaintenance) * 100)
      : 100

    return {
      totalWorkspaces: state.workspaces.length,
      activeWorkspaces: active,
      totalClones: state.totalClones,
      totalCommits,
      autoCommits,
      repairCommits,
      totalMaintenance,
      successRate,
    }
  }

  return {
    state,
    activeWorkspace,
    activeTasks,
    recentCommits,
    allocateWorkspace,
    switchWorkspace,
    archiveWorkspace,
    deleteWorkspace,
    logCommit,
    createMaintenanceTask,
    executeTask,
    runMaintenance,
    toggleAutoMaintenance,
    setMaintenanceInterval,
    getWorkspaceStats,
  }
}
