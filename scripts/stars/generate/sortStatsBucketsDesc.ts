import type { StatsBucket } from './types'

export const sortStatsBucketsDesc = (
  entries: Array<[string, number]>,
): StatsBucket[] =>
  [...entries]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([name, count]) => ({ name, count }))
