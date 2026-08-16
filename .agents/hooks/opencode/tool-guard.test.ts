import { describe, expect, it } from 'bun:test'
import { toolGuardHook } from './tool-guard'

const run = async (tool: string, args: Record<string, unknown>) => {
  const hook = toolGuardHook()
  let error: Error | undefined
  try {
    await hook({ tool, sessionID: 's1', callID: 'c1' }, { args })
  } catch (e) {
    error = e instanceof Error ? e : new Error(String(e))
  }
  return error
}

describe('toolGuardHook', () => {
  it('blocks bare env dumps in bash', async () => {
    const error = await run('bash', { command: 'printenv' })
    expect(error).toBeDefined()
    expect(error?.message).toContain('printenv')
  })

  it('blocks process.env access in bash', async () => {
    expect(
      await run('bash', { command: 'node -e "console.log(process.env)"' }),
    ).toBeDefined()
  })

  it('allows dotenvx commands', async () => {
    expect(
      await run('bash', { command: 'dotenvx run -- npm start' }),
    ).toBeUndefined()
  })

  it('allows benign bash commands', async () => {
    expect(await run('bash', { command: 'ls -la' })).toBeUndefined()
  })

  it('blocks reading .env files', async () => {
    const error = await run('read', { filePath: '.env.keys' })
    expect(error?.message).toContain('.env')
  })

  it('allows reading other files', async () => {
    expect(await run('read', { filePath: 'src/main.ts' })).toBeUndefined()
  })

  it('ignores unrelated tools', async () => {
    expect(await run('write', { filePath: '.env' })).toBeUndefined()
  })
})
