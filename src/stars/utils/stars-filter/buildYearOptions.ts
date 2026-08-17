import type { StarItem, YearOption } from './types'

export const buildYearOptions = (
  items: Array<Pick<StarItem, 'starredAt'>>,
): YearOption[] => {
  const counts = new Map<string, number>()
  for (const item of items) {
    const y = (item.starredAt || '').slice(0, 4)
    if (!y) continue
    counts.set(y, (counts.get(y) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, count]) => ({ year, count }))
}
