import { randomBytes } from 'node:crypto'
import { rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** Write a file by replacing it atomically inside its own directory. */
export async function atomicWrite(file, content) {
  const directory = path.dirname(file)
  const temporary = path.join(
    directory,
    `.${path.basename(file)}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`,
  )
  try {
    await writeFile(temporary, content, { encoding: 'utf8', mode: 0o644 })
    await rename(temporary, file)
  } catch (error) {
    await unlink(temporary).catch(() => {})
    throw error
  }
}
