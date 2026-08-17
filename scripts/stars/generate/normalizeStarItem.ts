import { normalizeLicense } from './normalizeLicense'
import { normalizeTopics } from './normalizeTopics'
import { repoAnchor } from './repoAnchor'
import type { NormalizedStarItem, RawGithubRepo } from './types'

export const normalizeStarItem = (repo: RawGithubRepo): NormalizedStarItem => {
  const { license, licenseUrl } = normalizeLicense(repo)
  return {
    id: repoAnchor(repo.full_name),
    fullName: repo.full_name,
    description: repo.description || '',
    language: repo.language || null,
    license,
    licenseUrl,
    stars: repo.stargazers_count || 0,
    starredAt: repo.starred_at || '',
    createdAt: repo.created_at || '',
    pushedAt: repo.pushed_at || repo.updated_at || '',
    homepage:
      typeof repo.homepage === 'string' ? repo.homepage.trim() || null : null,
    forksCount: Number(repo.forks_count) || 0,
    watchersCount: Number(repo.subscribers_count ?? repo.watchers_count) || 0,
    topics: normalizeTopics(repo),
    fork: !!repo.fork,
    isTemplate: !!repo.is_template,
  }
}
