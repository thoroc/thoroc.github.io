import { normalizeUiLocale } from '../../i18n'
import { writeStoredUiLocale } from '../../storage/ui-prefs'
import { currentPathname } from './currentPathname'
import { persistSession } from './persistSession'
import { uiLocale } from './state'

export const setUiLocale = (locale: string): void => {
  if (typeof window === 'undefined') return
  const next = normalizeUiLocale(locale)
  uiLocale.value = next
  const params = new URLSearchParams(window.location.search)
  if (next === 'fr') params.set('lang', 'fr')
  else params.delete('lang')
  const qs = params.toString()
  const path = currentPathname()
  window.history.replaceState({}, '', `${path}${qs ? `?${qs}` : ''}`)
  writeStoredUiLocale(next)
  persistSession()
}
