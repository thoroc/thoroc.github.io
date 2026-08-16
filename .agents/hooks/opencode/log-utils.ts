export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

const MAX_FIELD_LEN = 4000

export const truncate = (value: JsonValue): JsonValue => {
  if (typeof value === 'string' && value.length > MAX_FIELD_LEN) {
    const clipped = value.length - MAX_FIELD_LEN
    return `${value.slice(0, MAX_FIELD_LEN)}...<truncated ${clipped} chars>`
  }
  if (Array.isArray(value)) return value.map(truncate)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, truncate(v)]),
    )
  }
  return value
}

const pad = (n: number): string => String(n).padStart(2, '0')

export const toLocalIso = (date: Date): string => {
  const offsetMin = -date.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const offH = pad(Math.floor(Math.abs(offsetMin) / 60))
  const offM = pad(Math.abs(offsetMin) % 60)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${offH}:${offM}`
}

export const localDateStamp = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
