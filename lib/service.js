import { stat } from 'node:fs/promises'
import { KanbanError } from './errors.js'
import { readTaskDetail, scanProjects } from './projects.js'
import { addRoots, defaultRootsFile, readRoots, removeRoots } from './roots.js'
import {
  acceptTask,
  blockTask,
  createTask,
  finishTask,
  rejectTask,
  startTask,
  taskInstruction,
} from './tasks.js'

function projectNotFound() {
  return new KanbanError('项目不在看板中，请刷新后重试', 404)
}

export class KanbanService {
  constructor(options = {}) {
    this.rootsFile = options.rootsFile ?? defaultRootsFile()
    this.depth = options.depth ?? 4
    this.maxMs = options.maxMs ?? 10_000
    this.cacheMs = options.cacheMs ?? 3_000
    this.listWorkspaces =
      typeof options.listWorkspaces === 'function' ? options.listWorkspaces : async () => []
    this.cache = null
    this.pending = null
  }

  invalidate() {
    this.cache = null
  }

  /** External directories only; DSH workspaces are discovered automatically. */
  async roots() {
    return readRoots(this.rootsFile)
  }

  async state(options = {}) {
    const force = options.force === true
    const fresh = this.cache && Date.now() - this.cache.at < this.cacheMs
    if (!force && fresh) return this.cache.value
    if (this.pending) await this.pending
    if (!force && this.cache && Date.now() - this.cache.at < this.cacheMs) {
      return this.cache.value
    }
    this.pending = (async () => {
      let workspaces = []
      try {
        workspaces = await this.listWorkspaces()
      } catch {
        workspaces = []
      }
      const workspaceList = []
      for (const workspace of Array.isArray(workspaces) ? workspaces : []) {
        if (!workspace || typeof workspace.path !== 'string' || !workspace.path) continue
        let info
        try {
          info = await stat(workspace.path)
        } catch {
          continue
        }
        if (!info.isDirectory()) continue
        workspaceList.push({
          id: workspace.id ?? null,
          path: workspace.path,
          title: workspace.title || workspace.path.split('/').filter(Boolean).pop() || workspace.path,
        })
      }
      const externalRoots = await this.roots()
      const scanRoots = [
        ...new Set([...workspaceList.map((workspace) => workspace.path), ...externalRoots]),
      ]
      const result = await scanProjects(scanRoots, { depth: this.depth, maxMs: this.maxMs })
      return { workspaces: workspaceList, externalRoots, scanRoots, ...result }
    })()
    try {
      const value = await this.pending
      this.cache = { at: Date.now(), value }
      return value
    } finally {
      this.pending = null
    }
  }

  async addRoots(paths) {
    const result = await addRoots(this.rootsFile, paths)
    this.invalidate()
    return result
  }

  async removeRoots(paths) {
    const result = await removeRoots(this.rootsFile, paths)
    this.invalidate()
    return result
  }

  async findProject(projectId, { force = false } = {}) {
    let data = await this.state({ force })
    let project = data.projects.find((item) => item.project_id === projectId)
    if (!project && !force) {
      data = await this.state({ force: true })
      project = data.projects.find((item) => item.project_id === projectId)
    }
    if (!project) throw projectNotFound()
    return project
  }

  async task(projectId, taskId) {
    const project = await this.findProject(projectId)
    const task = project.tasks.find((item) => item.id === taskId)
    if (!task) throw new KanbanError('任务不存在', 404)
    const detail = await readTaskDetail(project.path, task)
    return {
      project: {
        project_id: project.project_id,
        name: project.name,
        path: project.path,
        writable: project.writable,
        read_only_reason: project.read_only_reason,
      },
      task,
      detail: { path: detail.path, text: detail.text, exists: detail.exists },
      instruction: taskInstruction(project, task, project.path),
    }
  }

  async instruction(projectId, taskId) {
    const project = await this.findProject(projectId)
    const task = project.tasks.find((item) => item.id === taskId)
    if (!task) throw new KanbanError('任务不存在', 404)
    return taskInstruction(project, task, project.path)
  }

  async createTask(projectId, payload) {
    const project = await this.findProject(projectId)
    if (!project.writable) {
      throw new KanbanError(project.read_only_reason || '项目只读', 403)
    }
    const result = await createTask(project.path, payload)
    this.invalidate()
    return { ...result, project_id: project.project_id }
  }

  async startTask(projectId, taskId, options = {}) {
    const project = await this.findProject(projectId)
    const result = await startTask(project.path, taskId, options)
    this.invalidate()
    return result
  }

  async finishTask(projectId, taskId, payload) {
    const project = await this.findProject(projectId)
    const result = await finishTask(project.path, taskId, payload)
    this.invalidate()
    return result
  }

  async acceptTask(projectId, taskId) {
    const project = await this.findProject(projectId)
    const result = await acceptTask(project.path, taskId)
    this.invalidate()
    return result
  }

  async rejectTask(projectId, taskId, payload = {}) {
    const project = await this.findProject(projectId)
    const result = await rejectTask(project.path, taskId, payload)
    this.invalidate()
    return result
  }

  async blockTask(projectId, taskId, payload) {
    const project = await this.findProject(projectId)
    const result = await blockTask(project.path, taskId, payload)
    this.invalidate()
    return result
  }
}
