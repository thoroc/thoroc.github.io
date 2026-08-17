import { readUiPrefs } from './readUiPrefs'

export const readStoredUiLocale = (): string => {
  const locale = readUiPrefs().uiLocale
  return locale === 'en' || locale === 'zh-CN' ? locale : ''
}
