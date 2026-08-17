import { PAGE_TITLE_CACHE_KEY } from './state'

export const cachePageTitle = (title: string): void => {
  if (!title) return
  try {
    sessionStorage.setItem(PAGE_TITLE_CACHE_KEY, title)
  } catch {
    /* ignore */
  }
}
