import type { Hooks } from '@opencode-ai/plugin'

const ENV_FILE = /(^|[/\s])\.env(\.keys)?(\b|$)/

const BASH_DUMPS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bprintenv\b/, 'printenv'],
  [/(^|[;&|]|\s)env(\s*(\||;|&{1,2}|>|$))/, 'a bare `env` dump'],
  [/process\.env(?![.[\w])/, 'a bare `process.env` dump'],
  [/os\.environ(?!\s*[.[])/, 'a bare `os.environ` dump'],
]

const readViolation = (filePath: string): string | undefined => {
  if (ENV_FILE.test(filePath)) {
    return 'Blocked: direct access to .env/.env.keys would expose decrypted secrets. Use `dotenvx get <KEY>` or `dotenvx run -- <command>` instead (see repo instructions on secrets).'
  }
  return undefined
}

const bashViolation = (command: string): string | undefined => {
  for (const [pattern, label] of BASH_DUMPS) {
    if (pattern.test(command)) {
      return `Blocked: ${label} would expose decrypted secrets. Ask for the specific derived value or result instead of dumping the process environment.`
    }
  }
  return undefined
}

export const toolGuardHook = (): NonNullable<Hooks['tool.execute.before']> => {
  return async (_input, output) => {
    const args = (output?.args ?? {}) as Record<string, unknown>

    if (_input.tool === 'bash') {
      const command = typeof args.command === 'string' ? args.command : ''
      if (/\bdotenvx\b/.test(command)) return
      const why = bashViolation(command)
      if (why) throw new Error(why)
      return
    }

    if (_input.tool === 'read') {
      const filePath = typeof args.filePath === 'string' ? args.filePath : ''
      const why = readViolation(filePath)
      if (why) throw new Error(why)
    }
  }
}
