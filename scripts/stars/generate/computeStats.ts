import { sortStatsBucketsDesc } from './sortStatsBucketsDesc'
import type { NormalizedStarItem, StarBucket, StatsPayload } from './types'

export const computeStats = (items: NormalizedStarItem[]): StatsPayload => {
  const lang = new Map<string, number>()
  const lic = new Map<string, number>()
  const years = new Map<string, number>()
  const starBuckets = { under1k: 0, from1k: 0, from10k: 0, from50k: 0 }
  let forks = 0
  let templates = 0
  let withLicense = 0

  for (const it of items) {
    const langKey = it.language || 'Other'
    lang.set(langKey, (lang.get(langKey) || 0) + 1)
    if (it.license) {
      lic.set(it.license, (lic.get(it.license) || 0) + 1)
      withLicense += 1
    }
    const y = (it.starredAt || '').slice(0, 4)
    if (y) years.set(y, (years.get(y) || 0) + 1)
    if (it.fork) forks += 1
    if (it.isTemplate) templates += 1
    const s = it.stars || 0
    if (s < 1000) starBuckets.under1k += 1
    else if (s < 10000) starBuckets.from1k += 1
    else if (s < 50000) starBuckets.from10k += 1
    else starBuckets.from50k += 1
  }

  const starredByYear = [...years.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }))

  const buckets: StarBucket[] = [
    { key: 'under1k', count: starBuckets.under1k },
    { key: 'from1k', count: starBuckets.from1k },
    { key: 'from10k', count: starBuckets.from10k },
    { key: 'from50k', count: starBuckets.from50k },
  ]

  return {
    totals: {
      total: items.length,
      languages: lang.size,
      licenses: lic.size,
      withLicense,
      forks,
      templates,
    },
    topLanguages: sortStatsBucketsDesc([...lang.entries()]).slice(0, 5),
    topLicenses: sortStatsBucketsDesc([...lic.entries()]).slice(0, 5),
    licenses: sortStatsBucketsDesc([...lic.entries()]),
    starredByYear,
    starBuckets: buckets,
  }
}
