import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { KanbanError } from './errors.js'
import { atomicWrite } from './fs-utils.js'
import { withLock } from './lock.js'
import {
  CLOSED_STATUSES,
  defaultDetailPath,
  loadProjectAt,
  resolveInside,
  writeBlocker,
} from './projects.js'

const TASK_ID = /^T([0-9]{1,12})$/
const REQUEST_ID = /^[a-zA-Z0-9-]+$/

export function nowIso(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hours = pad(Math.floor(Math.abs(offset) / 60))
  const minutes = pad(Math.abs(offset) % 60)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${hours}:${minutes}`
}

function blockerStatus(project) {
  return CLOSED_STATUSES.has(project.status) ? 409 : 403
}

async function loadWritable(root) {
  const entry = await loadProjectAt(root)
  if (!entry) throw new KanbanError('项目不存在', 404)
  const blocker = await writeBlocker(root, entry.project, entry.location)
  if (blocker) throw new KanbanError(blocker, blockerStatus(entry.project))
  return entry
}

async function saveProject(entry, project, timestamp) {
  project.updated_at = timestamp
  await atomicWrite(entry.file, JSON.stringify(project, null, 2) + '\n')
}

function findTask(project, taskId) {
  const task = project.tasks.find((item) => item.id === taskId)
  if (!task) throw new KanbanError('任务不存在', 404)
  return task
}

function textField(payload, key, limit, required = true) {
  const value = payload?.[key] ?? ''
  if (typeof value !== 'string') throw new KanbanError(`${key} 内容无效`)
  const text = value.trim()
  if ((required && !text) || text.length > limit) throw new KanbanError(`${key} 内容无效`)
  return text
}

function taskView(task) {
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
  }
}

export async function createTask(root, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new KanbanError('任务格式无效')
  }
  const title = textField(payload, 'title', 120)
  if (/[\r\n]/.test(title)) throw new KanbanError('任务标题无效')
  const scope = textField(payload, 'scope', 3000, false)
  const acceptance = textField(payload, 'acceptance', 3000, false)
  const providedRequest = textField(payload, 'request_id', 50, false)
  if (providedRequest && !REQUEST_ID.test(providedRequest)) {
    throw new KanbanError('请求编号无效')
  }
  const requestId = providedRequest || randomUUID()

  return withLock(root, async () => {
    const entry = await loadWritable(root)
    const existing = entry.project.tasks.find((task) => task.request_id === requestId)
    if (existing) {
      return { project_id: entry.project.project_id, task: taskView(existing), created: false }
    }

    const numbers = entry.project.tasks
      .map((task) => TASK_ID.exec(task.id))
      .filter(Boolean)
      .map((match) => Number(match[1]))
    let number = Math.max(0, ...numbers) + 1
    const marker = `<!-- kanban-request:${requestId} -->`
    let taskId = ''
    let relative = ''
    let detail = ''

    for (;;) {
      taskId = `T${String(number).padStart(3, '0')}`
      relative = `management/tasks/${taskId}.md`
      detail = await resolveInside(root, relative)
      try {
        const text = (await readFile(detail, 'utf8')).replace(/^\uFEFF/, '')
        if (text.split(/\r?\n/, 1)[0] === marker) break
      } catch (error) {
        if (error?.code === 'ENOENT') break
        throw error
      }
      number += 1
    }

    const sections = [`${marker}\n# ${taskId} ${title}`]
    if (scope) sections.push(`## 工作范围\n\n${scope}`)
    if (acceptance) sections.push(`## 验收\n\n${acceptance}`)
    sections.push('## 执行记录')
    await mkdir(path.dirname(detail), { recursive: true })
    await atomicWrite(detail, sections.join('\n\n') + '\n')

    const timestamp = nowIso()
    const task = {
      id: taskId,
      title,
      status: 'todo',
      detail_path: relative,
      created_at: timestamp,
      request_id: requestId,
    }
    entry.project.tasks.push(task)
    if (payload.set_next === true) entry.project.next_task_id = taskId
    await saveProject(entry, entry.project, timestamp)
    return { project_id: entry.project.project_id, task: taskView(task), created: true }
  })
}

export async function startTask(root, taskId, options = {}) {
  const sessionId =
    typeof options.session_id === 'string' && options.session_id.trim()
      ? options.session_id.trim()
      : ''
  return withLock(root, async () => {
    const entry = await loadWritable(root)
    const task = findTask(entry.project, taskId)
    if (task.detail_url) throw new KanbanError('请从外部任务来源更新此任务', 403)
    if (CLOSED_STATUSES.has(entry.project.status)) {
      throw new KanbanError('项目已结项，请先重启项目再开始任务', 409)
    }
    if (task.review === true) {
      throw new KanbanError('任务待验收，请先通过验收或退回重做', 409)
    }

    if (task.status === 'in_progress') {
      let changed = false
      if (sessionId && task.session_id !== sessionId) {
        task.session_id = sessionId
        changed = true
      }
      if (changed) await saveProject(entry, entry.project, nowIso())
      return {
        project_id: entry.project.project_id,
        task: taskView(task),
        run_id: task.run_id,
        already: true,
      }
    }
    if (task.status !== 'todo') throw new KanbanError('只有待办任务可以开始', 409)

    const timestamp = nowIso()
    task.status = 'in_progress'
    task.run_id = randomBytes(16).toString('hex')
    task.started_at = timestamp
    if (sessionId) task.session_id = sessionId
    await saveProject(entry, entry.project, timestamp)
    return {
      project_id: entry.project.project_id,
      task: taskView(task),
      run_id: task.run_id,
      already: false,
    }
  })
}

async function appendRun(root, task, runId, status, record, reason, timestamp) {
  const relative = task.detail_path || defaultDetailPath(task)
  const detail = await resolveInside(root, relative)
  let body
  try {
    body = (await readFile(detail, 'utf8')).replace(/^\uFEFF/, '')
  } catch (error) {
    if (error?.code === 'ENOENT') {
      body = `# ${task.id} ${task.title}\n\n## 执行记录\n`
    } else {
      throw error
    }
  }

  const marker = `<!-- task-run:${runId}:${status} -->`
  const lines = body.split(/\r?\n/)
  for (const other of ['done', 'blocked', 'review']) {
    if (other !== status && lines.includes(`<!-- task-run:${runId}:${other} -->`)) {
      throw new KanbanError('已保存另一种执行结果，请先重试原回写命令', 409)
    }
  }
  if (!lines.includes(marker)) {
    const explanation = reason ? `阻塞原因：${reason}\n\n` : ''
    await mkdir(path.dirname(detail), { recursive: true })
    await atomicWrite(detail, `${body.trimEnd()}\n\n### ${timestamp}\n\n${marker}\n\n${explanation}${record}\n`)
  }
  task.detail_path = relative
  return relative
}

export async function finishTask(root, taskId, payload = {}) {
  const runId = textField(payload, 'run_id', 64)
  const record = textField(payload, 'record', 200_000)
  return withLock(root, async () => {
    const entry = await loadWritable(root)
    const task = findTask(entry.project, taskId)
    if (task.detail_url) throw new KanbanError('请从外部任务来源更新此任务', 403)
    if (task.status === 'done' && task.run_id === runId) {
      return { project_id: entry.project.project_id, task: taskView(task), already: true }
    }
    if (task.review === true) {
      if (task.run_id === runId) {
        return { project_id: entry.project.project_id, task: taskView(task), already: true }
      }
      throw new KanbanError('任务待验收，请先通过验收或退回重做', 409)
    }
    if (task.status !== 'in_progress') throw new KanbanError('只有进行中的任务可以写回', 409)
    if (!runId || task.run_id !== runId) {
      throw new KanbanError('执行编号不匹配，请重新读取任务', 409)
    }

    const timestamp = nowIso()
    await appendRun(root, task, runId, 'review', record, '', timestamp)
    task.status = 'in_progress'
    task.review = true
    task.submitted_at = timestamp
    delete task.completed_at
    delete task.blocked_reason
    if (entry.project.next_task_id === task.id) entry.project.next_task_id = null
    await saveProject(entry, entry.project, timestamp)
    return { project_id: entry.project.project_id, task: taskView(task), already: false }
  })
}

export async function acceptTask(root, taskId) {
  return withLock(root, async () => {
    const entry = await loadWritable(root)
    const task = findTask(entry.project, taskId)
    if (task.detail_url) throw new KanbanError('请从外部任务来源更新此任务', 403)
    if (task.status === 'done' && task.review !== true) {
      return { project_id: entry.project.project_id, task: taskView(task), already: true }
    }
    if (task.review !== true) throw new KanbanError('任务不在待验收', 409)

    const timestamp = nowIso()
    await appendNote(root, task, '验收通过。', timestamp)
    task.status = 'done'
    task.completed_at = timestamp
    delete task.review
    delete task.submitted_at
    delete task.blocked_reason
    if (entry.project.next_task_id === task.id) entry.project.next_task_id = null
    await saveProject(entry, entry.project, timestamp)
    return { project_id: entry.project.project_id, task: taskView(task), already: false }
  })
}

export async function rejectTask(root, taskId, payload = {}) {
  const reason =
    typeof payload.reason === 'string' && payload.reason.trim()
      ? payload.reason.trim().slice(0, 3000)
      : ''
  return withLock(root, async () => {
    const entry = await loadWritable(root)
    const task = findTask(entry.project, taskId)
    if (task.detail_url) throw new KanbanError('请从外部任务来源更新此任务', 403)
    if (task.review !== true) throw new KanbanError('任务不在待验收', 409)

    const timestamp = nowIso()
    await appendNote(root, task, reason ? `验收退回：${reason}\n\n重新进入执行。` : '验收退回，重新进入执行。', timestamp)
    task.status = 'in_progress'
    task.run_id = randomBytes(16).toString('hex')
    task.started_at = timestamp
    delete task.review
    delete task.submitted_at
    delete task.completed_at
    delete task.blocked_reason
    await saveProject(entry, entry.project, timestamp)
    return { project_id: entry.project.project_id, task: taskView(task), already: false }
  })
}

async function appendNote(root, task, note, timestamp) {
  const relative = task.detail_path || defaultDetailPath(task)
  const detail = await resolveInside(root, relative)
  let body
  try {
    body = (await readFile(detail, 'utf8')).replace(/^\uFEFF/, '')
  } catch (error) {
    if (error?.code === 'ENOENT') {
      body = `# ${task.id} ${task.title}\n\n## 执行记录\n`
    } else {
      throw error
    }
  }
  await mkdir(path.dirname(detail), { recursive: true })
  await atomicWrite(detail, `${body.trimEnd()}\n\n### ${timestamp}\n\n${note}\n`)
  task.detail_path = relative
}

export async function blockTask(root, taskId, payload = {}) {
  const runId = textField(payload, 'run_id', 64)
  const reason = textField(payload, 'reason', 3000)
  return withLock(root, async () => {
    const entry = await loadWritable(root)
    const task = findTask(entry.project, taskId)
    if (task.detail_url) throw new KanbanError('请从外部任务来源更新此任务', 403)
    if (task.review === true) throw new KanbanError('任务待验收，请先通过验收或退回重做', 409)
    if (task.status === 'blocked' && task.run_id === runId) {
      return { project_id: entry.project.project_id, task: taskView(task), already: true }
    }
    if (task.status !== 'in_progress') throw new KanbanError('只有进行中的任务可以写回', 409)
    if (!runId || task.run_id !== runId) {
      throw new KanbanError('执行编号不匹配，请重新读取任务', 409)
    }

    const timestamp = nowIso()
    await appendRun(root, task, runId, 'blocked', '任务已标记阻塞，等待恢复条件。', reason, timestamp)
    task.status = 'blocked'
    task.blocked_reason = reason
    if (entry.project.next_task_id === task.id) entry.project.next_task_id = null
    await saveProject(entry, entry.project, timestamp)
    return { project_id: entry.project.project_id, task: taskView(task), already: false }
  })
}

export function taskInstruction(project, task, projectPath) {
  const runLine = task.run_id
    ? `当前 run_id：${task.run_id}`
    : '开始时不要自己编造 run_id，调用 kanban_start 获取。'
  return [
    `请执行项目「${project.name}」的任务 ${task.id}：${task.title}`,
    '',
    `项目目录：${projectPath}`,
    '先调用 kanban_show 读取任务详情与验收条件，再开始执行。',
    `开始前调用 kanban_start(project_id="${project.project_id}", task_id="${task.id}")。`,
    runLine,
    `完成后调用 kanban_finish(project_id="${project.project_id}", task_id="${task.id}", run_id=<上面的 run_id>, record="<变更与验证结果>") 提交验收。`,
    `受阻时调用 kanban_block(project_id="${project.project_id}", task_id="${task.id}", run_id=<上面的 run_id>, reason="<具体原因>")。`,
    '',
    '提交后任务进入待验收，用户通过验收后才算完成。',
  ].join('\n')
}
