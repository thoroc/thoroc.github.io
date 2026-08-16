#!/usr/bin/env bun
// Project-scoped installer for the shared agent hooks.
//
// Installs the canonical hooks (Claude Code) and their port (opencode plugin)
// into a target project, keeping both configs merge-safe and idempotent.
//
//   bun .agents/scripts/agent-hooks-install.ts [--target <dir>] [--uninstall] [--dry-run]
//
// Claude side:  copies .agents/hooks/* into <target>/.claude/hooks/ and merges
//               the managed hook entries into <target>/.claude/settings.json
// opencode side: copies .agents/hooks/opencode/ into <target>/.opencode/plugins/
//               agent-hooks/ and registers it in <target>/opencode.json

import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const CLAUDE_HOOK_FILES = [
  'block-secret-exposure.ts',
  'log-session-event.ts',
  'surface-outstanding-work.ts',
  'surface-knowledge-base.ts',
] as const

const OPENCODE_SOURCE_DIR = 'opencode'
const OPENCODE_PLUGIN_DEST = '.opencode/plugins/agent-hooks'
const OPENCODE_PLUGIN_ENTRY = './.opencode/plugins/agent-hooks/index.ts'
const MARKER_KEY = '__agent-hooks'
const MARKER = { v: 1, managed: true }

export type Json = Record<string, unknown>

const sourceDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '.agents',
  'hooks',
)

const readJson = async (path: string): Promise<Json> => {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as Json
  } catch {
    return {}
  }
}

const writeJson = async (path: string, data: Json): Promise<void> => {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`)
}

const writeOrRemove = async (path: string, data: Json): Promise<void> => {
  if (Object.keys(data).length === 0) await rm(path, { force: true })
  else await writeJson(path, data)
}

const removeIfEmptyDir = async (dir: string): Promise<void> => {
  try {
    const entries = await readdir(dir)
    if (entries.length === 0) await rm(dir, { recursive: true })
  } catch {
    // dir already gone
  }
}

const copyDir = async (src: string, dest: string): Promise<void> => {
  const entries = await readdir(src, { withFileTypes: true })
  await mkdir(dest, { recursive: true })
  for (const entry of entries) {
    const from = resolve(src, entry.name)
    const to = resolve(dest, entry.name)
    if (entry.isDirectory()) await copyDir(from, to)
    else if (!entry.name.endsWith('.test.ts')) await cp(from, to)
  }
}

const MANAGED_HOOK_FILE =
  /^(block-secret-exposure|log-session-event|surface-outstanding-work|surface-knowledge-base)\.(ts|sh)$/

const MANAGED_HOOK_COMMAND =
  /\.claude\/hooks\/(block-secret-exposure|log-session-event|surface-outstanding-work|surface-knowledge-base)\.(ts|sh)$/

const isManagedCommand = (command: string): boolean => {
  return MANAGED_HOOK_COMMAND.test(command)
}

const stripManagedEntries = (entries: unknown): unknown[] => {
  if (!Array.isArray(entries)) return []
  return entries.filter((entry) => {
    if (typeof entry !== 'object' || entry === null) return true
    const hooks = (entry as { hooks?: unknown }).hooks
    if (!Array.isArray(hooks)) return true
    return !hooks.some((hook) => {
      if (typeof hook !== 'object' || hook === null) return false
      const command = (hook as { command?: unknown }).command
      return typeof command === 'string' && isManagedCommand(command)
    })
  })
}

export const mergeHooks = (existing: Json, managed: Json): Json => {
  const hooks = (existing.hooks ?? {}) as Json
  const managedHooks = (managed.hooks ?? {}) as Json

  for (const [event, managedEntries] of Object.entries(managedHooks)) {
    const kept = stripManagedEntries(hooks[event])
    hooks[event] = [...kept, ...(managedEntries as unknown[])]
  }

  return { ...existing, hooks, [MARKER_KEY]: MARKER }
}

export const mergeOpenCodePlugin = (config: Json): Json => {
  const plugin = Array.isArray(config.plugin) ? [...config.plugin] : []
  if (!plugin.includes(OPENCODE_PLUGIN_ENTRY))
    plugin.push(OPENCODE_PLUGIN_ENTRY)
  return { ...config, plugin, [MARKER_KEY]: MARKER }
}

export const stripManagedHooks = (existing: Json): Json => {
  const rest = { ...existing }
  delete rest[MARKER_KEY]
  const hooks = rest.hooks as Json | undefined
  if (!hooks) return rest

  for (const [event, entries] of Object.entries(hooks)) {
    const kept = stripManagedEntries(entries)
    if (kept.length > 0) hooks[event] = kept
    else delete hooks[event]
  }

  if (Object.keys(hooks).length === 0) delete rest.hooks
  return rest
}

export const stripOpenCodePlugin = (config: Json): Json => {
  const rest = { ...config }
  delete rest[MARKER_KEY]
  if (Array.isArray(rest.plugin)) {
    rest.plugin = rest.plugin.filter((entry) => entry !== OPENCODE_PLUGIN_ENTRY)
    if ((rest.plugin as unknown[]).length === 0) delete rest.plugin
  }
  return rest
}

export type InstallPlan = {
  actions: string[]
  claudeSettings: Json
  openCodeConfig: Json
}

export const planInstall = async (target: string): Promise<InstallPlan> => {
  const settingsPath = resolve(target, '.claude', 'settings.json')
  const configPath = resolve(target, 'opencode.json')
  const managed = (await readJson(
    resolve(sourceDir, 'settings.tpl.json'),
  )) as Json

  const actions = [
    `copy ${CLAUDE_HOOK_FILES.length} hooks to ${resolve(target, '.claude', 'hooks')}`,
    `merge hooks into ${settingsPath}`,
    `copy opencode plugin to ${resolve(target, OPENCODE_PLUGIN_DEST)}`,
    `register plugin in ${configPath}`,
  ]

  return {
    actions,
    claudeSettings: mergeHooks(await readJson(settingsPath), managed),
    openCodeConfig: mergeOpenCodePlugin(await readJson(configPath)),
  }
}

export const planUninstall = async (target: string): Promise<InstallPlan> => {
  const settingsPath = resolve(target, '.claude', 'settings.json')
  const configPath = resolve(target, 'opencode.json')

  const actions = [
    `remove ${resolve(target, '.claude', 'hooks', '{hook files}')}`,
    `strip managed hooks from ${settingsPath}`,
    `remove ${resolve(target, OPENCODE_PLUGIN_DEST)}`,
    `unregister plugin from ${configPath}`,
  ]

  return {
    actions,
    claudeSettings: stripManagedHooks(await readJson(settingsPath)),
    openCodeConfig: stripOpenCodePlugin(await readJson(configPath)),
  }
}

export const writePlan = async (
  target: string,
  plan: InstallPlan,
  uninstall: boolean,
): Promise<void> => {
  const claudeHooksDir = resolve(target, '.claude', 'hooks')
  const settingsPath = resolve(target, '.claude', 'settings.json')
  const configPath = resolve(target, 'opencode.json')

  if (uninstall) {
    const stale = (
      await readdir(claudeHooksDir).catch(() => [] as string[])
    ).filter((name) => MANAGED_HOOK_FILE.test(name))
    await Promise.all(
      stale.map((name) => rm(resolve(claudeHooksDir, name), { force: true })),
    )
    await removeIfEmptyDir(claudeHooksDir)
    await rm(resolve(target, OPENCODE_PLUGIN_DEST), {
      recursive: true,
      force: true,
    })
    await removeIfEmptyDir(resolve(target, '.opencode', 'plugins'))
    await removeIfEmptyDir(resolve(target, '.opencode'))
  } else {
    await mkdir(claudeHooksDir, { recursive: true })
    const stale = (
      await readdir(claudeHooksDir).catch(() => [] as string[])
    ).filter((name) => MANAGED_HOOK_FILE.test(name))
    await Promise.all(
      stale.map((name) => rm(resolve(claudeHooksDir, name), { force: true })),
    )
    await Promise.all(
      CLAUDE_HOOK_FILES.map((file) =>
        cp(resolve(sourceDir, file), resolve(claudeHooksDir, file)),
      ),
    )
    await mkdir(resolve(target, OPENCODE_PLUGIN_DEST), { recursive: true })
    await copyDir(
      resolve(sourceDir, OPENCODE_SOURCE_DIR),
      resolve(target, OPENCODE_PLUGIN_DEST),
    )
  }

  await writeOrRemove(settingsPath, plan.claudeSettings)
  await writeOrRemove(configPath, plan.openCodeConfig)
}

const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const targetIndex = args.indexOf('--target')
  const target =
    (targetIndex >= 0 && args[targetIndex + 1] !== undefined
      ? args[targetIndex + 1]
      : undefined) ??
    args
      .find((arg) => arg.startsWith('--target='))
      ?.slice('--target='.length) ??
    process.cwd()
  const uninstall = args.includes('--uninstall')
  const dryRun = args.includes('--dry-run')

  if (args.includes('--help')) {
    console.log(
      'Usage: bun scripts/agent-hooks-install.ts [--target <dir>] [--uninstall] [--dry-run]',
    )
    return
  }

  const plan = uninstall
    ? await planUninstall(target)
    : await planInstall(target)

  if (dryRun) {
    console.log(
      `[dry-run] ${uninstall ? 'uninstall' : 'install'} for ${target}`,
    )
    for (const action of plan.actions) console.log(`  would ${action}`)
    return
  }

  await writePlan(target, plan, uninstall)
  console.log(
    `${uninstall ? 'Uninstalled' : 'Installed'} agent hooks in ${target}`,
  )
  for (const action of plan.actions) console.log(`  ${action}`)
}

if (import.meta.main) {
  await main()
}
