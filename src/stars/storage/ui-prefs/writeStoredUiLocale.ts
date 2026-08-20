import { writeUiPrefs } from './writeUiPrefs'

export const writeStoredUiLocale = (locale: string): void => {
  const next = locale === 'en' ? 'en' : 'fr'
  writeUiPrefs({ uiLocale: next })
}
