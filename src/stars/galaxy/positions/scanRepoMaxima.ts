import type { MaxCtx, RepoLike } from './types'

export const scanRepoMaxima = (repos: RepoLike[]): MaxCtx => {
  let maxStars = 1
  let maxForks = 1
  let maxWatchers = 1
  for (const item of repos) {
    maxStars = Math.max(maxStars, Number(item.stars) || 0)
    maxForks = Math.max(maxForks, Number(item.forksCount) || 0)
    maxWatchers = Math.max(maxWatchers, Number(item.watchersCount) || 0)
  }
  return { maxStars, maxForks, maxWatchers }
}
