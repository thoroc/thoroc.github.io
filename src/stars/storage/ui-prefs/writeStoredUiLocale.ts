import { writeUiPrefs } from './writeUiPrefs'

export const writeStoredUiLocale = (locale: string): void => {
  const next = locale === 'en' ? 'en' : 'zh-CN'
  writeUiPrefs({ uiLocale: next })
}
