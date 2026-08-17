import type { StarItem } from './types'

export const itemYearKey = (item: Pick<StarItem, 'starredAt'>): string => {
  return (item.starredAt || '').slice(0, 4)
}
