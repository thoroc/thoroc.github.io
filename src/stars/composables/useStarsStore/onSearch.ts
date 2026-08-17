import { persistSession } from './persistSession'
import { scrollListToTop } from './scrollListToTop'
import { qApplied, qInput } from './state'
import { syncQuery } from './syncQuery'

export const onSearch = (): void => {
  qApplied.value = qInput.value
  persistSession()
  syncQuery()
  scrollListToTop()
}
