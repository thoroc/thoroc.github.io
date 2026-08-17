import { R_MAX, R_MIN, STAR_YEAR_MAX, STAR_YEAR_MIN } from '../constants'
import { starredYear } from './starredYear'

export const radialFromStarYear = (starredAt: string | undefined): number => {
  const year = starredYear(starredAt)
  const span = STAR_YEAR_MAX - STAR_YEAR_MIN + 1
  const norm = (year - STAR_YEAR_MIN) / span
  return R_MIN + (R_MAX - R_MIN) * (0.22 + norm * 0.48)
}
