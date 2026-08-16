import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Hooks } from '@opencode-ai/plugin'

const KB_REL = 'docs/knowledge-base-index.ndjson'
const DEFAULT_QMD_COLLECTION = 'project-kb'

type KnowledgeLine = { domain?: unknown }

export const buildKnowledgeMessage = (
  lines: string[],
  qmdCollection: string,
): string | undefined => {
  const entries = lines
    .map((line): KnowledgeLine | undefined => {
      try {
        return JSON.parse(line) as KnowledgeLine
      } catch {
        return undefined
      }
    })
    .filter((entry): entry is KnowledgeLine => entry !== undefined)

  if (entries.length === 0) return undefined

  const counts = new Map<string, number>()
  for (const entry of entries) {
    const domain = typeof entry.domain === 'string' ? entry.domain : 'unknown'
    counts.set(domain, (counts.get(domain) ?? 0) + 1)
  }
  const domains = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([domain, count]) => `${domain} (${count})`)
    .join(', ')

  return [
    `## Knowledge base (${KB_REL})`,
    '',
    `${entries.length} articles across domains: ${domains}.`,
    '',
    `Before concluding no prior pattern, decision, or automation exists for a task, search it: \`qmd query\` (collection \`${qmdCollection}\`) or check the index file directly — a negative result in an external repo is not evidence there is nothing here.`,
  ].join('\n')
}

export const surfaceKnowledgeHook = (ctx: {
  directory: string
  qmdCollection?: string
}): NonNullable<Hooks['experimental.chat.system.transform']> => {
  const qmdCollection = ctx.qmdCollection ?? DEFAULT_QMD_COLLECTION
  return async (_input, output) => {
    try {
      const raw = await readFile(join(ctx.directory, KB_REL), 'utf8')
      const lines = raw.split('\n').filter((line) => line.trim().length > 0)
      const message = buildKnowledgeMessage(lines, qmdCollection)
      if (message) output.system.push(message)
    } catch {
      // no knowledge-base index in this project — nothing to surface
    }
  }
}
