import { normalizeUiLocale } from './normalizeUiLocale'

export const resolveUiLocale = (search = '', fallback = 'en'): string => {
  const params = new URLSearchParams(search)
  if (params.has('lang')) {
    return normalizeUiLocale(params.get('lang'))
  }
  return normalizeUiLocale(fallback)
}
