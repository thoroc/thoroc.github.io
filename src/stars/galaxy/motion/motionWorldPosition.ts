import { applyHierarchicalMotion } from './applyHierarchicalMotion'
import type { MotionFields, Vec3 } from './types'

export const motionWorldPosition = (
  rx: number,
  ry: number,
  rz: number,
  fields: MotionFields,
  i: number,
  time: number,
): Vec3 => applyHierarchicalMotion(rx, ry, rz, fields, i, time)
