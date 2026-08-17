import { buildTwinkleActivities } from '../repo-position'
import type { MaxCtx, RepoLike } from './types'

export const buildRepoActivityById = (
  repos: RepoLike[],
  twinkleCtx: MaxCtx,
): Map<string, number> => {
  const repoTwinkleActivities = buildTwinkleActivities(repos, twinkleCtx)
  const repoActivityById = new Map<string, number>()
  for (let i = 0; i < repos.length; i += 1) {
    const id = repos[i]?.id
    if (id) repoActivityById.set(id, repoTwinkleActivities[i] as number)
  }
  return repoActivityById
}
