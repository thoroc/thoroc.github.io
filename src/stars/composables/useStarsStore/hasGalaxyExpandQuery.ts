export const hasGalaxyExpandQuery = (): boolean => {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('stars-galaxy-expand')
}
