import { watch } from 'vue'
import { persistSession } from './persistSession'
import { scheduleDebouncedSearch } from './scheduleDebouncedSearch'
import { scrollListToTop } from './scrollListToTop'
import { language, license, qInput, sort, starredYear, type } from './state'
import { syncQuery } from './syncQuery'

/** Module-scope reactive watchers, registered exactly once the first time
 * this module is imported — ES modules only evaluate once, so this matches
 * the original file's top-level watch() calls exactly. Import this module
 * only for its side effect (`import './watchers'`); do not wrap this in a
 * function callers invoke, or every useStarsStore() call would register a
 * fresh set of watchers instead of sharing the module singleton's. */
watch(qInput, () => {
  scheduleDebouncedSearch()
})

watch([type, sort, license, starredYear], () => {
  persistSession()
  syncQuery()
  scrollListToTop()
})

watch(language, () => {
  persistSession()
  syncQuery()
  scrollListToTop()
})
