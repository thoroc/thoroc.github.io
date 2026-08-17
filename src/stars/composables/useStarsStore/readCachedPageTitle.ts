import { PAGE_TITLE_CACHE_KEY } from './state'

export const readCachedPageTitle = (): string => {
  try {
    const cached = sessionStorage.getItem(PAGE_TITLE_CACHE_KEY)
    if (typeof cached !== 'string') return ''
    return cached.trim()
  } catch {
    return ''
  }
}
