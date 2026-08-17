import type * as THREE from 'three'
import { easeInOutCubic } from './easeInOutCubic'
import type { TransitionState } from './types'

export const sample = (
  state: TransitionState,
  t: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3,
): void => {
  const e = easeInOutCubic(t)
  outPos.lerpVectors(state.fromPos, state.toPos, e)
  outTarget.lerpVectors(state.fromTarget, state.toTarget, e)
}
