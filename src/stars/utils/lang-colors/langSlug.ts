export const langSlug = (name: string | null | undefined): string => {
  return (name || 'other')
    .replace(/\+/g, 'plus')
    .replace(/\s+/g, '-')
    .toLowerCase()
}
