import { registerApi } from './lib/api.js'
import { defaultRootsFile } from './lib/roots.js'
import { KanbanService } from './lib/service.js'
import { registerTools } from './lib/tools.js'

export const name = 'dsh-agent-kanban'

/** The tool registry is a hard dependency; wait for it before registering. */
export const inject = ['tools']

/**
 * Host half: DSH workspace discovery, external-directory scanning, task
 * writes, the same-origin JSON API and the kanban_* tools the executing agent
 * uses to claim and write back tasks.
 */
export function apply(ctx, config = {}) {
  const service = new KanbanService({
    rootsFile: typeof config.rootsFile === 'string' && config.rootsFile.trim()
      ? config.rootsFile.trim()
      : defaultRootsFile(),
    depth: config.depth,
    maxMs: config.maxMs,
    cacheMs: config.cacheMs,
    listWorkspaces: () => {
      // Resolve on every scan: the registry may register after this plugin.
      let registry
      try {
        registry = ctx.get('workspaceRegistry')
      } catch {
        registry = undefined
      }
      if (!registry || typeof registry.list !== 'function') return []
      try {
        return registry.list().map((workspace) => ({
          id: workspace.id,
          path: workspace.path,
          title: workspace.title,
        }))
      } catch {
        return []
      }
    },
  })

  registerTools(ctx, service)
  // The Web GUI may not exist in every profile; wait without blocking the tools.
  ctx.inject(['webServer'], (web) => {
    registerApi(web, service)
  })
}
