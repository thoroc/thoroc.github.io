import type { LegendEntry, RepoLike } from './types'

export const buildLanguageLegend = (
  items: RepoLike[] | null | undefined,
  topN = 10,
): LegendEntry[] => {
  const counts = new Map<string, number>()
  for (const item of items || []) {
    const key = item.language || '其他'
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()]
    .sort(
      (a, b) =>
        b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'zh-CN'),
    )
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }))
}
