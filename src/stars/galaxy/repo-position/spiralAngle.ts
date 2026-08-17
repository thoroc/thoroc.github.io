import { GALAXY, R_MAX, R_MIN } from '../constants'
import { gauss3, hashUnit } from '../hash'

/** 连续对数螺旋角 + 场星 */
export const spiralAngle = (
  h: number,
  rr: number,
  a: number,
  b: number,
  c: number,
): number => {
  const t = (rr - R_MIN) / (R_MAX - R_MIN + 1)
  const logSpiral = Math.log1p(t * 3.5) * GALAXY.TWIST
  const phase = hashUnit(h, 6) * Math.PI * 2

  if (hashUnit(h, 18) < GALAXY.FIELD_RATIO) {
    return hashUnit(h, 10) * Math.PI * 2 + gauss3(a, b, c) * 0.18
  }

  const armWobble = Math.sin(logSpiral * 1.6 + phase * 2.1) * 0.08
  return logSpiral + phase + armWobble + gauss3(a, b, c) * GALAXY.ARM_SPREAD
}
