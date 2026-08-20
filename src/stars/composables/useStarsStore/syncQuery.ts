import { currentPathname } from './currentPathname'
import {
  galaxyAreaExpanded,
  galaxyFocus,
  language,
  license,
  qApplied,
  sort,
  starredYear,
  type,
  uiLocale,
  viewMode,
} from './state'

export const syncQuery = (): void => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  if (uiLocale.value === 'fr') params.set('lang', 'fr')
  if (qApplied.value.trim()) params.set('stars-q', qApplied.value.trim())
  if (language.value !== 'all') params.set('stars-lang', language.value)
  if (license.value !== 'all') params.set('stars-license', license.value)
  if (starredYear.value !== 'all') params.set('stars-year', starredYear.value)
  if (type.value !== 'all') params.set('stars-type', type.value)
  if (sort.value !== 'recently_starred') params.set('stars-sort', sort.value)
  if (viewMode.value === 'galaxy') params.set('stars-view', 'galaxy')
  else params.delete('stars-view')
  if (galaxyFocus.value) params.set('stars-focus', galaxyFocus.value)
  else params.delete('stars-focus')
  if (viewMode.value === 'galaxy' && galaxyAreaExpanded.value) {
    params.set('stars-galaxy-expand', '1')
  } else {
    params.delete('stars-galaxy-expand')
  }
  const qs = params.toString()
  const path = currentPathname()
  window.history.replaceState({}, '', `${path}${qs ? `?${qs}` : ''}`)
}
