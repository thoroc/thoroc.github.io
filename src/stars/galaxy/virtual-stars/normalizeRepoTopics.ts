import type { RepoLike } from './types'

export const normalizeRepoTopics = (repo: RepoLike): string[] => {
  const raw = Array.isArray(repo?.topics) ? repo.topics : []
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of raw) {
    const name = String(t || '')
      .trim()
      .toLowerCase()
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}
