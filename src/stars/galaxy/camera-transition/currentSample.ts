import type * as THREE from 'three'
import { sample } from './sample'
import type { TransitionState } from './types'

export const currentSample = (
  state: TransitionState,
  now: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3,
): boolean => {
  if (!state.active) return false
  const t = Math.min(1, (now - state.startMs) / state.durationMs)
  sample(state, t, outPos, outTarget)
  return true
}
