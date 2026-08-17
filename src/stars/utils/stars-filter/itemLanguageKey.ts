import type { StarItem } from './types'

export const itemLanguageKey = (item: Pick<StarItem, 'language'>): string => {
  return item.language || '其他'
}
