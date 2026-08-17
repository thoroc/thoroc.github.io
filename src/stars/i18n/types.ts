export type MessagePack = Record<string, string>

export type LocaleRef =
  | string
  | (() => string)
  | { value?: string | null }
  | null
  | undefined

export type Translator = (
  key: string,
  params?: Record<string, unknown>,
) => string
