import { messages } from './messages'
import type { LocaleRef, Translator } from './types'

export const createTranslator = (localeRef: LocaleRef): Translator => {
  return (key, params = {}) => {
    const locale =
      typeof localeRef === 'function'
        ? localeRef()
        : ((localeRef as { value?: string | null })?.value ?? localeRef)
    const pack =
      messages[locale as string] ||
      (messages['zh-CN'] as Record<string, string>)
    let text =
      pack[key] ?? (messages['zh-CN'] as Record<string, string>)[key] ?? key
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
    return text
  }
}
