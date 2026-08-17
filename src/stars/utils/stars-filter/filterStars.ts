import { filterAndSortStars } from './filterAndSortStars'
import type { FilterOptions, StarItem } from './types'

/** 筛选（排序不改变条数，sort 仅用于保持接口一致） */
export const filterStars = (
  items: StarItem[],
  opts: FilterOptions,
): StarItem[] => {
  return filterAndSortStars(items, { ...opts, sort: 'recently_starred' })
}
