import { persistSession } from './persistSession'
import { scrollListToTop } from './scrollListToTop'
import { qApplied, qInput, type } from './state'
import { syncQuery } from './syncQuery'

export const clearFilterKey = (key: string): void => {
  if (key === 'type') {
    type.value = 'all'
  }
  if (key === 'q') {
    qInput.value = ''
    qApplied.value = ''
  }
  persistSession()
  syncQuery()
  scrollListToTop()
}
