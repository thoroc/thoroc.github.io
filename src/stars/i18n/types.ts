import type { en } from './messages.en'

/** The full set of translation keys, derived from the English pack (the
 * canonical source all other packs translate from). */
export type MessageKey = keyof typeof en

export type MessagePack = Record<MessageKey, string>

export type LocaleRef =
  | string
  | (() => string)
  | { value?: string | null }
  | null
  | undefined

export type Translator = (
  key: MessageKey,
  params?: Record<string, unknown>,
) => string
