import { messages } from './messages'
import { en } from './messages.en'
import type { LocaleRef, MessagePack, Translator } from './types'

export const createTranslator = (localeRef: LocaleRef): Translator => {
  return (key, params = {}) => {
    const locale =
      typeof localeRef === 'function'
        ? localeRef()
        : ((localeRef as { value?: string | null })?.value ?? localeRef)
    const pack: MessagePack = messages[locale as string] || en
    let text = pack[key] ?? en[key] ?? key
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
    return text
  }
}
