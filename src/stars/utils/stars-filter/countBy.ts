import { stableCollator } from '../stable-collator'

export const countBy = <T, K>(
  items: T[],
  keyFn: (item: T) => K,
): Array<{ name: K; count: number }> => {
  const counts = new Map<K, number>()
  for (const item of items) {
    const key = keyFn(item)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || stableCollator(String(a[0]), String(b[0])))
    .map(([name, count]) => ({ name, count }))
}
