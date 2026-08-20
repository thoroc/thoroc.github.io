import { normalizeUiLocale } from '../../i18n'
import { writeUiPrefs } from './writeUiPrefs'

export const writeStoredUiLocale = (locale: string): void => {
  writeUiPrefs({ uiLocale: normalizeUiLocale(locale) })
}
