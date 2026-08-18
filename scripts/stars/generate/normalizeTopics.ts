import type { RawGithubRepo } from './types'

export const normalizeTopics = (repo: RawGithubRepo): string[] => {
  if (!Array.isArray(repo.topics)) return []
  return repo.topics
    .filter((t) => typeof t === 'string' && t.trim())
    .map((t) => t.trim())
}
