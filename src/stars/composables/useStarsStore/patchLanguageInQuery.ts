import { patchQueryParam } from './patchQueryParam'
import { language } from './state'

export const patchLanguageInQuery = (
  langValue: string | null | undefined,
): void => {
  language.value = !langValue || langValue === 'all' ? 'all' : langValue
  patchQueryParam('stars-lang', language)
}
