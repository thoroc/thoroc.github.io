import type { Ref } from 'vue'
import { currentPathname } from './currentPathname'
import { persistSession } from './persistSession'
import { scrollListToTop } from './scrollListToTop'

export const patchQueryParam = (
  key: string,
  valueRef: Ref<string>,
  allValue = 'all',
): void => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)

  if (!valueRef.value || valueRef.value === allValue) {
    params.delete(key)
    valueRef.value = allValue
  } else {
    params.set(key, valueRef.value)
  }

  const qs = params.toString()
  const path = currentPathname()
  window.history.pushState({}, '', `${path}${qs ? `?${qs}` : ''}`)
  persistSession()
  scrollListToTop()
}
