export const mapLegacySort = (legacy: string): string => {
  if (legacy === 'stars') return 'most_stars'
  if (legacy === 'date') return 'recently_starred'
  if (legacy === 'recently_active' || legacy === 'most_stars') return legacy
  return 'recently_starred'
}
