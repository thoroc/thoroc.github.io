export const hasStarsFilterQuery = (): boolean => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return [
    'stars-q',
    'stars-lang',
    'stars-license',
    'stars-year',
    'stars-type',
    'stars-sort',
  ].some((key) => params.has(key))
}
