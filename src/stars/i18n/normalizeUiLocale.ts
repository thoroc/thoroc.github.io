export const normalizeUiLocale = (value: unknown): string => {
  return value === 'en' ? 'en' : 'fr'
}
