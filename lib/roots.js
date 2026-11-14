import { mkdir, readFile, realpath, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { KanbanError } from './errors.js'
import { atomicWrite } from './fs-utils.js'

export function defaultRootsFile() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'agent-kanban', 'roots.json')
}

export async function normalizeRoot(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new KanbanError('目录路径无效')
  }
  const input = value.trim()
  const expanded = input === '~' || input.startsWith('~/') ? path.join(os.homedir(), input.slice(1)) : input
  const resolved = path.resolve(expanded)
  let real
  try {
    real = await realpath(resolved)
  } catch {
    throw new KanbanError('目录不存在或无法读取')
  }
  const info = await stat(real)
  if (!info.isDirectory()) throw new KanbanError('请选择目录')
  return real
}

export async function readRoots(file) {
  try {
    const data = JSON.parse(await readFile(file, 'utf8'))
    if (!Array.isArray(data?.roots)) return []
    return [...new Set(data.roots.filter((root) => typeof root === 'string' && root.trim()).map((root) => path.resolve(root)))]
  } catch (error) {
    if (error?.code === 'ENOENT') return []
    if (error instanceof SyntaxError) {
      throw new KanbanError('看板目录配置无法读取', 500)
    }
    throw error
  }
}

export async function writeRoots(file, roots) {
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 })
  const value = { version: 1, roots }
  await atomicWrite(file, JSON.stringify(value, null, 2) + '\n')
}

export async function addRoots(file, values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new KanbanError('请至少选择一个目录')
  }
  const added = []
  for (const value of values) added.push(await normalizeRoot(value))
  const current = await readRoots(file)
  const roots = [...current]
  for (const root of added) if (!roots.includes(root)) roots.push(root)
  await writeRoots(file, roots)
  return { roots, added: added.filter((root) => !current.includes(root)) }
}

export async function removeRoots(file, values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new KanbanError('请指定要移除的目录')
  }
  const targets = new Set(
    values
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => path.resolve(value.trim())),
  )
  const current = await readRoots(file)
  const roots = current.filter((root) => !targets.has(root))
  await writeRoots(file, roots)
  return { roots, removed: current.length - roots.length }
}
