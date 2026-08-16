import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { Hooks } from '@opencode-ai/plugin'
import {
  type JsonValue,
  localDateStamp,
  toLocalIso,
  truncate,
} from './log-utils'

const appendLine = async (
  directory: string,
  sessionID: string,
  entry: Record<string, unknown>,
): Promise<void> => {
  try {
    const logDir = join(directory, '.context', 'logs', sessionID)
    await mkdir(logDir, { recursive: true })
    const logFile = join(logDir, `${localDateStamp(new Date())}.debug.jsonl`)
    const line = JSON.stringify({ ts: toLocalIso(new Date()), ...entry })
    await appendFile(logFile, `${line}\n`)
  } catch {
    // logging must never break the session
  }
}

const eventProperties = (event: {
  properties?: unknown
}): Record<string, unknown> => {
  if (typeof event.properties === 'object' && event.properties !== null) {
    return event.properties as Record<string, unknown>
  }
  return {}
}

export type SessionLogHooks = {
  event: NonNullable<Hooks['event']>
  'tool.execute.before': NonNullable<Hooks['tool.execute.before']>
  'tool.execute.after': NonNullable<Hooks['tool.execute.after']>
}

export const sessionLogHooks = (ctx: {
  directory: string
}): SessionLogHooks => {
  return {
    event: async ({ event }) => {
      const properties = eventProperties(event)
      const sessionID =
        typeof properties.sessionID === 'string'
          ? properties.sessionID
          : 'unknown-session'
      await appendLine(ctx.directory, sessionID, {
        hook: 'event',
        event: event.type,
        properties: truncate(properties as JsonValue),
      })
    },
    'tool.execute.before': async (input) => {
      await appendLine(ctx.directory, input.sessionID, {
        hook: 'tool.execute.before',
        tool: input.tool,
      })
    },
    'tool.execute.after': async (input, output) => {
      await appendLine(ctx.directory, input.sessionID, {
        hook: 'tool.execute.after',
        tool: input.tool,
        title: output?.title,
        output: truncate(String(output?.output ?? '') as JsonValue),
      })
    },
  }
}
