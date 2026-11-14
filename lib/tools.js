import { KanbanError } from './errors.js'

function sessionOf(exec) {
  const candidates = [exec?.sessionId, exec?.session?.id, exec?.agent?.id]
  return candidates.find((value) => typeof value === 'string' && value.length > 0) ?? ''
}

function text(value) {
  return [{ type: 'text', text: value }]
}

function summary(project) {
  return {
    project_id: project.project_id,
    name: project.name,
    status: project.status,
    stage: project.stage,
    path: project.path,
    writable: project.writable,
    read_only_reason: project.read_only_reason,
    counts: project.counts,
    next_task: project.next_task
      ? { id: project.next_task.id, title: project.next_task.title, status: project.next_task.status }
      : null,
    blocked: project.tasks
      .filter((task) => task.status === 'blocked')
      .map((task) => ({ id: task.id, title: task.title, reason: task.blocked_reason })),
  }
}

export function registerTools(ctx, service) {
  let tools
  try {
    tools = ctx.get('tools')
  } catch {
    tools = undefined
  }
  if (!tools || typeof tools.register !== 'function') return

  const definitions = [
    {
      name: 'kanban_projects',
      description: '列出智能体看板里的项目、任务计数与下一项任务。用于选择要执行的任务或汇报项目进度。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '按项目名称或编号过滤，可选。' },
          include_done: { type: 'boolean', description: '是否在结果中附带已完成任务，默认 false。' },
        },
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => {
          const lines = [`项目 ${value.projects.length} 个 · 工作区 ${value.workspaces.length} 个 · 工作区外目录 ${value.externalRoots.length} 个`]
          for (const project of value.projects) {
            const counts = project.counts
            lines.push(
              `- ${project.name} (${project.project_id}) · ${project.status} · 待办 ${counts.todo} · 进行中 ${counts.in_progress} · 待验收 ${counts.review} · 阻塞 ${counts.blocked} · 完成 ${counts.done}${project.writable ? '' : ' · 只读'}`,
            )
            if (project.next_task) lines.push(`  下一项：${project.next_task.id} ${project.next_task.title}`)
          }
          if (value.issues?.length) lines.push(`扫描提示：${value.issues.map((item) => item.message).join('；')}`)
          return text(lines.join('\n'))
        },
      },
      async execute(args) {
        const data = await service.state()
        const query = typeof args?.query === 'string' ? args.query.trim().toLowerCase() : ''
        const includeDone = args?.include_done === true
        const projects = data.projects
          .filter((project) => {
            if (!query) return true
            return (
              project.name.toLowerCase().includes(query) ||
              project.project_id.toLowerCase().includes(query)
            )
          })
          .map((project) => {
            const item = summary(project)
            const done = project.tasks.filter((task) => task.status === 'done')
            item.done_tasks = (includeDone ? done : done.slice(-5)).map((task) => ({
              id: task.id,
              title: task.title,
              completed_at: task.completed_at,
            }))
            return item
          })
        return {
          workspaces: data.workspaces,
          externalRoots: data.externalRoots,
          scanRoots: data.scanRoots,
          projects,
          issues: data.issues,
          truncated: data.truncated,
        }
      },
    },
    {
      name: 'kanban_show',
      description: '读取一个任务的详情、当前状态、验收条件与执行会话，返回可直接执行的任务说明。',
      parameters: {
        type: 'object',
        required: ['project_id', 'task_id'],
        properties: {
          project_id: { type: 'string', description: '项目编号，例如 example-kanban。' },
          task_id: { type: 'string', description: '任务编号，例如 T015。' },
        },
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) =>
          text(
            [
              `# ${value.task.id} ${value.task.title}`,
              `项目：${value.project.name} (${value.project.project_id})`,
              `状态：${value.task.review ? '待验收' : value.task.status}${value.task.blocked_reason ? ` · 阻塞：${value.task.blocked_reason}` : ''}`,
              `目录：${value.project.path}`,
              '',
              value.detail.text,
            ].join('\n'),
          ),
      },
      async execute(args) {
        const projectId = String(args?.project_id ?? '').trim()
        const taskId = String(args?.task_id ?? '').trim()
        if (!projectId || !taskId) throw new KanbanError('需要 project_id 和 task_id')
        return service.task(projectId, taskId)
      },
    },
    {
      name: 'kanban_create',
      description: '在可写项目里新建一条待办任务，写入任务详情并更新项目索引。',
      parameters: {
        type: 'object',
        required: ['project_id', 'title'],
        properties: {
          project_id: { type: 'string', description: '项目编号。' },
          title: { type: 'string', description: '任务标题，最多 120 字。' },
          scope: { type: 'string', description: '工作范围，可选，最多 3000 字。' },
          acceptance: { type: 'string', description: '验收条件，可选，最多 3000 字。' },
          set_next: { type: 'boolean', description: '是否把新任务设为项目的下一项任务。' },
        },
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => text(`已创建 ${value.task.id} ${value.task.title}（${value.task.status}）`),
      },
      async execute(args) {
        const projectId = String(args?.project_id ?? '').trim()
        if (!projectId) throw new KanbanError('需要 project_id')
        return service.createTask(projectId, {
          title: args?.title,
          scope: args?.scope,
          acceptance: args?.acceptance,
          set_next: args?.set_next === true,
        })
      },
    },
    {
      name: 'kanban_start',
      description: '开始一个待办任务并返回 run_id；如果任务已在执行，返回现有 run_id 并把当前会话关联到任务。',
      parameters: {
        type: 'object',
        required: ['project_id', 'task_id'],
        properties: {
          project_id: { type: 'string', description: '项目编号。' },
          task_id: { type: 'string', description: '任务编号。' },
        },
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) =>
          text(
            [
              `${value.already ? '任务已在执行' : '已开始任务'}：${value.task.id} ${value.task.title}`,
              `run_id：${value.run_id}`,
              value.task.session_id ? `已关联会话：${value.task.session_id}` : '未关联会话',
              '',
              value.instruction,
            ].join('\n'),
          ),
      },
      async execute(args, exec) {
        const projectId = String(args?.project_id ?? '').trim()
        const taskId = String(args?.task_id ?? '').trim()
        if (!projectId || !taskId) throw new KanbanError('需要 project_id 和 task_id')
        const result = await service.startTask(projectId, taskId, { session_id: sessionOf(exec) })
        const instruction = await service.instruction(projectId, taskId)
        return { ...result, instruction }
      },
    },
    {
      name: 'kanban_finish',
      description: '把执行结果写回任务详情并提交验收。任务会进入「待验收」，等待用户通过或退回；必须使用 kanban_start 返回的 run_id。',
      parameters: {
        type: 'object',
        required: ['project_id', 'task_id', 'run_id', 'record'],
        properties: {
          project_id: { type: 'string', description: '项目编号。' },
          task_id: { type: 'string', description: '任务编号。' },
          run_id: { type: 'string', description: 'kanban_start 返回的执行编号。' },
          record: { type: 'string', description: '变更摘要、验证命令与结果、遗留事项。' },
        },
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => text(`已提交验收 ${value.task.id} ${value.task.title}（等待用户验收）`),
      },
      async execute(args) {
        const projectId = String(args?.project_id ?? '').trim()
        const taskId = String(args?.task_id ?? '').trim()
        if (!projectId || !taskId) throw new KanbanError('需要 project_id 和 task_id')
        return service.finishTask(projectId, taskId, {
          run_id: args?.run_id,
          record: args?.record,
        })
      },
    },
    {
      name: 'kanban_block',
      description: '把任务标记为阻塞并记录具体原因。必须使用 kanban_start 返回的 run_id。',
      parameters: {
        type: 'object',
        required: ['project_id', 'task_id', 'run_id', 'reason'],
        properties: {
          project_id: { type: 'string', description: '项目编号。' },
          task_id: { type: 'string', description: '任务编号。' },
          run_id: { type: 'string', description: 'kanban_start 返回的执行编号。' },
          reason: { type: 'string', description: '阻塞的具体原因与恢复条件。' },
        },
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => text(`已标记阻塞 ${value.task.id} ${value.task.title}：${value.task.blocked_reason}`),
      },
      async execute(args) {
        const projectId = String(args?.project_id ?? '').trim()
        const taskId = String(args?.task_id ?? '').trim()
        if (!projectId || !taskId) throw new KanbanError('需要 project_id 和 task_id')
        return service.blockTask(projectId, taskId, {
          run_id: args?.run_id,
          reason: args?.reason,
        })
      },
    },
  ]

  for (const definition of definitions) {
    ctx.effect(() => tools.register(definition), `agent-kanban: tool ${definition.name}`)
  }
}
