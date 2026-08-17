import { R_MAX, R_MIN } from '../constants'

export const radialFromRepoStars = (
  stars: number | undefined,
  maxStars: number,
): number => {
  const norm =
    Math.log1p(Number(stars) || 0) / Math.log1p(Math.max(maxStars, 1))
  return R_MIN + (R_MAX - R_MIN) * (0.26 + norm * 0.52)
}
