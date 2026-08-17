import type { StarItem } from './types'

export const itemTopicKeys = (item: StarItem): string[] => {
  return (item.topics || []).map((t) => String(t).toLowerCase())
}
