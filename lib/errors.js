export class KanbanError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'KanbanError'
    this.status = status
  }
}

export function asKanbanError(error) {
  if (error instanceof KanbanError) return error
  if (error && typeof error.message === 'string') return new KanbanError(error.message, 500)
  return new KanbanError('看板操作失败', 500)
}
