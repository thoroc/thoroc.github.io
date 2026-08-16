import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Hooks } from '@opencode-ai/plugin'
import { buildOutstandingMessage, parseContextIndex } from './context-index'

const INDEX_REL = join('.context', 'index.yaml')

export const surfaceOutstandingHook = (ctx: {
  directory: string
}): NonNullable<Hooks['experimental.chat.system.transform']> => {
  return async (_input, output) => {
    const raw = await readFile(join(ctx.directory, INDEX_REL), 'utf8').catch(
      () => null,
    )
    if (raw === null) return
    const message = buildOutstandingMessage(parseContextIndex(raw))
    if (message) output.system.push(message)
  }
}
