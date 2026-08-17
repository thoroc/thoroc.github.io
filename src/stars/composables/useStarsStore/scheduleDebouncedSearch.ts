import { persistSession } from './persistSession'
import { scrollListToTop } from './scrollListToTop'
import { debounceState, qApplied, qInput, searchConfig } from './state'
import { syncQuery } from './syncQuery'

export const scheduleDebouncedSearch = (): void => {
  clearTimeout(debounceState.timer)
  debounceState.timer = setTimeout(() => {
    qApplied.value = qInput.value
    persistSession()
    syncQuery()
    scrollListToTop()
  }, searchConfig.debounceMs)
}
