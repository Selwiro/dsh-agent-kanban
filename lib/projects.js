import { constants as FS } from 'node:fs'
import { access, readdir, readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { KanbanError } from './errors.js'

export const STATUSES = new Set(['todo', 'in_progress', 'blocked', 'done', 'cancelled'])
export const CLOSED_STATUSES = new Set(['completed', 'cancelled'])
export const INDEX = 'management/project.json'
export const INDEX_LOCATIONS = [INDEX, 'project.json']
export const MAX_DETAIL_BYTES = 1_000_000

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '__pycache__',
  'vendor',
  'site-packages',
  'dist',
  'build',
  'target',
  '.git',
  '.next',
  '.venv',
  'venv',
])

function isInside(parent, child) {
  return child === parent || child.startsWith(parent + path.sep)
}

/** Read JSON, tolerating a UTF-8 BOM like the Python dashboard does. */
export async function readJsonFile(file) {
  const text = await readFile(file, 'utf8')
  return JSON.parse(text.replace(/^\uFEFF/, ''))
}

export function validateProject(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new KanbanError('项目索引不是对象', 422)
  }
  if (data.schema_version !== 1) {
    throw new KanbanError('不支持此项目索引版本', 422)
  }
  for (const key of ['project_id', 'name']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) {
      throw new KanbanError(`项目索引缺少 ${key}`, 422)
    }
  }
  if (!Array.isArray(data.tasks)) {
    throw new KanbanError('项目索引缺少任务列表', 422)
  }
  const ids = new Set()
  for (const task of data.tasks) {
    if (
      !task ||
      typeof task !== 'object' ||
      typeof task.id !== 'string' ||
      !task.id.trim() ||
      typeof task.title !== 'string' ||
      !task.title.trim() ||
      typeof task.status !== 'string' ||
      !STATUSES.has(task.status)
    ) {
      throw new KanbanError('项目索引含有无效任务', 422)
    }
    if (ids.has(task.id)) {
      throw new KanbanError('项目索引含有重复任务编号', 422)
    }
    ids.add(task.id)
  }
}

/**
 * Resolve a project-relative path without allowing it to escape the project.
 * Symlinks whose target leaves the project are rejected as well.
 */
export async function resolveInside(root, value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new KanbanError('项目路径无效')
  }
  if (path.isAbsolute(value)) {
    throw new KanbanError('项目路径越出目录')
  }
  const normalized = path.normalize(value)
  if (normalized.split(path.sep).includes('..')) {
    throw new KanbanError('项目路径越出目录')
  }
  const full = path.resolve(root, normalized)
  const rootReal = await realpath(root)
  if (!isInside(rootReal, full)) {
    throw new KanbanError('项目路径越出目录')
  }
  try {
    const targetReal = await realpath(full)
    if (!isInside(rootReal, targetReal)) {
      throw new KanbanError('项目路径越出目录')
    }
  } catch (error) {
    if (error instanceof KanbanError) throw error
    if (error?.code !== 'ENOENT') throw new KanbanError('项目路径无法解析')
  }
  return full
}

/** Return the loaded project for a directory, or null when it has no index. */
export async function loadProjectAt(directory) {
  let invalid = null
  for (const location of INDEX_LOCATIONS) {
    const file = path.join(directory, location)
    try {
      const info = await stat(file)
      if (!info.isFile()) continue
      const project = await readJsonFile(file)
      validateProject(project)
      return { project, location, file, dir: directory }
    } catch (error) {
      if (error?.code === 'ENOENT') continue
      invalid = error
    }
  }
  if (invalid) {
    throw new KanbanError(`项目索引无法读取或格式不正确：${path.basename(directory)}`, 422)
  }
  return null
}

/** Return why the board must not change this project, or null when it can. */
export async function writeBlocker(root, project, location) {
  if (location !== INDEX) return '项目索引位于根目录，无法写入'
  if ((project.task_source ?? 'local') !== 'local') return '任务由外部来源维护'
  if (Object.hasOwn(project, 'revision')) return '索引由任务服务维护'
  if (CLOSED_STATUSES.has(project.status)) return '项目已结项，请先重启项目'
  try {
    const management = path.join(root, 'management')
    const tasks = path.join(management, 'tasks')
    const lock = path.join(management, '.project-init.lock')
    await access(path.join(root, INDEX), FS.W_OK)
    await access(management, FS.W_OK | FS.X_OK)
    let tasksExist = false
    try {
      tasksExist = (await stat(tasks)).isDirectory()
    } catch (error) {
      if (error?.code !== 'ENOENT') return '项目目录不可写'
    }
    if (tasksExist) await access(tasks, FS.W_OK | FS.X_OK)
    try {
      await access(lock, FS.W_OK)
    } catch (error) {
      if (error?.code !== 'ENOENT') return '项目目录不可写'
    }
    return null
  } catch {
    return '项目目录不可写'
  }
}

function publicTask(task, nextTaskId) {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    target_path: task.target_path ?? null,
    created_at: task.created_at ?? null,
    completed_at: task.completed_at ?? null,
    blocked_reason: task.blocked_reason ?? null,
    run_id: task.run_id ?? null,
    session_id: task.session_id ?? null,
    started_at: task.started_at ?? null,
    submitted_at: task.submitted_at ?? null,
    review: task.review === true,
    detail_path: task.detail_path ?? null,
    external: Boolean(task.detail_url),
    next: task.id === nextTaskId,
  }
}

export async function publicProject(entry) {
  const { project, dir, location } = entry
  const blocker = await writeBlocker(dir, project, location)
  const tasks = project.tasks.map((task) => publicTask(task, project.next_task_id))
  const counts = { todo: 0, in_progress: 0, review: 0, blocked: 0, done: 0, cancelled: 0 }
  for (const task of tasks) {
    if (task.review && task.status === 'in_progress') counts.review += 1
    else counts[task.status] += 1
  }
  const counted = tasks.filter((task) => task.status !== 'cancelled')
  return {
    project_id: project.project_id,
    name: project.name,
    summary: project.summary ?? '',
    type: project.type ?? 'other',
    stage: project.stage ?? '',
    status: project.status ?? 'active',
    updated_at: project.updated_at ?? null,
    next_task_id: project.next_task_id ?? null,
    path: dir,
    index_location: location,
    writable: blocker === null,
    read_only_reason: blocker,
    counts,
    total: counted.length,
    done: counts.done,
    tasks,
    next_task: tasks.find((task) => task.id === project.next_task_id) ?? tasks.find((task) => task.status === 'todo') ?? null,
  }
}

/** Scan configured roots for project indexes within the time budget. */
export async function scanProjects(roots, options = {}) {
  const depth = Number.isInteger(options.depth) && options.depth >= 0 ? Math.min(options.depth, 8) : 4
  const maxMs = Number.isFinite(options.maxMs) ? Math.min(Math.max(options.maxMs, 1000), 30_000) : 10_000
  const started = Date.now()
  const queue = roots.map((root) => ({ dir: root, level: 0 }))
  const seen = new Set()
  const found = []
  const issues = []
  let truncated = false

  while (queue.length) {
    if (Date.now() - started > maxMs) {
      truncated = true
      break
    }
    const { dir, level } = queue.shift()
    let real
    try {
      real = await realpath(dir)
    } catch {
      issues.push({ path: dir, message: '目录不存在或无法读取' })
      continue
    }
    if (seen.has(real)) continue
    seen.add(real)

    let loaded = null
    try {
      loaded = await loadProjectAt(real)
    } catch (error) {
      issues.push({ path: real, message: error.message })
    }
    if (loaded) {
      const nestedManagement =
        loaded.location === 'project.json' && path.basename(real) === 'management'
      if (nestedManagement) {
        try {
          const parent = await loadProjectAt(path.dirname(real))
          if (parent?.location === INDEX) loaded = null
        } catch {
          // Keep the nested index when its parent cannot be read.
        }
      }
      if (loaded) {
        found.push(loaded)
        // A project is a boundary: nested examples are not separate board entries.
        continue
      }
    }

    if (level >= depth) continue
    let entries = []
    try {
      entries = await readdir(real, { withFileTypes: true })
    } catch {
      issues.push({ path: real, message: '目录无法读取' })
      continue
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('.') || SKIP_DIRECTORIES.has(entry.name)) continue
      queue.push({ dir: path.join(real, entry.name), level: level + 1 })
    }
  }

  const counts = new Map()
  for (const entry of found) {
    const id = entry.project.project_id
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  const projects = []
  const seenIds = new Set()
  for (const entry of found) {
    const id = entry.project.project_id
    if (counts.get(id) > 1) {
      issues.push({ path: entry.dir, message: `项目编号重复：${id}` })
      continue
    }
    if (seenIds.has(id)) continue
    seenIds.add(id)
    projects.push(await publicProject(entry))
  }

  return { projects, issues, truncated, scannedAt: new Date().toISOString() }
}

export function defaultDetailPath(task) {
  return `management/tasks/${task.id}.md`
}

export async function readTaskDetail(root, task) {
  const relative = task.detail_path || defaultDetailPath(task)
  const file = await resolveInside(root, relative)
  try {
    const info = await stat(file)
    if (!info.isFile()) throw new KanbanError('任务详情不是文件', 422)
    if (info.size > MAX_DETAIL_BYTES) throw new KanbanError('任务详情超过 1 MB', 422)
    const text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
    return { path: relative, file, text, exists: true }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        path: relative,
        file,
        text: `# ${task.id} ${task.title}\n\n## 执行记录\n`,
        exists: false,
      }
    }
    throw error
  }
}
