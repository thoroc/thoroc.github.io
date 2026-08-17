export const hasUiLocaleQuery = (): boolean => {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('lang')
}
