import type { RepoLike, StarTierBucket } from './types'

export const buildStarTierLegend = (
  items: Pick<RepoLike, 'stars'>[] | null | undefined,
): StarTierBucket[] => {
  const tiers: StarTierBucket[] = [
    { key: '50k+', min: 50000, count: 0 },
    { key: '10k+', min: 10000, count: 0 },
    { key: '1k+', min: 1000, count: 0 },
    { key: '<1k', min: 0, count: 0 },
  ]
  for (const item of items || []) {
    const s = Number(item.stars) || 0
    if (s >= 50000) (tiers[0] as StarTierBucket).count += 1
    else if (s >= 10000) (tiers[1] as StarTierBucket).count += 1
    else if (s >= 1000) (tiers[2] as StarTierBucket).count += 1
    else (tiers[3] as StarTierBucket).count += 1
  }
  return tiers.filter((tier) => tier.count > 0)
}
