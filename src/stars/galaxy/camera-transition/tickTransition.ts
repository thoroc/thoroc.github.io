import type * as THREE from 'three'
import { sample } from './sample'
import type { OrbitControls, TransitionState } from './types'

export const tickTransition = (
  state: TransitionState,
  now: number,
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
): boolean => {
  if (!state.active) return false
  const t = Math.min(1, (now - state.startMs) / state.durationMs)
  sample(state, t, camera.position, controls.target)
  controls.update()
  if (t >= 1) {
    camera.position.copy(state.toPos)
    controls.target.copy(state.toTarget)
    controls.update()
    state.active = false
    const cb = state.onComplete
    state.onComplete = null
    cb?.()
    return false
  }
  return true
}
