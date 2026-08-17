import { LANG_COLORS } from './constants'

export const langColor = (name: string | null | undefined): string => {
  if (!name || name === 'all') return '#8b949e'
  return LANG_COLORS[name] || '#6e7681'
}
