import { randomUUID } from 'node:crypto'
import { KanbanError, asKanbanError } from './errors.js'

const PREFIX = '/api/kanban'
const MAX_BODY = 1_000_000

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

function sameOrigin(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = req.headers.origin
  if (!origin || origin === 'null') return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw new KanbanError('请求内容过大', 413)
    chunks.push(chunk)
  }
  if (!size) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new KanbanError('请求内容不是有效 JSON')
  }
}

function requireString(body, key) {
  const value = body?.[key]
  if (typeof value !== 'string' || !value.trim()) throw new KanbanError(`${key} 无效`)
  return value.trim()
}

async function handle(req, res, service, ctx) {
  if (!sameOrigin(req)) {
    sendJson(res, 403, { ok: false, error: '只接受本机看板页面发起的请求' })
    return
  }
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  let tail = url.pathname.slice(PREFIX.length)
  if (!tail) tail = '/'
  if (tail.length > 1 && tail.endsWith('/')) tail = tail.slice(0, -1)
  const method = req.method ?? 'GET'

  try {
    if (tail === '/state' && method === 'GET') {
      const data = await service.state({ force: url.searchParams.get('force') === '1' })
      sendJson(res, 200, { ok: true, data })
      return
    }

    if (tail === '/scan' && method === 'POST') {
      const data = await service.state({ force: true })
      sendJson(res, 200, { ok: true, data })
      return
    }

    if (tail === '/roots' && method === 'GET') {
      const externalRoots = await service.roots()
      sendJson(res, 200, { ok: true, data: { externalRoots, roots: externalRoots } })
      return
    }

    if (tail === '/roots' && method === 'POST') {
      const body = await readBody(req)
      if (Array.isArray(body.remove) && body.remove.length) {
        const result = await service.removeRoots(body.remove)
        sendJson(res, 200, { ok: true, data: result })
        return
      }
      if (Array.isArray(body.add) && body.add.length) {
        const result = await service.addRoots(body.add)
        sendJson(res, 200, { ok: true, data: result })
        return
      }
      throw new KanbanError('请指定要添加或移除的目录')
    }

    if (tail === '/workspace' && method === 'GET') {
      const target = url.searchParams.get('path')
      if (!target) throw new KanbanError('缺少 path')
      let registry
      try {
        registry = ctx.get('workspaceRegistry')
      } catch {
        registry = undefined
      }
      let workspaceId = null
      if (registry && typeof registry.resolveByPath === 'function') {
        try {
          const workspace = await registry.resolveByPath(target)
          workspaceId = workspace?.id ?? null
        } catch {
          workspaceId = null
        }
      }
      sendJson(res, 200, { ok: true, data: { workspaceId } })
      return
    }

    if (tail === '/task' && method === 'GET') {      const projectId = url.searchParams.get('project_id')
      const taskId = url.searchParams.get('task_id')
      if (!projectId || !taskId) throw new KanbanError('缺少 project_id 或 task_id')
      sendJson(res, 200, { ok: true, data: await service.task(projectId, taskId) })
      return
    }

    if (tail === '/instruction' && method === 'GET') {
      const projectId = url.searchParams.get('project_id')
      const taskId = url.searchParams.get('task_id')
      if (!projectId || !taskId) throw new KanbanError('缺少 project_id 或 task_id')
      sendJson(res, 200, { ok: true, data: { text: await service.instruction(projectId, taskId) } })
      return
    }

    if (tail === '/tasks' && method === 'POST') {
      const body = await readBody(req)
      const projectId = requireString(body, 'project_id')
      const result = await service.createTask(projectId, body)
      sendJson(res, 200, { ok: true, data: result })
      return
    }

    if (tail === '/tasks/start' && method === 'POST') {
      const body = await readBody(req)
      const result = await service.startTask(requireString(body, 'project_id'), requireString(body, 'task_id'), {
        session_id: body.session_id,
      })
      sendJson(res, 200, { ok: true, data: result })
      return
    }

    if (tail === '/tasks/dispatch' && method === 'POST') {
      const body = await readBody(req)
      const projectId = requireString(body, 'project_id')
      const taskId = requireString(body, 'task_id')
      const project = await service.findProject(projectId)
      if (!project.writable) {
        throw new KanbanError(project.read_only_reason || '项目只读', 403)
      }
      let agents
      try {
        agents = ctx.get('agents')
      } catch {
        agents = undefined
      }
      if (!agents || typeof agents.create !== 'function') {
        throw new KanbanError('当前环境无法创建会话', 501)
      }
      const sessionId = `session-${randomUUID()}`
      const handle = await agents.create({
        sessionId,
        meta: { cwd: project.path },
      })
      let started
      try {
        started = await service.startTask(projectId, taskId, { session_id: sessionId })
        const instruction = await service.instruction(projectId, taskId)
        const prompt = [
          `看板派发：请在当前会话执行任务 ${taskId}。`,
          '',
          instruction,
        ].join('\n')
        await handle.agent.followup({
          content: [{ type: 'text', text: prompt }],
          source: { kind: 'user' },
        })
      } catch (error) {
        await handle.dispose().catch(() => {})
        if (started?.run_id) {
          await service
            .blockTask(projectId, taskId, {
              run_id: started.run_id,
              reason: '会话派发失败',
            })
            .catch(() => {})
        }
        throw error
      }
      sendJson(res, 200, {
        ok: true,
        data: { session_id: sessionId, run_id: started.run_id },
      })
      return
    }

    if (tail === '/tasks/finish' && method === 'POST') {
      const body = await readBody(req)
      const result = await service.finishTask(requireString(body, 'project_id'), requireString(body, 'task_id'), body)
      sendJson(res, 200, { ok: true, data: result })
      return
    }

    if (tail === '/tasks/accept' && method === 'POST') {
      const body = await readBody(req)
      const result = await service.acceptTask(requireString(body, 'project_id'), requireString(body, 'task_id'))
      sendJson(res, 200, { ok: true, data: result })
      return
    }

    if (tail === '/tasks/reject' && method === 'POST') {
      const body = await readBody(req)
      const result = await service.rejectTask(requireString(body, 'project_id'), requireString(body, 'task_id'), body)
      sendJson(res, 200, { ok: true, data: result })
      return
    }

    if (tail === '/tasks/block' && method === 'POST') {
      const body = await readBody(req)
      const result = await service.blockTask(requireString(body, 'project_id'), requireString(body, 'task_id'), body)
      sendJson(res, 200, { ok: true, data: result })
      return
    }

    sendJson(res, 404, { ok: false, error: '未知的看板接口' })
  } catch (error) {
    const failure = asKanbanError(error)
    sendJson(res, failure.status, { ok: false, error: failure.message })
  }
}

/** Register the same-origin JSON API for the Web panel. */
export function registerApi(ctx, service) {
  let webServer
  try {
    webServer = ctx.get('webServer')
  } catch {
    webServer = undefined
  }
  if (!webServer || typeof webServer.register !== 'function') return
  ctx.effect(() => {
    // A crashed or hot-reloaded generation can leave its prefix behind; the
    // registry rejects duplicates, so clear only our own stale entry.
    const prefixes = webServer.prefixes
    if (prefixes && typeof prefixes.delete === 'function' && prefixes.has(PREFIX)) {
      prefixes.delete(PREFIX)
    }
    return webServer.register({
      kind: 'prefix',
      path: PREFIX,
      handler: (req, res) => handle(req, res, service, ctx),
    })
  }, 'agent-kanban: /api/kanban routes')
}
