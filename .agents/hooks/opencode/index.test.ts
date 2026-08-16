import { describe, expect, it } from 'bun:test'
import { AgentHooksPlugin } from './index'

const fakeInput = (directory: string) =>
  ({
    directory,
    client: {
      tui: {
        showToast: async () => ({}),
      },
    },
    $: () => {
      throw new Error('unexpected shell call')
    },
  }) as unknown as Parameters<typeof AgentHooksPlugin>[0]

describe('AgentHooksPlugin', () => {
  it('returns hooks for all five ported concerns', async () => {
    const hooks = await AgentHooksPlugin(fakeInput('/tmp/project'))
    expect(typeof hooks.event).toBe('function')
    expect(typeof hooks['tool.execute.before']).toBe('function')
    expect(typeof hooks['tool.execute.after']).toBe('function')
    expect(typeof hooks['experimental.chat.system.transform']).toBe('function')
  })

  it('composes event handlers without throwing on unrelated events', async () => {
    const hooks = await AgentHooksPlugin(fakeInput('/tmp/project'))
    await hooks.event?.({
      event: { type: 'file.edited', properties: { file: 'a.ts' } },
    } as never)
  })

  it('surfaces outstanding work and knowledge base via system transform', async () => {
    const hooks = await AgentHooksPlugin(fakeInput('/tmp/project'))
    const output = { system: ['base'] }
    await hooks['experimental.chat.system.transform']?.(
      {} as never,
      output as never,
    )
    expect(output.system).toContain('base')
  })
})
