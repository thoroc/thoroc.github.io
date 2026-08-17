import { normalizeRepoTopics } from './normalizeRepoTopics'
import type { RepoLike, VirtualStar } from './types'

/** 一仓多星：每个 topic 一颗；无 topic 时一颗占位星 */
export const expandReposToVirtualStars = (
  repos: RepoLike[] | null | undefined,
): VirtualStar[] => {
  const list = repos || []
  const out: VirtualStar[] = []
  for (const item of list) {
    const repoId = String(item?.id || item?.fullName || '')
    if (!repoId) continue
    const language = item.language || '其他'
    const topics = normalizeRepoTopics(item)
    if (!topics.length) {
      out.push({
        repoId,
        item,
        language,
        topic: null,
        virtualKey: `${repoId}\0`,
      })
      continue
    }
    for (const topic of topics) {
      out.push({
        repoId,
        item,
        language,
        topic,
        virtualKey: `${repoId}\0${topic}`,
      })
    }
  }
  return out
}
