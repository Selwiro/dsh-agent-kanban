window.__ModuleLoader__.load({
  id: 'dsh-agent-kanban',
  factory(require) {
    const React = require('react')
    const e = React.createElement
    let ReactDOM = null
    try {
      ReactDOM = require('react-dom')
    } catch {
      ReactDOM = null
    }
    const NS = 'agent-kanban'
    const API = '/api/kanban'
    const ACTIVE_STATUSES = ['todo', 'in_progress', 'review', 'blocked']
    const ALL_STATUSES = [...ACTIVE_STATUSES, 'done']

    function displayStatus(task) {
      return task.review && task.status === 'in_progress' ? 'review' : task.status
    }

    const ZH = {
      'panel.title': '智能体看板',
      'panel.subtitle': '自动扫描 DSH 工作区，工作区外的项目按需添加',
      'view.kanban': '看板',
      'view.noProject': '当前会话目录不在看板项目中',
      'view.pickProject': '选择项目',
      'view.sessionRequired': '打开一个会话后显示本项目看板',
      'action.refresh': '刷新',
      'action.addRoot': '添加工作区外目录',
      'action.back': '全部项目',
      'action.create': '新建任务',
      'action.close': '关闭',
      'action.cancel': '取消',
      'action.save': '保存',
      'action.retry': '重试',
      'stats.projects': '项目',
      'stats.workspaces': '工作区',
      'stats.todo': '待办',
      'stats.inProgress': '进行中',
      'stats.review': '待验收',
      'stats.blocked': '阻塞',
      'stats.done': '已完成',
      'stats.rate': '完成率',
      'overview.focus': '当前焦点',
      'overview.projects': '项目',
      'overview.projectsHint': '按最近更新排序',
      'overview.emptyRoots': '还没有可扫描的工作区',
      'overview.emptyRootsBody': 'DSH 工作区会自动扫描。如果项目不在任何工作区里，再添加一个工作区外目录。',
      'overview.emptyProjects': '还没有发现项目',
      'overview.emptyProjectsBody': '工作区和外部目录里都没有可读取的 management/project.json。',
      'overview.noFocus': '暂时没有待处理的任务',
      'overview.noFocusBody': '所有任务都已完成，可以新建任务或去项目里查看记录。',
      'project.next': '下一项',
      'project.noNext': '暂无待办',
      'project.readonly': '只读',
      'project.writable': '可写',
      'project.path': '目录',
      'project.progress': '进度',
      'project.openSession': '在 DSH 中打开',
      'task.status.todo': '待办',
      'task.status.in_progress': '进行中',
      'task.status.review': '待验收',
      'task.status.blocked': '阻塞',
      'task.status.done': '已完成',
      'task.status.cancelled': '已取消',
      'task.next': '下一项',
      'task.start': '开始任务',
      'task.finish': '完成',
      'task.block': '标记阻塞',
      'task.copy': '复制指令',
      'task.execute': '在 DSH 中执行',
      'task.dispatch': '在新会话执行',
      'task.openSession': '查看会话',
      'task.open': '查看任务',
      'task.runId': '执行编号',
      'task.created': '创建',
      'task.started': '开始',
      'task.submitted': '提交验收',
      'task.completed': '完成',
      'task.project': '项目',
      'task.readonly': '这个项目目前只读，不能在这里改任务。',
      'task.external': '这个任务由外部来源维护，请在原系统中更新。',
      'task.finishTitle': '写回执行记录并提交验收',
      'task.finishHint': '记录变更、验证命令与结果；提交后进入「待验收」，由你决定通过或退回。',
      'task.record': '执行记录',
      'task.blockTitle': '标记阻塞',
      'task.blockHint': '写明具体原因与恢复条件。',
      'task.reason': '阻塞原因',
      'task.submitFinish': '提交验收',
      'task.submitBlock': '保存阻塞',
      'task.reviewHint': '等待验收',
      'task.accept': '通过验收',
      'task.reject': '退回重做',
      'task.working': '处理中…',
      'task.instruction': '执行指令',
      'task.detailLoading': '正在读取任务详情…',
      'task.noDetail': '任务详情为空',
      'dialog.createTitle': '新建任务',
      'dialog.createHint': '填一个标题就能保存，范围和验收条件可以稍后补充。',
      'dialog.title': '标题',
      'dialog.titlePlaceholder': '例如：核对首批项目索引',
      'dialog.scope': '工作范围',
      'dialog.scopePlaceholder': '这次要做成什么样，涉及哪些位置',
      'dialog.acceptance': '验收条件',
      'dialog.acceptancePlaceholder': '怎样算做完，需要跑哪些检查',
      'dialog.setNext': '设为项目的下一项任务',
      'dialog.create': '保存任务',
      'roots.title': '工作区外目录',
      'roots.hint': 'DSH 工作区会自动扫描，不需要添加。这里只添加不在任何工作区里的项目目录。',
      'roots.add': '选择目录',
      'roots.path': '目录路径',
      'roots.pathPlaceholder': '/Users/you/Workspace/other-project',
      'roots.addPath': '添加路径',
      'roots.workspaces': '工作区（自动扫描）',
      'roots.external': '工作区外目录',
      'roots.empty': '还没有工作区外目录',
      'roots.autoHint': '以下工作区由 DSH 提供，看板会自动扫描其中的项目。',
      'roots.remove': '移除',
      'roots.close': '完成',
      'toast.copied': '执行指令已复制',
      'toast.dispatched': '已在新会话派发任务',
      'toast.created': '任务已创建',
      'toast.started': '任务已开始',
      'toast.finished': '执行记录已写回',
      'toast.submitted': '已提交验收',
      'toast.accepted': '验收通过，任务已完成',
      'toast.rejected': '已退回重做',
      'toast.blocked': '任务已标记阻塞',
      'toast.rootAdded': '目录已加入',
      'toast.rootRemoved': '目录已移除',
      'toast.sessionFailed': '会话未能自动打开，请从侧栏进入项目目录',
      'toast.copyFailed': '复制失败，请手动选择指令',
      'error.load': '看板加载失败',
      'error.detail': '任务详情读取失败',
      'misc.search': '搜索编号或标题',
      'misc.all': '全部',
      'misc.empty': '暂无任务',
      'misc.noMatch': '没有匹配的任务',
      'misc.loading': '正在读取项目…',
      'misc.issues': '扫描提示',
      'misc.truncated': '扫描达到时间上限，可能还有未列出的项目',
      'misc.cancelled': '已取消',
      'misc.updated': '更新于',
      'misc.instructions': '执行指令',
    }

    const EN = {
      'panel.title': 'Agent kanban',
      'panel.subtitle': 'DSH workspaces scan automatically; add directories only for outside projects',
      'view.kanban': 'Kanban',
      'view.noProject': 'This session directory is not in a board project',
      'view.pickProject': 'Pick a project',
      'view.sessionRequired': 'Open a session to see its project board',
      'action.refresh': 'Refresh',
      'action.addRoot': 'Add outside directory',
      'action.back': 'All projects',
      'action.create': 'New task',
      'action.close': 'Close',
      'action.cancel': 'Cancel',
      'action.save': 'Save',
      'action.retry': 'Retry',
      'stats.projects': 'Projects',
      'stats.workspaces': 'Workspaces',
      'stats.todo': 'To do',
      'stats.inProgress': 'In progress',
      'stats.review': 'In review',
      'stats.blocked': 'Blocked',
      'stats.done': 'Done',
      'stats.rate': 'Completion',
      'overview.focus': 'Focus',
      'overview.projects': 'Projects',
      'overview.projectsHint': 'Most recently updated first',
      'overview.emptyRoots': 'No DSH workspace to scan',
      'overview.emptyRootsBody': 'DSH workspaces are scanned automatically. Add an outside directory only for a project that is not in any workspace.',
      'overview.emptyProjects': 'No project found yet',
      'overview.emptyProjectsBody': 'Neither the workspaces nor the outside directories contain a readable management/project.json.',
      'overview.noFocus': 'Nothing to work on',
      'overview.noFocusBody': 'All tasks are done. Create a task or open a project to review records.',
      'project.next': 'Next',
      'project.noNext': 'No next task',
      'project.readonly': 'Read only',
      'project.writable': 'Writable',
      'project.path': 'Directory',
      'project.progress': 'Progress',
      'project.openSession': 'Open in DSH',
      'task.status.todo': 'To do',
      'task.status.in_progress': 'In progress',
      'task.status.review': 'In review',
      'task.status.blocked': 'Blocked',
      'task.status.done': 'Done',
      'task.status.cancelled': 'Cancelled',
      'task.next': 'Next',
      'task.start': 'Start task',
      'task.finish': 'Finish',
      'task.block': 'Mark blocked',
      'task.copy': 'Copy instruction',
      'task.execute': 'Run in DSH',
      'task.dispatch': 'Run in a new session',
      'task.openSession': 'Open session',
      'task.open': 'Open task',
      'task.runId': 'Run id',
      'task.created': 'Created',
      'task.started': 'Started',
      'task.submitted': 'Submitted',
      'task.completed': 'Completed',
      'task.project': 'Project',
      'task.readonly': 'This project is read only; tasks cannot be changed here.',
      'task.external': 'This task is maintained externally; update it at its source.',
      'task.finishTitle': 'Write the result back for review',
      'task.finishHint': 'Changes, verification commands and results are appended. Submitting moves the task to review; you accept or return it.',
      'task.record': 'Execution record',
      'task.blockTitle': 'Mark blocked',
      'task.blockHint': 'State the concrete reason and what would unblock it.',
      'task.reason': 'Blocking reason',
      'task.submitFinish': 'Submit for review',
      'task.submitBlock': 'Save blocked state',
      'task.reviewHint': 'Awaiting acceptance',
      'task.accept': 'Accept',
      'task.reject': 'Return',
      'task.working': 'Working…',
      'task.instruction': 'Execution instruction',
      'task.detailLoading': 'Reading task detail…',
      'task.noDetail': 'This task has no detail yet',
      'dialog.createTitle': 'New task',
      'dialog.createHint': 'A title is enough. Scope and acceptance can follow.',
      'dialog.title': 'Title',
      'dialog.titlePlaceholder': 'For example: verify the first project indexes',
      'dialog.scope': 'Scope',
      'dialog.scopePlaceholder': 'What this should produce and where',
      'dialog.acceptance': 'Acceptance',
      'dialog.acceptancePlaceholder': 'What counts as done and which checks must pass',
      'dialog.setNext': 'Make this the next task',
      'dialog.create': 'Save task',
      'roots.title': 'Outside directories',
      'roots.hint': 'DSH workspaces scan automatically. Add only a project directory that is not inside any workspace.',
      'roots.add': 'Pick a directory',
      'roots.path': 'Directory path',
      'roots.pathPlaceholder': '/Users/you/Workspace/other-project',
      'roots.addPath': 'Add path',
      'roots.workspaces': 'Workspaces (automatic)',
      'roots.external': 'Outside directories',
      'roots.empty': 'No outside directory yet',
      'roots.autoHint': 'These workspaces come from DSH; the board scans each one automatically.',
      'roots.remove': 'Remove',
      'roots.close': 'Done',
      'toast.copied': 'Instruction copied',
      'toast.dispatched': 'Task dispatched to a new session',
      'toast.created': 'Task created',
      'toast.started': 'Task started',
      'toast.finished': 'Result written back',
      'toast.submitted': 'Submitted for review',
      'toast.accepted': 'Accepted; the task is done',
      'toast.rejected': 'Returned for more work',
      'toast.blocked': 'Task marked blocked',
      'toast.rootAdded': 'Directory added',
      'toast.rootRemoved': 'Directory removed',
      'toast.sessionFailed': 'The session did not open; enter the project directory from the sidebar',
      'toast.copyFailed': 'Copy failed; select the instruction manually',
      'error.load': 'The board failed to load',
      'error.detail': 'The task detail failed to load',
      'misc.search': 'Search id or title',
      'misc.all': 'All',
      'misc.empty': 'No tasks',
      'misc.noMatch': 'No matching task',
      'misc.loading': 'Reading projects…',
      'misc.issues': 'Scan notices',
      'misc.truncated': 'The scan hit its time limit; some projects may be missing',
      'misc.cancelled': 'Cancelled',
      'misc.updated': 'Updated',
      'misc.instructions': 'Execution instruction',
    }

    const CSS = `
.ak-root{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding-top:var(--dsh-frame-top-clearance,0px);font-size:13px;line-height:1.55;overflow:hidden}
.ak-root *,.ak-root *::before,.ak-root *::after{box-sizing:border-box}
.ak-view,.ak-view *,.ak-view *::before,.ak-view *::after{box-sizing:border-box}
.ak-drawer,.ak-drawer *,.ak-drawer *::before,.ak-drawer *::after,.ak-dialog,.ak-dialog *,.ak-dialog *::before,.ak-dialog *::after,.ak-mask,.ak-dialog-mask{box-sizing:border-box}
.ak-topbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px 16px;padding:14px 24px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);flex:0 0 auto;z-index:4}
.ak-brand{display:flex;align-items:center;gap:10px;min-width:0}
.ak-brand-mark{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-brand-primary);flex:0 0 auto}
.ak-title{font-size:15px;font-weight:600;letter-spacing:.01em;white-space:nowrap}
.ak-subtitle{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ak-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;flex:0 1 auto}
.ak-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain}
.ak-container{width:100%;max-width:1220px;margin:0 auto;padding:22px 24px 56px}
.ak-view{position:relative;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55;background:transparent}
.ak-embedded{max-width:100%;padding:16px 20px 44px}
.ak-embedded .ak-project-title{font-size:19px}
.ak-embedded .ak-board{gap:6px}
.ak-embedded .ak-lane{padding:6px;border-radius:9px}
.ak-embedded .ak-card{padding:7px 8px}
.ak-embedded .ak-card-title{font-size:12px;-webkit-line-clamp:4}
.ak-embedded .ak-card-note{font-size:10.5px;margin-top:4px}
.ak-view .ak-toast{position:fixed}
.ak-form select{width:100%;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;padding:8px 10px}
.ak-form select:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.ak-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap;transition:background .12s ease,border-color .12s ease,opacity .12s ease}
.ak-btn:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.ak-btn:focus-visible,.ak-icon-btn:focus-visible,.ak-card:focus-visible,.ak-row:focus-visible,.ak-tab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.ak-btn:disabled{opacity:.45;cursor:not-allowed}
.ak-btn-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}
.ak-btn-primary:hover{background:var(--dsw-alias-brand-primary);filter:brightness(1.06)}
.ak-btn-ghost{background:transparent;border-color:transparent;color:var(--dsw-alias-label-secondary)}
.ak-btn-ghost:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.ak-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 35%,var(--dsw-alias-border-l1))}
.ak-btn-sm{height:26px;padding:0 9px;font-size:12px;border-radius:7px}
.ak-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.ak-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.ak-section{margin-top:26px}
.ak-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
.ak-section-title{font-size:13px;font-weight:600}
.ak-section-hint{font-size:12px;color:var(--dsw-alias-label-secondary)}
.ak-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:18px 0 6px}
.ak-stat{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:11px 13px;min-width:0}
.ak-stat-label{font-size:12px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:6px}
.ak-stat-value{font-size:22px;font-weight:600;line-height:1.25;margin-top:4px;font-variant-numeric:tabular-nums}
.ak-stat-hint{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ak-dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto;background:var(--dsw-alias-state-idle-primary)}
.ak-dot[data-tone="in_progress"]{background:var(--dsw-alias-brand-primary)}
.ak-dot[data-tone="review"]{background:var(--dsw-alias-state-warn-primary)}
.ak-dot[data-tone="blocked"]{background:var(--dsw-alias-state-error-primary)}
.ak-dot[data-tone="done"]{background:var(--dsw-alias-state-success-primary)}
.ak-focus{display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 32%,var(--dsw-alias-border-l1));background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-layer-1));border-radius:12px;padding:16px 18px}
.ak-focus-main{min-width:0}
.ak-focus-eyebrow{font-size:11.5px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:8px;margin-bottom:5px}
.ak-focus-title{font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ak-focus-meta{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ak-focus-side{display:flex;align-items:center;gap:8px;flex:0 0 auto}
.ak-empty{border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;padding:38px 24px;text-align:center;background:var(--dsw-alias-bg-layer-1)}
.ak-empty-title{font-size:14px;font-weight:600;margin:0 0 6px}
.ak-empty-body{font-size:12.5px;color:var(--dsw-alias-label-secondary);margin:0 auto 16px;max-width:520px;line-height:1.65}
.ak-rows{display:flex;flex-direction:column;gap:8px}
.ak-row{display:grid;grid-template-columns:minmax(190px,1.5fr) minmax(210px,1.7fr) minmax(130px,.8fr);gap:16px;align-items:center;width:100%;text-align:left;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:12px 14px;cursor:pointer;color:inherit;font:inherit;transition:border-color .12s ease,background .12s ease}
.ak-row:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2)}
.ak-row-id{display:flex;align-items:center;gap:10px;min-width:0}
.ak-glyph{--ak-glyph-color:var(--dsw-alias-brand-primary);display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;background:color-mix(in srgb,var(--ak-glyph-color) 10%,var(--dsw-alias-bg-layer-1));color:var(--ak-glyph-color);flex:0 0 auto}
.ak-glyph svg{width:17px;height:17px;display:block}
.ak-glyph[data-project-type="writing"]{--ak-glyph-color:var(--dsw-alias-state-warn-primary)}
.ak-glyph[data-project-type="ai_video"]{--ak-glyph-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,var(--dsw-alias-state-error-primary))}
.ak-glyph[data-project-type="other"]{--ak-glyph-color:var(--dsw-alias-label-secondary)}
.ak-row-name{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ak-row-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.ak-row-next{min-width:0}
.ak-row-next-label{font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}
.ak-row-next-title{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ak-row-side{min-width:0}
.ak-bar{height:5px;border-radius:99px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;border:1px solid var(--dsw-alias-border-l1)}
.ak-bar > i{display:block;height:100%;background:var(--dsw-alias-state-success-primary);border-radius:99px}
.ak-row-progress{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.ak-row-progress .ak-bar{flex:1 1 auto}
.ak-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px}
.ak-badge{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 7px;border-radius:99px;font-size:11px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);white-space:nowrap}
.ak-badge[data-tone="in_progress"]{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,var(--dsw-alias-border-l1))}
.ak-badge[data-tone="review"]{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 30%,var(--dsw-alias-border-l1))}
.ak-badge[data-tone="blocked"]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 30%,var(--dsw-alias-border-l1))}
.ak-badge[data-tone="done"]{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 30%,var(--dsw-alias-border-l1))}
.ak-project-head{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px 16px;margin-bottom:16px;min-width:0}
.ak-project-title{display:flex;align-items:center;gap:10px;min-width:0;font-size:22px;font-weight:600;line-height:1.3;margin:8px 0 4px}
.ak-project-title .ak-glyph{width:30px;height:30px}
.ak-embedded .ak-project-title .ak-glyph{width:28px;height:28px}
.ak-project-name{min-width:0;overflow-wrap:anywhere}
.ak-project-summary{font-size:12.5px;color:var(--dsw-alias-label-secondary);max-width:720px;margin:0}
.ak-project-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px;font-size:12px;color:var(--dsw-alias-label-secondary);min-width:0}
.ak-project-side{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;flex:0 1 auto;max-width:100%;margin-top:6px}
.ak-board-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 12px;flex-wrap:wrap}
.ak-tabs{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.ak-tab{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.ak-tab:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.ak-tab[aria-pressed="true"]{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);font-weight:600}
.ak-tab-count{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ak-search{position:relative;display:flex;align-items:center;min-width:190px}
.ak-search svg{position:absolute;left:9px;color:var(--dsw-alias-label-secondary);pointer-events:none}
.ak-search input{width:100%;height:30px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;padding:0 10px 0 30px}
.ak-search input::placeholder{color:var(--dsw-alias-label-secondary)}
.ak-search input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.ak-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:start;min-width:0;width:100%}
.ak-board[data-single="true"]{grid-template-columns:minmax(0,1fr)}
.ak-lane{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 72%,transparent);padding:8px;min-height:120px;min-width:0;overflow:hidden}
.ak-lane-head{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:2px 2px 7px;min-width:0}
.ak-lane-title{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ak-lane-count{font-size:10.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;flex:0 0 auto}
.ak-lane-body{display:flex;flex-direction:column;gap:7px;min-width:0}
.ak-card{display:block;width:100%;min-width:0;text-align:left;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);padding:8px 9px;cursor:pointer;color:inherit;font:inherit;transition:border-color .12s ease,transform .12s ease}
.ak-card:hover{border-color:var(--dsw-alias-brand-primary)}
.ak-card:active{transform:translateY(1px)}
.ak-card[data-next="true"]{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,var(--dsw-alias-border-l1))}
.ak-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}
.ak-card-id{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;letter-spacing:.02em}
.ak-card-title{font-size:12.5px;font-weight:500;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.ak-card-note{display:block;font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ak-card-note[data-tone="blocked"]{color:var(--dsw-alias-state-error-primary)}
.ak-card-note[data-tone="review"]{color:var(--dsw-alias-state-warn-primary)}
.ak-card-session{display:inline-flex;align-items:center;gap:4px;max-width:100%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;color:var(--dsw-alias-brand-primary);margin-top:6px}
.ak-lane-empty{font-size:11.5px;color:var(--dsw-alias-label-secondary);text-align:center;padding:18px 6px}
.ak-done{margin-top:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 72%,transparent);overflow:hidden}
.ak-done-head{display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ak-done-head:hover{background:var(--dsw-alias-bg-layer-2)}
.ak-done-count{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ak-done-spacer{flex:1 1 auto}
.ak-done-chevron{width:7px;height:7px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg);transition:transform .15s ease;margin-right:2px;color:var(--dsw-alias-label-secondary)}
.ak-done-head[aria-expanded="true"] .ak-done-chevron{transform:rotate(-135deg)}
.ak-done-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:7px;padding:0 10px 10px;max-height:280px;overflow:auto;overscroll-behavior:contain}
.ak-embedded .ak-done-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));max-height:240px}
.ak-details{margin-top:16px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.ak-details summary{cursor:pointer;padding:6px 0}
.ak-notice{display:flex;align-items:flex-start;gap:8px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);padding:9px 11px;font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:12px}
.ak-notice[data-tone="error"]{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 35%,var(--dsw-alias-border-l1));color:var(--dsw-alias-state-error-primary)}
.ak-notice[data-tone="warn"]{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 35%,var(--dsw-alias-border-l1));color:var(--dsw-alias-state-warn-primary)}
.ak-skeleton{display:flex;flex-direction:column;gap:10px;padding-top:8px}
.ak-skel{height:52px;border-radius:10px;background:linear-gradient(90deg,var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-2),var(--dsw-alias-bg-layer-1));background-size:200% 100%;animation:ak-shimmer 1.4s ease-in-out infinite}
.ak-skel[data-tall="true"]{height:110px}
@keyframes ak-shimmer{0%{background-position:0% 0}100%{background-position:-200% 0}}
.ak-mask{position:fixed;inset:0;background:color-mix(in srgb,var(--dsw-alias-bg-base) 52%,transparent);z-index:80}
.ak-drawer{position:fixed;top:0;right:0;bottom:0;width:min(500px,94%);display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1);border-left:1px solid var(--dsw-alias-border-l1);box-shadow:-14px 0 38px color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent);z-index:81;min-height:0}
.ak-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:0 0 auto}
.ak-drawer-eyebrow{font-size:11.5px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:8px;margin-bottom:6px}
.ak-drawer-title{font-size:17px;font-weight:600;line-height:1.4;margin:0;word-break:break-word}
.ak-drawer-body{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;padding:16px 18px 24px}
.ak-drawer-foot{flex:0 0 auto;border-top:1px solid var(--dsw-alias-border-l1);padding:12px 18px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-layer-1)}
.ak-drawer-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ak-meta-grid{display:grid;grid-template-columns:76px minmax(0,1fr);gap:6px 10px;font-size:12px;margin:2px 0 16px}
.ak-meta-label{color:var(--dsw-alias-label-secondary)}
.ak-meta-value{min-width:0;overflow-wrap:anywhere}
.ak-mono{font-family:var(--dsh-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11.5px}
.ak-divider{height:1px;background:var(--dsw-alias-border-l1);margin:14px 0}
.ak-form{display:flex;flex-direction:column;gap:9px;margin-top:8px}
.ak-form label{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.ak-form input,.ak-form textarea{width:100%;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;padding:8px 10px}
.ak-form textarea{resize:vertical;min-height:72px}
.ak-form input:focus,.ak-form textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.ak-check{display:flex;flex-direction:row!important;align-items:center;gap:8px!important;font-size:12.5px;color:var(--dsw-alias-label-primary)!important}
.ak-check input{width:14px;height:14px;accent-color:var(--dsw-alias-brand-primary)}
.ak-error{font-size:12px;color:var(--dsw-alias-state-error-primary)}
.ak-dialog-mask{position:fixed;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:8vh 16px 24px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 56%,transparent);z-index:90;overflow:auto}
.ak-dialog{width:min(540px,100%);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 18px 50px color-mix(in srgb,var(--dsw-alias-label-primary) 18%,transparent);overflow:hidden}
.ak-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px 10px}
.ak-dialog-title{font-size:15px;font-weight:600;margin:0}
.ak-dialog-hint{font-size:12px;color:var(--dsw-alias-label-secondary);margin:4px 0 0}
.ak-dialog-body{padding:4px 18px 12px}
.ak-dialog-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 40%,transparent)}
.ak-roots{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.ak-root-row{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:8px 10px;font-size:12px}
.ak-root-path{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dsh-font-family-code,ui-monospace,Menlo,monospace);font-size:11.5px}
.ak-root-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500}
.ak-toast{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:50;max-width:min(560px,90%);padding:9px 13px;border-radius:9px;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);box-shadow:0 10px 30px color-mix(in srgb,var(--dsw-alias-label-primary) 16%,transparent);font-size:12.5px;color:var(--dsw-alias-label-primary)}
.ak-toast[data-tone="error"]{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,var(--dsw-alias-border-l1));color:var(--dsw-alias-state-error-primary)}
.ak-md{font-size:13px;line-height:1.72;color:var(--dsw-alias-label-primary)}
.ak-md p{margin:0 0 10px;white-space:pre-wrap}
.ak-md h1,.ak-md h2,.ak-md h3{margin:16px 0 8px;line-height:1.4}
.ak-md h1{font-size:17px}
.ak-md h2{font-size:15px}
.ak-md h3{font-size:13.5px}
.ak-md ul,.ak-md ol{margin:0 0 10px;padding-left:20px}
.ak-md li{margin:2px 0}
.ak-md code{font-family:var(--dsh-font-family-code,ui-monospace,Menlo,monospace);font-size:11.5px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:4px;padding:1px 4px}
.ak-md pre{margin:0 0 12px;padding:10px 12px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);overflow:auto}
.ak-md pre code{background:transparent;border:0;padding:0;font-size:11.5px;line-height:1.6}
.ak-md a{color:var(--dsw-alias-brand-primary);text-decoration:none}
.ak-md a:hover{text-decoration:underline}
.ak-md hr{border:0;border-top:1px solid var(--dsw-alias-border-l1);margin:14px 0}
.ak-md blockquote{margin:0 0 10px;padding:2px 0 2px 10px;border-left:2px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.ak-spin{width:12px;height:12px;border:2px solid color-mix(in srgb,currentColor 28%,transparent);border-top-color:currentColor;border-radius:50%;animation:ak-spin .8s linear infinite;display:inline-block}
@keyframes ak-spin{to{transform:rotate(360deg)}}
@media (max-width:1020px){.ak-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.ak-row{grid-template-columns:minmax(160px,1.2fr) minmax(180px,1.4fr)}.ak-row-side{grid-column:1/-1}}
@media (max-width:720px){.ak-container{padding:16px 14px 44px}.ak-topbar{padding:12px 14px;align-items:flex-start;flex-wrap:wrap}.ak-actions{margin-left:auto}.ak-subtitle{display:none}.ak-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ak-focus{flex-direction:column;align-items:flex-start}.ak-focus-side{width:100%}.ak-project-head{flex-direction:column}.ak-project-side{width:100%;justify-content:flex-start}.ak-row{grid-template-columns:minmax(0,1fr)}.ak-row-side{grid-column:auto}.ak-drawer{width:100%}}
.ak-container{container-type:inline-size}
@container (max-width:620px){.ak-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ak-focus{flex-direction:column;align-items:flex-start}.ak-focus-side{width:100%}.ak-row{grid-template-columns:minmax(0,1fr)}.ak-row-side{grid-column:auto}.ak-project-head{flex-direction:column}.ak-project-side{width:100%;justify-content:flex-start}.ak-project-title{font-size:18px}}
`

    function injectStyles() {
      const style = document.createElement('style')
      style.dataset.agentKanban = 'true'
      style.textContent = CSS
      document.head.appendChild(style)
      return () => style.remove()
    }

    async function api(path, options = {}) {
      const response = await fetch(API + path, {
        ...options,
        headers: { 'content-type': 'application/json', ...(options.headers || {}) },
      })
      let payload = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      if (!response.ok || !payload || payload.ok !== true) {
        throw new Error(payload?.error || `请求失败（${response.status}）`)
      }
      return payload.data
    }

    async function copyText(value) {
      try {
        await navigator.clipboard.writeText(value)
        return true
      } catch {
        // Fall through to the selection-based copy for non-secure contexts.
      }
      const area = document.createElement('textarea')
      area.value = value
      area.style.position = 'fixed'
      area.style.top = '-1000px'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      try {
        return document.execCommand('copy')
      } catch {
        return false
      } finally {
        area.remove()
      }
    }

    function formatWhen(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      const diff = Date.now() - date.getTime()
      if (diff < 60_000) return '刚刚'
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
      if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
      if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`
      return date.toLocaleDateString()
    }

    function progressOf(project) {
      const total = project.total || 0
      if (!total) return 0
      return Math.round((project.done / total) * 100)
    }

    function pickFocus(projects) {
      const find = (status) => {
        for (const project of projects) {
          const task = project.tasks.find((item) => displayStatus(item) === status)
          if (task) return { project, task }
        }
        return null
      }
      return (
        find('review') ||
        find('blocked') ||
        find('in_progress') ||
        projects
          .map((project) => (project.next_task ? { project, task: project.next_task } : null))
          .find(Boolean) ||
        find('todo') ||
        null
      )
    }

    function buildInstruction(project, task) {
      return [
        `请执行项目「${project.name}」的任务 ${task.id}：${task.title}`,
        '',
        `项目目录：${project.path}`,
        `先调用 kanban_show(project_id="${project.project_id}", task_id="${task.id}") 读取任务详情与验收条件。`,
        task.run_id
          ? `当前 run_id：${task.run_id}`
          : `开始前调用 kanban_start(project_id="${project.project_id}", task_id="${task.id}")。`,
        `完成后调用 kanban_finish(project_id="${project.project_id}", task_id="${task.id}", run_id=<run_id>, record="<变更与验证结果>")。`,
        `受阻时调用 kanban_block(project_id="${project.project_id}", task_id="${task.id}", run_id=<run_id>, reason="<具体原因>")。`,
      ].join('\n')
    }

    function useLocale(ctx) {
      const subscribe = React.useCallback((callback) => ctx.locale.subscribe(callback), [ctx])
      const getSnapshot = React.useCallback(() => ctx.locale.getSnapshot(), [ctx])
      React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    }

    /** Fixed overlays must live outside the Conversation scrollport. */
    function Portal({ children }) {
      const createPortal =
        ReactDOM && (ReactDOM.createPortal || (ReactDOM.default && ReactDOM.default.createPortal))
      if (typeof createPortal !== 'function' || typeof document === 'undefined') return children
      return createPortal(children, document.body)
    }

    function Icon({ name, size = 16 }) {
      const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }
      const paths = {
        refresh: [e('path', { key: 'p', d: 'M20 11a8 8 0 1 0-2.3 5.7' }), e('path', { key: 'q', d: 'M20 5v6h-6' })],
        plus: [e('path', { key: 'p', d: 'M12 5v14M5 12h14' })],
        folder: [e('path', { key: 'p', d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' })],
        close: [e('path', { key: 'p', d: 'M6 6l12 12M18 6L6 18' })],
        back: [e('path', { key: 'p', d: 'M15 5l-7 7 7 7' })],
        copy: [e('rect', { key: 'r', x: 9, y: 9, width: 11, height: 11, rx: 2 }), e('path', { key: 'p', d: 'M5 15V5a2 2 0 0 1 2-2h8' })],
        play: [e('path', { key: 'p', d: 'M8 5.5v13l10-6.5z' })],
        check: [e('path', { key: 'p', d: 'M5 12.5l4.5 4.5L19 7' })],
        block: [e('circle', { key: 'c', cx: 12, cy: 12, r: 8 }), e('path', { key: 'p', d: 'M7 7l10 10' })],
        session: [e('path', { key: 'p', d: 'M4 5h16v11H9l-5 4z' })],
        search: [e('circle', { key: 'c', cx: 11, cy: 11, r: 6 }), e('path', { key: 'p', d: 'M16 16l4 4' })],
        more: [e('circle', { key: 'a', cx: 6, cy: 12, r: 1 }), e('circle', { key: 'b', cx: 12, cy: 12, r: 1 }), e('circle', { key: 'c', cx: 18, cy: 12, r: 1 })],
        alert: [e('path', { key: 'p', d: 'M12 4l9 16H3z' }), e('path', { key: 'q', d: 'M12 9v4M12 16.5v.5' })],
      }
      return e('svg', common, ...(paths[name] || []))
    }

    function SidebarIcon({ size = 18 }) {
      return e(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        e('rect', { x: 3, y: 4, width: 5, height: 13, rx: 1.5, fill: 'currentColor', opacity: 0.5 }),
        e('rect', { x: 9.5, y: 4, width: 5, height: 16, rx: 1.5, fill: 'currentColor', opacity: 0.78 }),
        e('rect', { x: 16, y: 4, width: 5, height: 9, rx: 1.5, fill: 'currentColor' }),
        e('path', {
          d: 'M15 19.6l1.8 1.8 3.2-3.6',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function StatusPill({ status, t }) {
      return e(
        'span',
        { className: 'ak-badge', 'data-tone': status },
        e('span', { className: 'ak-dot', 'data-tone': status }),
        t(`task.status.${status}`),
      )
    }

    function ProjectGlyph({ project }) {
      const type = String(project?.type || 'other').replace(/-/g, '_')
      const common = {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }
      const shape =
        type === 'programming'
          ? [
              e('path', { key: 'left', d: 'M9 7.5L4 12l5 4.5' }),
              e('path', { key: 'right', d: 'M15 7.5L20 12l-5 4.5' }),
              e('path', { key: 'slash', d: 'M13.2 5.5l-2.4 13' }),
            ]
          : type === 'writing'
            ? [
                e('path', { key: 'page', d: 'M6.5 4.5h7L18 9v10.5a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1z' }),
                e('path', { key: 'fold', d: 'M13.5 4.5V9H18' }),
                e('path', { key: 'lines', d: 'M8.5 13h7M8.5 16.5h5' }),
              ]
            : type === 'ai_video'
              ? [
                  e('rect', { key: 'frame', x: 3.5, y: 5, width: 17, height: 14, rx: 3 }),
                  e('path', { key: 'play', d: 'M10 9.5l5 2.5-5 2.5z', fill: 'currentColor', stroke: 'none' }),
                ]
              : [
                  e('path', { key: 'folder', d: 'M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z' }),
                  e('path', { key: 'line', d: 'M3.5 10.5h17' }),
                ]
      return e(
        'span',
        { className: 'ak-glyph', 'data-project-type': type, 'aria-hidden': true },
        e('svg', common, ...shape),
      )
    }

    function Stat({ label, value, hint, tone }) {
      return e(
        'div',
        { className: 'ak-stat' },
        e('div', { className: 'ak-stat-label' }, e('span', { className: 'ak-dot', 'data-tone': tone || 'todo' }), label),
        e('div', { className: 'ak-stat-value' }, String(value)),
        hint ? e('div', { className: 'ak-stat-hint' }, hint) : null,
      )
    }

    function Stats({ data, t }) {
      const projects = data.projects
      const counts = { todo: 0, in_progress: 0, review: 0, blocked: 0, done: 0, cancelled: 0 }
      for (const project of projects) for (const key of Object.keys(counts)) counts[key] += project.counts[key] ?? 0
      const total = counts.todo + counts.in_progress + counts.review + counts.blocked + counts.done
      const rate = total ? Math.round((counts.done / total) * 100) : 0
      return e(
        'div',
        { className: 'ak-stats' },
        e(Stat, { label: t('stats.projects'), value: projects.length, hint: `${counts.in_progress} ${t('stats.inProgress')}`, tone: 'in_progress' }),
        e(Stat, { label: t('stats.todo'), value: counts.todo, hint: t('stats.todo'), tone: 'todo' }),
        e(Stat, { label: t('stats.inProgress'), value: counts.in_progress, hint: t('stats.inProgress'), tone: 'in_progress' }),
        e(Stat, { label: t('stats.review'), value: counts.review, hint: t('stats.review'), tone: 'review' }),
        e(Stat, { label: t('stats.blocked'), value: counts.blocked, hint: t('stats.blocked'), tone: 'blocked' }),
        e(Stat, { label: t('stats.done'), value: counts.done, hint: `${t('stats.rate')} ${rate}%`, tone: 'done' }),
      )
    }

    function FocusCard({ focus, t, onOpenTask, onExecute }) {
      if (!focus) {
        return e(
          'section',
          { className: 'ak-section' },
          e('div', { className: 'ak-section-head' }, e('span', { className: 'ak-section-title' }, t('overview.focus'))),
          e(
            'div',
            { className: 'ak-empty' },
            e('p', { className: 'ak-empty-title' }, t('overview.noFocus')),
            e('p', { className: 'ak-empty-body' }, t('overview.noFocusBody')),
          ),
        )
      }
      const { project, task } = focus
      const status = displayStatus(task)
      const needsHuman = status === 'review' || status === 'blocked'
      return e(
        'section',
        { className: 'ak-section' },
        e('div', { className: 'ak-section-head' }, e('span', { className: 'ak-section-title' }, t('overview.focus'))),
        e(
          'div',
          { className: 'ak-focus' },
          e(
            'div',
            { className: 'ak-focus-main' },
            e(
              'div',
              { className: 'ak-focus-eyebrow' },
              e(ProjectGlyph, { project }),
              project.name,
              e(StatusPill, { status, t }),
            ),
            e('div', { className: 'ak-focus-title', title: task.title }, `${task.id} ${task.title}`),
            e(
              'div',
              { className: 'ak-focus-meta' },
              task.blocked_reason ? e('span', null, task.blocked_reason) : null,
              status === 'review' ? e('span', null, t('task.reviewHint')) : null,
              project.path ? e('span', { title: project.path }, project.path) : null,
            ),
          ),
          e(
            'div',
            { className: 'ak-focus-side' },
            needsHuman
              ? e('button', { type: 'button', className: 'ak-btn ak-btn-primary', onClick: () => onOpenTask(project.project_id, task.id) }, t('task.open'))
              : e(
                  'button',
                  {
                    type: 'button',
                    className: 'ak-btn',
                    onClick: () => onOpenTask(project.project_id, task.id),
                  },
                  t('task.open'),
                ),
            needsHuman
              ? null
              : e('button', { type: 'button', className: 'ak-btn ak-btn-primary', onClick: () => onExecute(project, task) }, t('task.execute')),
          ),
        ),
      )
    }

    function ProjectRow({ project, t, onOpen }) {
      const progress = progressOf(project)
      return e(
        'div',
        {
          className: 'ak-row',
          role: 'button',
          tabIndex: 0,
          onClick: () => onOpen(project.project_id),
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpen(project.project_id)
            }
          },
        },
        e(
          'div',
          { className: 'ak-row-id' },
          e(ProjectGlyph, { project }),
          e(
            'div',
            { style: { minWidth: 0 } },
            e('div', { className: 'ak-row-name' }, project.name),
            e('div', { className: 'ak-row-sub' }, project.summary || project.stage || ''),
          ),
        ),
        e(
          'div',
          { className: 'ak-row-next' },
          e('div', { className: 'ak-row-next-label' }, t('project.next')),
          e(
            'div',
            { className: 'ak-row-next-title' },
            project.next_task ? `${project.next_task.id} ${project.next_task.title}` : t('project.noNext'),
          ),
        ),
        e(
          'div',
          { className: 'ak-row-side' },
          e(
            'div',
            { className: 'ak-row-progress' },
            e('span', { className: 'ak-bar' }, e('i', { style: { width: `${progress}%` } })),
            e('span', null, `${progress}%`),
          ),
          e(
            'div',
            { className: 'ak-badges' },
            project.writable
              ? null
              : e('span', { className: 'ak-badge', title: project.read_only_reason || '' }, t('project.readonly')),
            project.counts.in_progress ? e('span', { className: 'ak-badge', 'data-tone': 'in_progress' }, `${project.counts.in_progress} ${t('stats.inProgress')}`) : null,
            project.counts.review ? e('span', { className: 'ak-badge', 'data-tone': 'review' }, `${project.counts.review} ${t('stats.review')}`) : null,
            project.counts.blocked ? e('span', { className: 'ak-badge', 'data-tone': 'blocked' }, `${project.counts.blocked} ${t('stats.blocked')}`) : null,
            e('span', { className: 'ak-badge' }, `${project.done}/${project.total}`),
          ),
        ),
      )
    }

    function Overview({ data, t, loading, onOpenProject, onOpenTask, onExecute, onAddRoot }) {
      const sourceCount = (data.workspaces?.length ?? 0) + (data.externalRoots?.length ?? 0)
      if (!sourceCount) {
        return e(
          'div',
          { className: 'ak-container' },
          e(
            'div',
            { className: 'ak-empty' },
            e('p', { className: 'ak-empty-title' }, t('overview.emptyRoots')),
            e('p', { className: 'ak-empty-body' }, t('overview.emptyRootsBody')),
            e('button', { type: 'button', className: 'ak-btn ak-btn-primary', onClick: onAddRoot }, e(Icon, { name: 'plus' }), t('action.addRoot')),
          ),
        )
      }
      if (!data.projects.length) {
        return e(
          'div',
          { className: 'ak-container' },
          e(
            'div',
            { className: 'ak-empty' },
            e('p', { className: 'ak-empty-title' }, t('overview.emptyProjects')),
            e('p', { className: 'ak-empty-body' }, t('overview.emptyProjectsBody')),
            e('p', { className: 'ak-section-hint', style: { marginBottom: 14 } }, `${t('roots.workspaces')}：${data.workspaces?.length ?? 0}`),
            e('button', { type: 'button', className: 'ak-btn', onClick: onAddRoot }, e(Icon, { name: 'folder' }), t('action.addRoot')),
          ),
        )
      }
      const focus = pickFocus(data.projects)
      return e(
        'div',
        { className: 'ak-container' },
        e(Stats, { data, t }),
        e(FocusCard, { focus, t, onOpenTask, onExecute }),
        e(
          'section',
          { className: 'ak-section' },
          e(
            'div',
            { className: 'ak-section-head' },
            e('span', { className: 'ak-section-title' }, t('overview.projects')),
            e('span', { className: 'ak-section-hint' }, t('overview.projectsHint')),
          ),
          e(
            'div',
            { className: 'ak-rows' },
            ...[...data.projects]
              .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
              .map((project) => e(ProjectRow, { key: project.project_id, project, t, onOpen: onOpenProject })),
          ),
        ),
        data.issues?.length
          ? e('div', { className: 'ak-section' }, e('div', { className: 'ak-notice' }, e(Icon, { name: 'alert' }), e('div', null, `${t('misc.issues')}：${data.issues.map((item) => item.message).join('；')}`)))
          : null,
        data.truncated ? e('div', { className: 'ak-notice', 'data-tone': 'warn' }, e(Icon, { name: 'alert' }), t('misc.truncated')) : null,
        loading ? e('div', { className: 'ak-section ak-notice' }, e('span', { className: 'ak-spin' }), t('misc.loading')) : null,
      )
    }

    function TaskCard({ project, task, t, onOpen }) {
      const status = displayStatus(task)
      const note =
        status === 'blocked' && task.blocked_reason
          ? task.blocked_reason
          : status === 'review'
            ? t('task.reviewHint')
            : status === 'done' && task.completed_at
              ? formatWhen(task.completed_at)
              : task.session_id
                ? t('task.openSession')
                : ''
      return e(
        'button',
        {
          type: 'button',
          className: 'ak-card',
          'data-next': task.next ? 'true' : 'false',
          onClick: () => onOpen(project.project_id, task.id),
          title: `${task.id} · ${task.title}`,
        },
        e(
          'span',
          { className: 'ak-card-top' },
          e('span', { className: 'ak-card-id' }, task.id),
          e('span', { className: 'ak-dot', 'data-tone': status, 'aria-hidden': true }),
        ),
        e('span', { className: 'ak-card-title' }, task.title),
        note ? e('span', { className: 'ak-card-note', 'data-tone': status }, note) : null,
        task.session_id ? e('span', { className: 'ak-card-session' }, e(Icon, { name: 'session', size: 11 }), t('task.openSession')) : null,
      )
    }

    function Board({ project, t, onOpenTask }) {
      const [tab, setTab] = React.useState('all')
      const [query, setQuery] = React.useState('')
      const [doneOpen, setDoneOpen] = React.useState(false)
      const term = query.trim().toLowerCase()
      const matches = (task) => !term || `${task.id} ${task.title}`.toLowerCase().includes(term)
      const visible = project.tasks.filter(matches)
      const statusOf = (task) => displayStatus(task)
      const doneTasks = visible.filter((task) => statusOf(task) === 'done')
      const counts = { all: visible.length, ...project.counts }
      const lanes = tab === 'all' ? ACTIVE_STATUSES : tab === 'done' ? [] : [tab]
      const doneExpanded = tab === 'done' || doneOpen
      const toggleDone = () => {
        if (tab === 'done') {
          setTab('all')
          setDoneOpen(false)
        } else {
          setDoneOpen((value) => !value)
        }
      }

      return e(
        'div',
        null,
        e(
          'div',
          { className: 'ak-board-tools' },
          e(
            'div',
            { className: 'ak-tabs', role: 'group', 'aria-label': t('misc.all') },
            ...[['all', t('misc.all')], ...ALL_STATUSES.map((status) => [status, t(`task.status.${status}`)])].map(([key, label]) =>
              e(
                'button',
                { key, type: 'button', className: 'ak-tab', 'aria-pressed': tab === key, onClick: () => setTab(key) },
                key === 'all' ? null : e('span', { className: 'ak-dot', 'data-tone': key }),
                label,
                e('span', { className: 'ak-tab-count' }, String(counts[key] ?? 0)),
              ),
            ),
          ),
          e(
            'span',
            { className: 'ak-search' },
            e(Icon, { name: 'search', size: 14 }),
            e('input', {
              type: 'search',
              value: query,
              placeholder: t('misc.search'),
              'aria-label': t('misc.search'),
              onChange: (event) => setQuery(event.target.value),
            }),
          ),
        ),
        lanes.length
          ? e(
              'div',
              { className: 'ak-board', 'data-single': lanes.length === 1 ? 'true' : 'false' },
              ...lanes.map((status) => {
                const tasks = visible.filter((task) => statusOf(task) === status)
                return e(
                  'section',
                  { key: status, className: 'ak-lane' },
                  e(
                    'div',
                    { className: 'ak-lane-head' },
                    e('span', { className: 'ak-lane-title' }, e('span', { className: 'ak-dot', 'data-tone': status }), t(`task.status.${status}`)),
                    e('span', { className: 'ak-lane-count' }, String(tasks.length)),
                  ),
                  e(
                    'div',
                    { className: 'ak-lane-body' },
                    ...(tasks.length
                      ? tasks.map((task) => e(TaskCard, { key: task.id, project, task, t, onOpen: onOpenTask }))
                      : [e('div', { key: 'empty', className: 'ak-lane-empty' }, term ? t('misc.noMatch') : t('misc.empty'))]),
                  ),
                )
              }),
            )
          : null,
        (tab === 'all' || tab === 'done') && (doneTasks.length > 0 || tab === 'done')
          ? e(
              'section',
              { className: 'ak-done' },
              e(
                'button',
                {
                  type: 'button',
                  className: 'ak-done-head',
                  'aria-expanded': doneExpanded,
                  onClick: toggleDone,
                },
                e('span', { className: 'ak-lane-title' }, e('span', { className: 'ak-dot', 'data-tone': 'done' }), t('task.status.done')),
                e('span', { className: 'ak-done-count' }, String(doneTasks.length)),
                e('span', { className: 'ak-done-spacer' }),
                e('span', { className: 'ak-done-chevron', 'aria-hidden': true }),
              ),
              doneExpanded
                ? doneTasks.length
                  ? e(
                      'div',
                      { className: 'ak-done-grid' },
                      ...doneTasks.map((task) => e(TaskCard, { key: task.id, project, task, t, onOpen: onOpenTask })),
                    )
                  : e('div', { className: 'ak-lane-empty' }, term ? t('misc.noMatch') : t('misc.empty'))
                : null,
            )
          : null,
        project.tasks.some((task) => task.status === 'cancelled')
          ? e(
              'details',
              { className: 'ak-details' },
              e('summary', null, `${t('misc.cancelled')} · ${project.tasks.filter((task) => task.status === 'cancelled').length}`),
              e(
                'div',
                { className: 'ak-rows' },
                ...project.tasks
                  .filter((task) => task.status === 'cancelled')
                  .map((task) => e(TaskCard, { key: task.id, project, task, t, onOpen: onOpenTask })),
              ),
            )
          : null,
      )
    }

    function ProjectView({ project, t, onBack, onOpenTask, onCreate, onOpenSession, onExecute, onDispatch, embedded = false }) {
      const progress = progressOf(project)
      return e(
        'div',
        { className: embedded ? 'ak-container ak-embedded' : 'ak-container' },
        embedded
          ? null
          : e(
              'button',
              { type: 'button', className: 'ak-btn ak-btn-ghost ak-btn-sm', onClick: onBack, style: { marginBottom: 10 } },
              e(Icon, { name: 'back', size: 14 }),
              t('action.back'),
            ),
        e(
          'div',
          { className: 'ak-project-head' },
          e(
            'div',
            { style: { minWidth: 0 } },
            e(
              'h1',
              { className: 'ak-project-title' },
              e(ProjectGlyph, { project }),
              e('span', { className: 'ak-project-name' }, project.name),
            ),
            project.summary ? e('p', { className: 'ak-project-summary' }, project.summary) : null,
            e(
              'div',
              { className: 'ak-project-meta' },
              e('span', { className: 'ak-badge' }, project.stage || project.status),
              project.writable
                ? e('span', { className: 'ak-badge', 'data-tone': 'done' }, t('project.writable'))
                : e('span', { className: 'ak-badge', title: project.read_only_reason || '' }, t('project.readonly')),
              e('span', null, `${t('project.progress')} ${project.done}/${project.total}`),
              project.updated_at ? e('span', null, `${t('misc.updated')} ${formatWhen(project.updated_at)}`) : null,
            ),
          ),
          e(
            'div',
            { className: 'ak-project-side' },
            e('button', { type: 'button', className: 'ak-btn', onClick: () => onOpenSession(project) }, e(Icon, { name: 'session' }), t('project.openSession')),
            project.writable
              ? e('button', { type: 'button', className: 'ak-btn ak-btn-primary', onClick: () => onCreate(project) }, e(Icon, { name: 'plus' }), t('action.create'))
              : null,
          ),
        ),
        e('div', { className: 'ak-bar', style: { marginBottom: 4 } }, e('i', { style: { width: `${progress}%` } })),
        project.read_only_reason ? e('div', { className: 'ak-notice', style: { marginTop: 12 } }, e(Icon, { name: 'alert' }), e('span', null, project.read_only_reason)) : null,
        e(Board, { project, t, onOpenTask }),
      )
    }

    function Markdown({ source }) {
      const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n')
      const blocks = []
      let index = 0
      let key = 0

      const inline = (value) => {
        const nodes = []
        const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g
        let last = 0
        let match
        let part = 0
        while ((match = pattern.exec(value)) !== null) {
          if (match.index > last) nodes.push(value.slice(last, match.index))
          const token = match[0]
          if (token.startsWith('**')) {
            nodes.push(e('strong', { key: `b${part++}` }, token.slice(2, -2)))
          } else if (token.startsWith('`')) {
            nodes.push(e('code', { key: `c${part++}` }, token.slice(1, -1)))
          } else {
            const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(token)
            nodes.push(
              e('a', { key: `a${part++}`, href: link[1] ? link[2] : '#', target: '_blank', rel: 'noreferrer' }, link[1]),
            )
          }
          last = match.index + token.length
        }
        if (last < value.length) nodes.push(value.slice(last))
        return nodes
      }

      while (index < lines.length) {
        const line = lines[index]
        if (line.startsWith('```')) {
          const language = line.slice(3).trim()
          const buffer = []
          index += 1
          while (index < lines.length && !lines[index].startsWith('```')) {
            buffer.push(lines[index])
            index += 1
          }
          index += 1
          blocks.push(e('pre', { key: `pre${key++}` }, e('code', { 'data-language': language || undefined }, buffer.join('\n'))))
          continue
        }
        const heading = /^(#{1,3})\s+(.*)$/.exec(line)
        if (heading) {
          const level = heading[1].length
          blocks.push(e(`h${level}`, { key: `h${key++}` }, ...inline(heading[2])))
          index += 1
          continue
        }
        if (/^\s*[-*]\s+/.test(line)) {
          const items = []
          while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
            items.push(lines[index].replace(/^\s*[-*]\s+/, ''))
            index += 1
          }
          blocks.push(e('ul', { key: `ul${key++}` }, ...items.map((item, itemIndex) => e('li', { key: itemIndex }, ...inline(item)))))
          continue
        }
        if (/^\s*\d+\.\s+/.test(line)) {
          const items = []
          while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
            items.push(lines[index].replace(/^\s*\d+\.\s+/, ''))
            index += 1
          }
          blocks.push(e('ol', { key: `ol${key++}` }, ...items.map((item, itemIndex) => e('li', { key: itemIndex }, ...inline(item)))))
          continue
        }
        if (/^>\s?/.test(line)) {
          const buffer = []
          while (index < lines.length && /^>\s?/.test(lines[index])) {
            buffer.push(lines[index].replace(/^>\s?/, ''))
            index += 1
          }
          blocks.push(e('blockquote', { key: `q${key++}` }, ...inline(buffer.join('\n'))))
          continue
        }
        if (/^-{3,}$/.test(line.trim())) {
          blocks.push(e('hr', { key: `hr${key++}` }))
          index += 1
          continue
        }
        if (!line.trim()) {
          index += 1
          continue
        }
        const paragraph = []
        while (
          index < lines.length &&
          lines[index].trim() &&
          !/^(#{1,3}\s|```|\s*[-*]\s|\s*\d+\.\s|>)/.test(lines[index])
        ) {
          paragraph.push(lines[index])
          index += 1
        }
        blocks.push(e('p', { key: `p${key++}` }, ...inline(paragraph.join('\n'))))
      }
      return e('div', { className: 'ak-md' }, ...blocks)
    }

    function TaskDrawer({ project, task, detail, loadingDetail, t, busy, onClose, onStart, onFinish, onBlock, onAccept, onReject, onCopy, onExecute, onDispatch, onOpenSession }) {
      const [mode, setMode] = React.useState('none')
      const [record, setRecord] = React.useState('')
      const [reason, setReason] = React.useState('')
      const [error, setError] = React.useState('')
      const [working, setWorking] = React.useState(false)
      const canWrite = project.writable && !task.external
      const status = displayStatus(task)
      const instruction = detail?.instruction || buildInstruction(project, task)

      const submitFinish = async () => {
        setWorking(true)
        setError('')
        try {
          await onFinish(task, record)
          setMode('none')
        } catch (failure) {
          setError(failure.message || String(failure))
        } finally {
          setWorking(false)
        }
      }
      const submitBlock = async () => {
        setWorking(true)
        setError('')
        try {
          await onBlock(task, reason)
          setMode('none')
        } catch (failure) {
          setError(failure.message || String(failure))
        } finally {
          setWorking(false)
        }
      }

      return e(
        Portal,
        null,
        e(
          React.Fragment,
          null,
          e('div', { className: 'ak-mask', onClick: onClose, 'aria-hidden': true }),
        e(
          'aside',
          { className: 'ak-drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': task.title },
          e(
            'div',
            { className: 'ak-drawer-head' },
            e(
              'div',
              { style: { minWidth: 0 } },
              e('div', { className: 'ak-drawer-eyebrow' }, e(ProjectGlyph, { project }), project.name, e(StatusPill, { status, t })),
              e('h2', { className: 'ak-drawer-title' }, `${task.id} ${task.title}`),
            ),
            e('button', { type: 'button', className: 'ak-icon-btn', onClick: onClose, 'aria-label': t('action.close') }, e(Icon, { name: 'close' })),
          ),
          e(
            'div',
            { className: 'ak-drawer-body' },
            e(
              'div',
              { className: 'ak-meta-grid' },
              e('span', { className: 'ak-meta-label' }, t('task.project')),
              e('span', { className: 'ak-meta-value' }, project.name),
              task.created_at ? e('span', { className: 'ak-meta-label' }, t('task.created')) : null,
              task.created_at ? e('span', { className: 'ak-meta-value' }, formatWhen(task.created_at)) : null,
              task.started_at ? e('span', { className: 'ak-meta-label' }, t('task.started')) : null,
              task.started_at ? e('span', { className: 'ak-meta-value' }, formatWhen(task.started_at)) : null,
              task.submitted_at && !task.completed_at ? e('span', { className: 'ak-meta-label' }, t('task.submitted')) : null,
              task.submitted_at && !task.completed_at ? e('span', { className: 'ak-meta-value' }, formatWhen(task.submitted_at)) : null,
              task.completed_at ? e('span', { className: 'ak-meta-label' }, t('task.completed')) : null,
              task.completed_at ? e('span', { className: 'ak-meta-value' }, formatWhen(task.completed_at)) : null,
              task.run_id ? e('span', { className: 'ak-meta-label' }, t('task.runId')) : null,
              task.run_id ? e('span', { className: 'ak-meta-value ak-mono' }, task.run_id) : null,
              task.session_id ? e('span', { className: 'ak-meta-label' }, t('task.openSession')) : null,
              task.session_id
                ? e(
                    'span',
                    { className: 'ak-meta-value' },
                    e('button', { type: 'button', className: 'ak-btn ak-btn-sm', onClick: () => onOpenSession(task.session_id) }, e(Icon, { name: 'session', size: 13 }), t('task.openSession')),
                  )
                : null,
            ),
            task.blocked_reason ? e('div', { className: 'ak-notice', 'data-tone': 'warn' }, e(Icon, { name: 'alert' }), e('span', null, task.blocked_reason)) : null,
            !canWrite
              ? e('div', { className: 'ak-notice' }, e(Icon, { name: 'alert' }), e('span', null, task.external ? t('task.external') : t('task.readonly')))
              : null,
            e('div', { className: 'ak-divider' }),
            loadingDetail ? e('div', { className: 'ak-notice' }, e('span', { className: 'ak-spin' }), t('task.detailLoading')) : e(Markdown, { source: detail?.detail?.text || t('task.noDetail') }),
            mode === 'finish'
              ? e(
                  'div',
                  { className: 'ak-form' },
                  e('div', { className: 'ak-section-title' }, t('task.finishTitle')),
                  e('div', { className: 'ak-section-hint' }, t('task.finishHint')),
                  e('label', null, t('task.record'), e('textarea', { rows: 5, value: record, onChange: (event) => setRecord(event.target.value), placeholder: '变更摘要、验证命令与结果、遗留事项' })),
                  error ? e('div', { className: 'ak-error' }, error) : null,
                  e(
                    'div',
                    { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
                    e('button', { type: 'button', className: 'ak-btn', onClick: () => setMode('none'), disabled: working }, t('action.cancel')),
                    e('button', { type: 'button', className: 'ak-btn ak-btn-primary', onClick: submitFinish, disabled: working || !record.trim() }, working ? t('task.working') : t('task.submitFinish')),
                  ),
                )
              : null,
            mode === 'block'
              ? e(
                  'div',
                  { className: 'ak-form' },
                  e('div', { className: 'ak-section-title' }, t('task.blockTitle')),
                  e('div', { className: 'ak-section-hint' }, t('task.blockHint')),
                  e('label', null, t('task.reason'), e('textarea', { rows: 4, value: reason, onChange: (event) => setReason(event.target.value) })),
                  error ? e('div', { className: 'ak-error' }, error) : null,
                  e(
                    'div',
                    { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
                    e('button', { type: 'button', className: 'ak-btn', onClick: () => setMode('none'), disabled: working }, t('action.cancel')),
                    e('button', { type: 'button', className: 'ak-btn ak-btn-danger', onClick: submitBlock, disabled: working || !reason.trim() }, working ? t('task.working') : t('task.submitBlock')),
                  ),
                )
              : null,
          ),
          e(
            'div',
            { className: 'ak-drawer-foot' },
            e(
              'div',
              { className: 'ak-drawer-actions' },
              status === 'review' && canWrite && typeof onAccept === 'function'
                ? e(
                    'button',
                    {
                      type: 'button',
                      className: 'ak-btn ak-btn-primary',
                      disabled: working || busy === 'accept',
                      onClick: () => onAccept(task).catch(() => {}),
                    },
                    e(Icon, { name: 'check', size: 14 }),
                    t('task.accept'),
                  )
                : null,
              status === 'review' && canWrite && typeof onReject === 'function'
                ? e(
                    'button',
                    {
                      type: 'button',
                      className: 'ak-btn',
                      disabled: working || busy === 'reject',
                      onClick: () => onReject(task).catch(() => {}),
                    },
                    e(Icon, { name: 'back', size: 14 }),
                    t('task.reject'),
                  )
                : null,
              status === 'todo' && canWrite && typeof onDispatch === 'function'
                ? e(
                    'button',
                    {
                      type: 'button',
                      className: 'ak-btn ak-btn-primary',
                      disabled: busy === 'dispatch' || working,
                      onClick: () => onDispatch(task).catch(() => {}),
                    },
                    e(Icon, { name: 'session', size: 14 }),
                    t('task.dispatch'),
                  )
                : null,
              status === 'todo' && canWrite
                ? e('button', { type: 'button', className: 'ak-btn', disabled: busy === 'start' || working, onClick: () => onStart(task).catch(() => {}) }, e(Icon, { name: 'play', size: 14 }), t('task.start'))
                : null,
              status === 'in_progress' && canWrite
                ? e('button', { type: 'button', className: 'ak-btn', disabled: working, onClick: () => { setRecord(record || ''); setMode('finish'); setError('') } }, e(Icon, { name: 'check', size: 14 }), t('task.finish'))
                : null,
              status === 'in_progress' && canWrite
                ? e('button', { type: 'button', className: 'ak-btn ak-btn-danger', disabled: working, onClick: () => { setMode('block'); setError('') } }, e(Icon, { name: 'block', size: 14 }), t('task.block'))
                : null,
              e('button', { type: 'button', className: 'ak-btn', onClick: () => onCopy(instruction).catch(() => {}) }, e(Icon, { name: 'copy', size: 14 }), t('task.copy')),
              status === 'review' || status === 'done'
                ? null
                : e('button', { type: 'button', className: 'ak-btn', onClick: () => onExecute(project, task, instruction).catch(() => {}) }, e(Icon, { name: 'session', size: 14 }), t('task.execute')),
            ),
          ),
        ),
      ),
    )
    }

    function CreateDialog({ project, t, busy, onClose, onCreate }) {
      const [title, setTitle] = React.useState('')
      const [scope, setScope] = React.useState('')
      const [acceptance, setAcceptance] = React.useState('')
      const [setNext, setSetNext] = React.useState(false)
      const [error, setError] = React.useState('')
      const submit = async (event) => {
        event.preventDefault()
        if (!title.trim()) return
        setError('')
        try {
          await onCreate({ title: title.trim(), scope: scope.trim(), acceptance: acceptance.trim(), set_next: setNext })
        } catch (failure) {
          setError(failure.message || String(failure))
        }
      }
      return e(
        Portal,
        null,
        e(
          'div',
          { className: 'ak-dialog-mask', onMouseDown: (event) => { if (event.target === event.currentTarget) onClose() } },
          e(
            'form',
          { className: 'ak-dialog', onSubmit: submit },
          e(
            'div',
            { className: 'ak-dialog-head' },
            e('div', null, e('h3', { className: 'ak-dialog-title' }, t('dialog.createTitle')), e('p', { className: 'ak-dialog-hint' }, t('dialog.createHint'))),
            e('button', { type: 'button', className: 'ak-icon-btn', onClick: onClose, 'aria-label': t('action.close') }, e(Icon, { name: 'close' })),
          ),
          e(
            'div',
            { className: 'ak-dialog-body ak-form' },
            e('div', { className: 'ak-section-hint' }, project.name),
            e('label', null, `${t('dialog.title')} *`, e('input', { value: title, maxLength: 120, autoFocus: true, onChange: (event) => setTitle(event.target.value), placeholder: t('dialog.titlePlaceholder') })),
            e('label', null, t('dialog.scope'), e('textarea', { rows: 3, maxLength: 3000, value: scope, onChange: (event) => setScope(event.target.value), placeholder: t('dialog.scopePlaceholder') })),
            e('label', null, t('dialog.acceptance'), e('textarea', { rows: 3, maxLength: 3000, value: acceptance, onChange: (event) => setAcceptance(event.target.value), placeholder: t('dialog.acceptancePlaceholder') })),
            e('label', { className: 'ak-check' }, e('input', { type: 'checkbox', checked: setNext, onChange: (event) => setSetNext(event.target.checked) }), t('dialog.setNext')),
            error ? e('div', { className: 'ak-error' }, error) : null,
          ),
          e(
            'div',
            { className: 'ak-dialog-foot' },
            e('button', { type: 'button', className: 'ak-btn', onClick: onClose, disabled: busy === 'create' }, t('action.cancel')),
            e('button', { type: 'submit', className: 'ak-btn ak-btn-primary', disabled: busy === 'create' || !title.trim() }, busy === 'create' ? t('task.working') : t('dialog.create')),
          ),
        ),
      ),
    )
    }

    function RootsDialog({ workspaces = [], roots = [], t, busy, onClose, onAdd, onRemove }) {
      const [manual, setManual] = React.useState('')
      const pick = async () => {
        try {
          const path = await ctxPickDirectory()
          if (path) await onAdd([path])
        } catch (failure) {
          // The parent surfaces the failure through a toast.
        }
      }
      const addManual = async () => {
        if (!manual.trim()) return
        try {
          await onAdd([manual.trim()])
          setManual('')
        } catch (failure) {
          // The parent surfaces the failure through a toast.
        }
      }
      return e(
        Portal,
        null,
        e(
          'div',
          { className: 'ak-dialog-mask', onMouseDown: (event) => { if (event.target === event.currentTarget) onClose() } },
          e(
            'div',
            { className: 'ak-dialog' },
          e(
            'div',
            { className: 'ak-dialog-head' },
            e('div', null, e('h3', { className: 'ak-dialog-title' }, t('roots.title')), e('p', { className: 'ak-dialog-hint' }, t('roots.hint'))),
            e('button', { type: 'button', className: 'ak-icon-btn', onClick: onClose, 'aria-label': t('action.close') }, e(Icon, { name: 'close' })),
          ),
          e(
            'div',
            { className: 'ak-dialog-body' },
            e(
              'div',
              { className: 'ak-section-head' },
              e('span', { className: 'ak-section-title' }, t('roots.workspaces')),
              e('span', { className: 'ak-section-hint' }, String(workspaces.length)),
            ),
            e('p', { className: 'ak-section-hint', style: { margin: '0 0 8px' } }, t('roots.autoHint')),
            workspaces.length
              ? e(
                  'ul',
                  { className: 'ak-roots' },
                  ...workspaces.map((workspace) =>
                    e(
                      'li',
                      { key: workspace.id || workspace.path, className: 'ak-root-row' },
                      e(
                        'span',
                        { style: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 } },
                        e('span', { className: 'ak-root-title' }, workspace.title || workspace.path),
                        e('span', { className: 'ak-root-path', title: workspace.path }, workspace.path),
                      ),
                      e('span', { className: 'ak-badge' }, `${workspace.projectCount ?? 0} ${t('stats.projects')}`),
                    ),
                  ),
                )
              : e('p', { className: 'ak-empty-body' }, t('overview.emptyRoots')),
            e('div', { className: 'ak-divider' }),
            e(
              'div',
              { className: 'ak-section-head' },
              e('span', { className: 'ak-section-title' }, t('roots.external')),
              e('span', { className: 'ak-section-hint' }, String(roots.length)),
            ),
            e(
              'div',
              { className: 'ak-form', style: { marginBottom: 14 } },
              e(
                'label',
                null,
                t('roots.path'),
                e('input', {
                  value: manual,
                  placeholder: t('roots.pathPlaceholder'),
                  onChange: (event) => setManual(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addManual()
                    }
                  },
                }),
              ),
              e(
                'div',
                { style: { display: 'flex', justifyContent: 'flex-end' } },
                e('button', { type: 'button', className: 'ak-btn ak-btn-sm', disabled: busy === 'roots' || !manual.trim(), onClick: addManual }, t('roots.addPath')),
              ),
            ),
            roots.length
              ? e(
                  'ul',
                  { className: 'ak-roots' },
                  ...roots.map((root) =>
                    e(
                      'li',
                      { key: root, className: 'ak-root-row' },
                      e('span', { className: 'ak-root-path', title: root }, root),
                      e('button', { type: 'button', className: 'ak-btn ak-btn-sm ak-btn-danger', disabled: busy === 'roots', onClick: () => onRemove([root]) }, t('roots.remove')),
                    ),
                  ),
                )
              : e('p', { className: 'ak-empty-body' }, t('roots.empty')),
          ),
          e(
            'div',
            { className: 'ak-dialog-foot' },
            e('button', { type: 'button', className: 'ak-btn', onClick: onClose }, t('roots.close')),
            e('button', { type: 'button', className: 'ak-btn ak-btn-primary', disabled: busy === 'roots', onClick: pick }, e(Icon, { name: 'folder' }), t('roots.add')),
          ),
        ),
      ),
    )
    }

    function Toast({ toast }) {
      return e('div', { className: 'ak-toast', 'data-tone': toast.tone || 'info', role: 'status' }, toast.message)
    }

    function projectForCwd(projects, cwd) {
      if (!cwd) return null
      return (
        projects
          .filter((project) => cwd === project.path || cwd.startsWith(project.path + '/'))
          .sort((left, right) => right.path.length - left.path.length)[0] ?? null
      )
    }

    /**
     * Session-scoped board rendered as a Conversation View tab next to Chat and
     * Trajectory. It follows the current Session's cwd and can hand a task to a
     * brand-new Session without copying an instruction.
     */
    function SessionKanban({ ctx, host }) {
      useLocale(ctx)
      const t = ctx.locale.bind(NS)
      const sessionId = host?.sessionId ?? null
      const cwdFromSessions =
        typeof host?.useSessions === 'function'
          ? host.useSessions((sessions) => (sessionId ? sessions?.byId?.[sessionId]?.cwd : null))
          : null
      const cwd = cwdFromSessions || host?.session?.cwd || null
      const [data, setData] = React.useState(null)
      const [loading, setLoading] = React.useState(true)
      const [error, setError] = React.useState('')
      const [selected, setSelected] = React.useState(null)
      const [detail, setDetail] = React.useState(null)
      const [detailLoading, setDetailLoading] = React.useState(false)
      const [busy, setBusy] = React.useState('')
      const [toast, setToast] = React.useState(null)
      const [createFor, setCreateFor] = React.useState(null)
      const [picked, setPicked] = React.useState('')
      const alive = React.useRef(true)
      const loadSeq = React.useRef(0)
      const toastTimer = React.useRef(null)

      const showToast = React.useCallback((message, tone = 'info') => {
        setToast({ message, tone })
        clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 4200)
      }, [])

      const load = React.useCallback(async (force = false, silent = false) => {
        const sequence = ++loadSeq.current
        if (!silent) setLoading(true)
        try {
          const next = await api(`/state${force ? '?force=1' : ''}`)
          if (!alive.current || sequence !== loadSeq.current) return
          setData(next)
          setError('')
        } catch (failure) {
          if (alive.current && !silent && sequence === loadSeq.current) {
            setError(failure.message || String(failure))
          }
        } finally {
          if (alive.current && !silent && sequence === loadSeq.current) setLoading(false)
        }
      }, [])

      React.useEffect(() => {
        alive.current = true
        load()
        return () => {
          alive.current = false
          clearTimeout(toastTimer.current)
        }
      }, [load])

      React.useEffect(() => {
        const timer = setInterval(() => {
          if (!document.hidden) load(false, true)
        }, 5000)
        const onVisible = () => {
          if (!document.hidden) load(false, true)
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
          clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisible)
        }
      }, [load])

      const matched = data ? projectForCwd(data.projects, cwd) : null
      const project =
        matched ||
        (data?.projects.find((item) => item.project_id === picked) ?? null) ||
        (data?.projects.length === 1 ? data.projects[0] : null)
      const selectedProject = selected && data
        ? data.projects.find((item) => item.project_id === selected.projectId)
        : null
      const selectedTask = selectedProject && selected
        ? selectedProject.tasks.find((item) => item.id === selected.taskId)
        : null
      const detailKey = selectedTask
        ? `${selectedTask.id}:${selectedTask.status}:${selectedTask.review ? 'review' : ''}:${selectedTask.run_id || ''}:${selectedTask.completed_at || ''}`
        : ''

      React.useEffect(() => {
        if (!selected) return
        let cancelled = false
        setDetailLoading(true)
        api(`/task?project_id=${encodeURIComponent(selected.projectId)}&task_id=${encodeURIComponent(selected.taskId)}`)
          .then((value) => {
            if (!cancelled) setDetail(value)
          })
          .catch((failure) => {
            if (!cancelled) showToast(failure.message || String(failure), 'error')
          })
          .finally(() => {
            if (!cancelled) setDetailLoading(false)
          })
        return () => {
          cancelled = true
        }
      }, [detailKey, showToast])

      const act = async (key, operation, success) => {
        setBusy(key)
        try {
          await operation()
          await load(true, true)
          if (success) showToast(success)
        } catch (failure) {
          showToast(failure.message || String(failure), 'error')
          throw failure
        } finally {
          setBusy('')
        }
      }

      const openProjectSession = async (target) => {
        try {
          const existing = await api(`/workspace?path=${encodeURIComponent(target.path)}`)
          if (existing?.workspaceId) {
            try {
              ctx.uiWorkspace.openWorkspace(existing.workspaceId)
              return true
            } catch {
              // Fall through to the client-side workspace creation.
            }
          }
          const workspace = await ctx.workspaces.create({ path: target.path })
          ctx.uiWorkspace.startSession(workspace.workspaceId)
          return true
        } catch {
          showToast(t('toast.sessionFailed'), 'error')
          return false
        }
      }

      const onStart = (task) =>
        act('start', () => api('/tasks/start', {
          method: 'POST',
          body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id }),
        }), t('toast.started'))

      const onFinish = async (task, record) => {
        await act('finish', () => api('/tasks/finish', {
          method: 'POST',
          body: JSON.stringify({
            project_id: selectedProject.project_id,
            task_id: task.id,
            run_id: task.run_id,
            record,
          }),
        }), t('toast.submitted'))
      }

      const onBlock = async (task, reason) => {
        await act('block', () => api('/tasks/block', {
          method: 'POST',
          body: JSON.stringify({
            project_id: selectedProject.project_id,
            task_id: task.id,
            run_id: task.run_id,
            reason,
          }),
        }), t('toast.blocked'))
      }

      const onAccept = (task) =>
        act('accept', () => api('/tasks/accept', {
          method: 'POST',
          body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id }),
        }), t('toast.accepted'))

      const onReject = (task) =>
        act('reject', () => api('/tasks/reject', {
          method: 'POST',
          body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id }),
        }), t('toast.rejected'))

      const onDispatch = async (task) => {
        setBusy('dispatch')
        try {
          const result = await api('/tasks/dispatch', {
            method: 'POST',
            body: JSON.stringify({
              project_id: selectedProject.project_id,
              task_id: task.id,
            }),
          })
          await load(true, true)
          showToast(t('toast.dispatched'))
          ctx.uiWorkspace.openSession(result.session_id)
        } catch (failure) {
          showToast(failure.message || String(failure), 'error')
          throw failure
        } finally {
          setBusy('')
        }
      }

      const onCopy = async (text) => {
        const copied = await copyText(text)
        showToast(copied ? t('toast.copied') : t('toast.copyFailed'), copied ? 'info' : 'error')
      }

      const onExecute = async (targetProject, targetTask, text) => {
        const instruction = text || buildInstruction(targetProject, targetTask)
        const copied = await copyText(instruction)
        showToast(copied ? t('toast.copied') : t('toast.copyFailed'), copied ? 'info' : 'error')
        await openProjectSession(targetProject)
      }

      const onCreate = async (values) => {
        setBusy('create')
        try {
          const result = await api('/tasks', {
            method: 'POST',
            body: JSON.stringify({ project_id: createFor.project_id, ...values }),
          })
          await load(true, true)
          setCreateFor(null)
          showToast(`${t('toast.created')} ${result.task.id}`)
        } finally {
          setBusy('')
        }
      }

      let content
      if (!data && loading) {
        content = e(
          'div',
          { className: 'ak-container ak-embedded' },
          e(
            'div',
            { className: 'ak-skeleton' },
            e('div', { className: 'ak-skel', 'data-tall': 'true' }),
            e('div', { className: 'ak-skel' }),
            e('div', { className: 'ak-skel' }),
          ),
        )
      } else if (!data && error) {
        content = e(
          'div',
          { className: 'ak-container ak-embedded' },
          e(
            'div',
            { className: 'ak-empty' },
            e('p', { className: 'ak-empty-title' }, t('error.load')),
            e('p', { className: 'ak-empty-body' }, error),
            e('button', { type: 'button', className: 'ak-btn ak-btn-primary', onClick: () => load(true) }, t('action.retry')),
          ),
        )
      } else if (!project) {
        content = e(
          'div',
          { className: 'ak-container ak-embedded' },
          e(
            'div',
            { className: 'ak-empty' },
            e('p', { className: 'ak-empty-title' }, t('view.noProject')),
            e('p', { className: 'ak-empty-body' }, cwd || t('view.sessionRequired')),
            data?.projects.length
              ? e(
                  'div',
                  { className: 'ak-form', style: { maxWidth: 360, margin: '0 auto 12px' } },
                  e(
                    'label',
                    null,
                    t('view.pickProject'),
                    e(
                      'select',
                      {
                        value: picked,
                        onChange: (event) => setPicked(event.target.value),
                      },
                      e('option', { value: '' }, '—'),
                      ...data.projects.map((item) =>
                        e('option', { key: item.project_id, value: item.project_id }, item.name),
                      ),
                    ),
                  ),
                )
              : null,
            e('button', { type: 'button', className: 'ak-btn', onClick: () => load(true) }, t('action.refresh')),
          ),
        )
      } else {
        content = e(ProjectView, {
          project,
          t,
          embedded: true,
          onOpenTask: (projectId, taskId) => {
            setSelected({ projectId, taskId })
            setDetail(null)
          },
          onCreate: (target) => setCreateFor(target),
          onOpenSession: openProjectSession,
          onExecute,
          onDispatch,
        })
      }

      return e(
        'div',
        { className: 'ak-view' },
        content,
        selectedTask && selectedProject
          ? e(TaskDrawer, {
              key: detailKey,
              project: selectedProject,
              task: selectedTask,
              detail,
              loadingDetail: detailLoading,
              t,
              busy,
              onClose: () => setSelected(null),
              onStart,
              onFinish,
              onBlock,
              onAccept,
              onReject,
              onCopy,
              onExecute,
              onDispatch,
              onOpenSession: (targetSessionId) => ctx.uiWorkspace.openSession(targetSessionId),
            })
          : null,
        createFor
          ? e(CreateDialog, {
              project: createFor,
              t,
              busy,
              onClose: () => setCreateFor(null),
              onCreate,
            })
          : null,
        toast ? e(Toast, { toast }) : null,
      )
    }

    let ctxPickDirectory = async () => null

    function Panel({ ctx }) {
      useLocale(ctx)
      const t = ctx.locale.bind(NS)
      const [data, setData] = React.useState(null)
      const [loading, setLoading] = React.useState(true)
      const [error, setError] = React.useState('')
      const [view, setView] = React.useState({ name: 'overview' })
      const [selected, setSelected] = React.useState(null)
      const [detail, setDetail] = React.useState(null)
      const [detailLoading, setDetailLoading] = React.useState(false)
      const [createFor, setCreateFor] = React.useState(null)
      const [rootsOpen, setRootsOpen] = React.useState(false)
      const [busy, setBusy] = React.useState('')
      const [toast, setToast] = React.useState(null)
      const alive = React.useRef(true)
      const loadSeq = React.useRef(0)
      const toastTimer = React.useRef(null)

      const showToast = React.useCallback((message, tone = 'info') => {
        setToast({ message, tone })
        clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 4200)
      }, [])

      const load = React.useCallback(async (force = false, silent = false) => {
        const sequence = ++loadSeq.current
        if (!silent) setLoading(true)
        try {
          const next = await api(`/state${force ? '?force=1' : ''}`)
          if (!alive.current || sequence !== loadSeq.current) return
          setData(next)
          setError('')
        } catch (failure) {
          if (alive.current && !silent && sequence === loadSeq.current) {
            setError(failure.message || String(failure))
          }
        } finally {
          if (alive.current && !silent && sequence === loadSeq.current) setLoading(false)
        }
      }, [])

      React.useEffect(() => {
        alive.current = true
        load()
        return () => {
          alive.current = false
        }
      }, [load])

      React.useEffect(() => {
        const timer = setInterval(() => {
          if (!document.hidden) load(false, true)
        }, 5000)
        const onVisible = () => {
          if (!document.hidden) load(false, true)
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
          clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisible)
          clearTimeout(toastTimer.current)
        }
      }, [load])

      const project =
        view.name === 'project' && data ? data.projects.find((item) => item.project_id === view.projectId) : null
      const selectedProject = selected && data ? data.projects.find((item) => item.project_id === selected.projectId) : null
      const selectedTask = selectedProject && selected ? selectedProject.tasks.find((item) => item.id === selected.taskId) : null
      const detailKey = selected && selectedTask
        ? `${selected.projectId}:${selected.taskId}:${selectedTask.status}:${selectedTask.review ? 'review' : ''}:${selectedTask.run_id || ''}:${selectedTask.completed_at || ''}`
        : ''

      React.useEffect(() => {
        if (!selected) return
        let cancelled = false
        setDetailLoading(true)
        api(`/task?project_id=${encodeURIComponent(selected.projectId)}&task_id=${encodeURIComponent(selected.taskId)}`)
          .then((value) => {
            if (!cancelled) setDetail(value)
          })
          .catch((failure) => {
            if (!cancelled) showToast(failure.message || String(failure), 'error')
          })
          .finally(() => {
            if (!cancelled) setDetailLoading(false)
          })
        return () => {
          cancelled = true
        }
      }, [detailKey, showToast])

      React.useEffect(() => {
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          if (createFor) setCreateFor(null)
          else if (rootsOpen) setRootsOpen(false)
          else if (selected) setSelected(null)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [createFor, rootsOpen, selected])

      const act = async (key, operation, success) => {
        setBusy(key)
        try {
          await operation()
          await load(true, true)
          if (success) showToast(success)
        } catch (failure) {
          showToast(failure.message || String(failure), 'error')
          throw failure
        } finally {
          setBusy('')
        }
      }

      const openProjectSession = async (target) => {
        try {
          const existing = await api(`/workspace?path=${encodeURIComponent(target.path)}`)
          if (existing?.workspaceId) {
            try {
              ctx.uiWorkspace.openWorkspace(existing.workspaceId)
              return true
            } catch {
              // Fall through to creating or reusing the workspace from the client.
            }
          }
          const workspace = await ctx.workspaces.create({ path: target.path })
          ctx.uiWorkspace.startSession(workspace.workspaceId)
          return true
        } catch (failure) {
          showToast(t('toast.sessionFailed'), 'error')
          return false
        }
      }

      const onStart = (task) =>
        act('start', () => api('/tasks/start', { method: 'POST', body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id }) }), t('toast.started'))

      const onFinish = async (task, record) => {
        await act(
          'finish',
          () => api('/tasks/finish', {
            method: 'POST',
            body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id, run_id: task.run_id, record }),
          }),
          t('toast.submitted'),
        )
      }

      const onBlock = async (task, reason) => {
        await act(
          'block',
          () => api('/tasks/block', {
            method: 'POST',
            body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id, run_id: task.run_id, reason }),
          }),
          t('toast.blocked'),
        )
      }

      const onAccept = (task) =>
        act(
          'accept',
          () => api('/tasks/accept', {
            method: 'POST',
            body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id }),
          }),
          t('toast.accepted'),
        )

      const onReject = (task) =>
        act(
          'reject',
          () => api('/tasks/reject', {
            method: 'POST',
            body: JSON.stringify({ project_id: selectedProject.project_id, task_id: task.id }),
          }),
          t('toast.rejected'),
        )

      const onExecute = async (targetProject, targetTask, text) => {
        const ownsDetail =
          detail?.task?.id === targetTask.id &&
          detail?.project?.project_id === targetProject.project_id
        const instruction = text || (ownsDetail ? detail.instruction : '') || buildInstruction(targetProject, targetTask)
        const copied = await copyText(instruction)
        showToast(copied ? t('toast.copied') : t('toast.copyFailed'), copied ? 'info' : 'error')
        await openProjectSession(targetProject)
      }

      const onCopy = async (text) => {
        const copied = await copyText(text)
        showToast(copied ? t('toast.copied') : t('toast.copyFailed'), copied ? 'info' : 'error')
      }

      const onDispatch = async (task) => {
        setBusy('dispatch')
        try {
          const result = await api('/tasks/dispatch', {
            method: 'POST',
            body: JSON.stringify({
              project_id: selectedProject.project_id,
              task_id: task.id,
            }),
          })
          await load(true, true)
          showToast(t('toast.dispatched'))
          ctx.uiWorkspace.openSession(result.session_id)
        } catch (failure) {
          showToast(failure.message || String(failure), 'error')
          throw failure
        } finally {
          setBusy('')
        }
      }

      const onCreate = async (values) => {
        setBusy('create')
        try {
          const result = await api('/tasks', {
            method: 'POST',
            body: JSON.stringify({ project_id: createFor.project_id, ...values }),
          })
          await load(true, true)
          setCreateFor(null)
          showToast(`${t('toast.created')} ${result.task.id}`)
        } finally {
          setBusy('')
        }
      }

      const onAddRoots = async (paths) => {
        setBusy('roots')
        try {
          await api('/roots', { method: 'POST', body: JSON.stringify({ add: paths }) })
          await load(true, true)
          showToast(t('toast.rootAdded'))
        } catch (failure) {
          showToast(failure.message || String(failure), 'error')
          throw failure
        } finally {
          setBusy('')
        }
      }

      const onRemoveRoots = async (paths) => {
        setBusy('roots')
        try {
          await api('/roots', { method: 'POST', body: JSON.stringify({ remove: paths }) })
          await load(true, true)
          showToast(t('toast.rootRemoved'))
        } catch (failure) {
          showToast(failure.message || String(failure), 'error')
          throw failure
        } finally {
          setBusy('')
        }
      }

      let content
      if (!data && loading) {
        content = e(
          'div',
          { className: 'ak-container' },
          e(
            'div',
            { className: 'ak-skeleton' },
            e('div', { className: 'ak-skel', 'data-tall': 'true' }),
            e('div', { className: 'ak-skel' }),
            e('div', { className: 'ak-skel' }),
            e('div', { className: 'ak-skel' }),
          ),
        )
      } else if (!data && error) {
        content = e(
          'div',
          { className: 'ak-container' },
          e(
            'div',
            { className: 'ak-empty' },
            e('p', { className: 'ak-empty-title' }, t('error.load')),
            e('p', { className: 'ak-empty-body' }, error),
            e('button', { type: 'button', className: 'ak-btn ak-btn-primary', onClick: () => load(true) }, t('action.retry')),
          ),
        )
      } else if (!data) {
        content = e('div', { className: 'ak-container' }, e('div', { className: 'ak-notice' }, t('misc.loading')))
      } else if (view.name === 'project' && project) {
        content = e(ProjectView, {
          project,
          t,
          onBack: () => setView({ name: 'overview' }),
          onOpenTask: (projectId, taskId) => setSelected({ projectId, taskId }),
          onCreate: (target) => setCreateFor(target),
          onOpenSession: openProjectSession,
          onExecute,
        })
      } else {
        content = e(Overview, {
          data,
          t,
          loading,
          onOpenProject: (projectId) => setView({ name: 'project', projectId }),
          onOpenTask: (projectId, taskId) => setSelected({ projectId, taskId }),
          onExecute,
          onAddRoot: () => setRootsOpen(true),
        })
      }

      const subtitle = data
        ? view.name === 'project' && project
          ? project.name
          : `${data.projects.length} ${t('stats.projects')} · ${data.workspaces?.length ?? 0} ${t('stats.workspaces')} · ${data.projects.reduce((sum, item) => sum + item.counts.todo, 0)} ${t('stats.todo')}`
        : t('panel.subtitle')

      return e(
        'div',
        { className: 'ak-root' },
        e(
          'header',
          { className: 'ak-topbar' },
          e(
            'div',
            { className: 'ak-brand' },
            e('span', { className: 'ak-brand-mark' }, e(SidebarIcon, { size: 18 })),
            e(
              'div',
              { style: { minWidth: 0 } },
              e('div', { className: 'ak-title' }, t('panel.title')),
              e('div', { className: 'ak-subtitle' }, subtitle),
            ),
          ),
          e(
            'div',
            { className: 'ak-actions' },
            e('button', { type: 'button', className: 'ak-btn', onClick: () => load(true), disabled: loading }, e(Icon, { name: 'refresh', size: 14 }), t('action.refresh')),
            e('button', { type: 'button', className: 'ak-btn', onClick: () => setRootsOpen(true) }, e(Icon, { name: 'folder', size: 14 }), t('action.addRoot')),
          ),
        ),
        e(
          'div',
          { className: 'ak-scroll' },
          error && data
            ? e(
                'div',
                { className: 'ak-container', style: { paddingBottom: 0 } },
                e('div', { className: 'ak-notice', 'data-tone': 'error' }, e(Icon, { name: 'alert' }), e('span', null, error)),
              )
            : null,
          content,
        ),
        createFor
          ? e(CreateDialog, {
              project: createFor,
              t,
              busy,
              onClose: () => setCreateFor(null),
              onCreate,
            })
          : null,
        rootsOpen
          ? e(RootsDialog, {
              workspaces: (data?.workspaces || []).map((workspace) => ({
                ...workspace,
                projectCount: (data?.projects || []).filter(
                  (project) => project.path === workspace.path || project.path.startsWith(workspace.path + '/'),
                ).length,
              })),
              roots: data?.externalRoots || [],
              t,
              busy,
              onClose: () => setRootsOpen(false),
              onAdd: onAddRoots,
              onRemove: onRemoveRoots,
            })
          : null,
        selectedTask && selectedProject
          ? e(TaskDrawer, {
              key: detailKey,
              project: selectedProject,
              task: selectedTask,
              detail,
              loadingDetail: detailLoading,
              t,
              busy,
              onClose: () => setSelected(null),
              onStart,
              onFinish,
              onBlock,
              onAccept,
              onReject,
              onCopy,
              onExecute,
              onDispatch,
              onOpenSession: (sessionId) => ctx.uiWorkspace.openSession(sessionId),
            })
          : null,
        toast ? e(Toast, { toast }) : null,
      )
    }

    function apply(ctx) {
      ctx.effect(() => injectStyles(), 'agent-kanban: styles')
      ctx.effect(() => {
        const disposeZh = ctx.locale.register(NS, 'zh', ZH)
        const disposeEn = ctx.locale.register(NS, 'en', EN)
        return () => {
          disposeZh()
          disposeEn()
        }
      }, 'agent-kanban: locale dictionaries')
      ctxPickDirectory = async () => {
        try {
          return await ctx.uiWorkspace.pickDirectory()
        } catch {
          return null
        }
      }
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'kanban',
            order: 30,
            label: () => ctx.locale.bind(NS)('panel.title'),
          },
          SidebarIcon,
        ),
      )
      ctx.slots.inject('conversation.view', () =>
        ctx.slots.register(
          {
            name: 'conversation.view',
            id: 'kanban',
            order: 15,
            locale: NS,
            label: () => ctx.locale.bind(NS)('view.kanban'),
          },
          (host) => e(SessionKanban, { ctx, host }),
        ),
      )
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'kanban' }, () => e(Panel, { ctx })),
      )
    }

    return {
      inject: ['slots', 'locale', 'uiWorkspace', 'workspaces'],
      apply,
    }
  },
})
