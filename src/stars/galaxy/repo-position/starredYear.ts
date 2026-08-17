import { STAR_YEAR_MAX, STAR_YEAR_MIN } from '../constants'

export const starredYear = (starredAt: string | undefined): number => {
  const y = Number.parseInt(String(starredAt || '').slice(0, 4), 10)
  if (!Number.isFinite(y)) return STAR_YEAR_MAX
  return Math.min(STAR_YEAR_MAX, Math.max(STAR_YEAR_MIN, y))
}
