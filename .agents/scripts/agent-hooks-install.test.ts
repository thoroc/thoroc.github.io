import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  type Json,
  mergeHooks,
  mergeOpenCodePlugin,
  planInstall,
  planUninstall,
  stripManagedHooks,
  stripOpenCodePlugin,
  writePlan,
} from './agent-hooks-install'

const managedHooks = {
  hooks: {
    Stop: [
      {
        hooks: [
          {
            type: 'command',
            command: `bun \${CLAUDE_PROJECT_DIR}/.claude/hooks/log-session-event.ts`,
          },
        ],
      },
    ],
    SessionStart: [
      {
        matcher: '',
        hooks: [
          {
            type: 'command',
            command: `\${CLAUDE_PROJECT_DIR}/.claude/hooks/surface-outstanding-work.ts`,
          },
        ],
      },
    ],
  },
} as Json

describe('mergeHooks', () => {
  it('adds managed hooks to empty settings', () => {
    const result = mergeHooks({}, managedHooks)
    expect(result['__agent-hooks']).toEqual({ v: 1, managed: true })
    expect((result.hooks as Json).Stop).toHaveLength(1)
  })

  it('is idempotent across repeated installs', () => {
    const once = mergeHooks({}, managedHooks)
    const twice = mergeHooks(once, managedHooks)
    expect((twice.hooks as Json).Stop).toHaveLength(1)
    expect((twice.hooks as Json).SessionStart).toHaveLength(1)
  })

  it('preserves pre-existing user hooks on the same event', () => {
    const existing = {
      hooks: {
        Stop: [{ hooks: [{ type: 'command', command: 'custom-hook' }] }],
      },
    } as Json
    const result = mergeHooks(existing, managedHooks)
    const stop = result.hooks as Json
    const commands = (stop.Stop as unknown[]).map((entry) => {
      const hooks = (entry as { hooks?: unknown[] }).hooks
      const first =
        hooks !== undefined
          ? (hooks[0] as { command?: string } | undefined)
          : undefined
      return first?.command
    })
    expect(commands).toContain('custom-hook')
    expect(commands).toContain(
      `bun \${CLAUDE_PROJECT_DIR}/.claude/hooks/log-session-event.ts`,
    )
  })
})

describe('stripManagedHooks', () => {
  it('removes managed entries and the marker but keeps user entries', () => {
    const installed = mergeHooks(
      {
        hooks: {
          Stop: [{ hooks: [{ type: 'command', command: 'custom-hook' }] }],
        },
      } as Json,
      managedHooks,
    )
    const result = stripManagedHooks(installed)
    expect(result['__agent-hooks']).toBeUndefined()
    const commands = ((result.hooks as Json).Stop as unknown[]).map((entry) => {
      const hooks = (entry as { hooks?: unknown[] }).hooks
      const first =
        hooks !== undefined
          ? (hooks[0] as { command?: string } | undefined)
          : undefined
      return first?.command
    })
    expect(commands).toEqual(['custom-hook'])
  })

  it('strips legacy managed entries that reference old .sh hook filenames', () => {
    const legacy = {
      hooks: {
        SessionStart: [
          {
            matcher: '',
            hooks: [
              {
                type: 'command',
                command: `\${CLAUDE_PROJECT_DIR}/.claude/hooks/surface-outstanding-work.sh`,
              },
            ],
          },
        ],
      },
      '__agent-hooks': { v: 1, managed: true },
    } as Json
    const result = stripManagedHooks(legacy)
    expect(result['__agent-hooks']).toBeUndefined()
    expect(result.hooks).toBeUndefined()
  })
})

describe('mergeOpenCodePlugin', () => {
  it('registers the plugin entry idempotently', () => {
    const once = mergeOpenCodePlugin({})
    const twice = mergeOpenCodePlugin(once)
    expect(once['__agent-hooks']).toEqual({ v: 1, managed: true })
    expect(once.plugin).toEqual(['./.opencode/plugins/agent-hooks/index.ts'])
    expect(twice.plugin).toHaveLength(1)
  })

  it('preserves existing plugins', () => {
    const result = mergeOpenCodePlugin({ plugin: ['other-plugin'] } as Json)
    expect(result.plugin).toEqual([
      'other-plugin',
      './.opencode/plugins/agent-hooks/index.ts',
    ])
  })
})

describe('stripOpenCodePlugin', () => {
  it('removes the managed entry and marker', () => {
    const installed = mergeOpenCodePlugin({ plugin: ['other-plugin'] } as Json)
    const result = stripOpenCodePlugin(installed)
    expect(result['__agent-hooks']).toBeUndefined()
    expect(result.plugin).toEqual(['other-plugin'])
  })
})

describe('install lifecycle', () => {
  let target = ''

  beforeEach(async () => {
    target = await mkdtemp(join(tmpdir(), 'agent-hooks-test-'))
  })

  afterEach(async () => {
    await rm(target, { recursive: true, force: true })
  })

  it('installs both targets and uninstalls cleanly', async () => {
    const existingSettings = {
      hooks: { PostToolUse: [{ matcher: 'Edit', hooks: [] }] },
    } as Json
    await mkdir(join(target, '.claude'), { recursive: true })
    await writeFile(
      join(target, '.claude', 'settings.json'),
      JSON.stringify(existingSettings),
    )
    await writeFile(
      join(target, 'opencode.json'),
      JSON.stringify({ plugin: ['other'] }),
    )

    const install = await planInstall(target)
    expect(install.claudeSettings).toBeDefined()
    await writePlan(target, install, false)

    expect(
      await readFile(
        join(target, '.claude', 'hooks', 'block-secret-exposure.ts'),
        'utf8',
      ),
    ).toContain('block')
    expect(
      await readFile(
        join(target, '.opencode', 'plugins', 'agent-hooks', 'index.ts'),
        'utf8',
      ),
    ).toContain('AgentHooksPlugin')

    const settings = JSON.parse(
      await readFile(join(target, '.claude', 'settings.json'), 'utf8'),
    )
    expect(settings.hooks.PostToolUse).toHaveLength(2)
    expect(settings.hooks.SessionStart).toBeDefined()
    expect(settings['__agent-hooks']).toBeDefined()

    const config = JSON.parse(
      await readFile(join(target, 'opencode.json'), 'utf8'),
    )
    expect(config.plugin).toContain('./.opencode/plugins/agent-hooks/index.ts')

    const uninstall = await planUninstall(target)
    await writePlan(target, uninstall, true)

    expect(
      readFile(
        join(target, '.claude', 'hooks', 'block-secret-exposure.ts'),
        'utf8',
      ),
    ).rejects.toThrow()
    expect(
      readFile(
        join(target, '.opencode', 'plugins', 'agent-hooks', 'index.ts'),
        'utf8',
      ),
    ).rejects.toThrow()

    const after = JSON.parse(
      await readFile(join(target, '.claude', 'settings.json'), 'utf8'),
    )
    expect(after['__agent-hooks']).toBeUndefined()
    expect(after.hooks.PostToolUse).toHaveLength(1)
    expect(after.hooks.PostToolUse[0].matcher).toBe('Edit')

    const afterConfig = JSON.parse(
      await readFile(join(target, 'opencode.json'), 'utf8'),
    )
    expect(afterConfig.plugin).toEqual(['other'])
  })

  it('source dir resolves to .agents/hooks in this repo', () => {
    const expected = resolve(import.meta.dir, '..', '.agents', 'hooks')
    expect(import.meta.dir.endsWith('scripts')).toBe(true)
    void expected
  })
})
