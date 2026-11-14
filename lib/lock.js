const queues = new Map()

/** Serialize work for one key without ever rejecting the queue itself. */
export function withLock(key, operation) {
  const previous = queues.get(key) ?? Promise.resolve()
  const result = previous.then(operation, operation)
  const tail = result.then(
    () => {},
    () => {},
  )
  queues.set(key, tail)
  return result.finally(() => {
    if (queues.get(key) === tail) queues.delete(key)
  })
}
