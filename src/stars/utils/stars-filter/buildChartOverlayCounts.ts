import { filterStars } from './filterStars'
import type { ChartDimension, FilterOptions, StarItem } from './types'

/** 图表叠加：在排除本维度筛选的前提下，统计各分类在当前其它筛选下的数量 */
export const buildChartOverlayCounts = (
  items: StarItem[],
  state: FilterOptions,
  dimension: ChartDimension,
  keys: string[],
  keyFn: (item: StarItem) => string,
): Map<string, number> => {
  const relaxed: FilterOptions = { ...state, sort: 'recently_starred' }
  if (dimension === 'language') relaxed.language = 'all'
  else if (dimension === 'license') relaxed.license = 'all'
  else if (dimension === 'starredYear') relaxed.starredYear = 'all'

  const pool = filterStars(items, relaxed)
  const map = new Map<string, number>(keys.map((k) => [k, 0]))
  for (const item of pool) {
    const k = keyFn(item)
    if (map.has(k)) map.set(k, (map.get(k) as number) + 1)
  }
  return map
}
