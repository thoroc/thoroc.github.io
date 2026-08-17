export const repoStarTierKey = (
  stars: number | string | null | undefined,
): string => {
  const s = Number(stars) || 0
  if (s >= 50000) return '50k+'
  if (s >= 10000) return '10k+'
  if (s >= 1000) return '1k+'
  return '<1k'
}
