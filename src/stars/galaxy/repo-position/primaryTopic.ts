import type { RepoLike } from './types'

export const primaryTopic = (item: Pick<RepoLike, 'topics'>): string => {
  const topics = Array.isArray(item?.topics) ? item.topics : []
  if (!topics.length) return ''
  return String(topics[0]).toLowerCase()
}
