import type * as THREE from 'three'
import { currentSample } from './currentSample'
import type {
  CameraView,
  OrbitControls,
  StartOptions,
  TransitionState,
} from './types'

export const startTransition = (
  state: TransitionState,
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  view: CameraView,
  opts: StartOptions = {},
): void => {
  const now = opts.now ?? performance.now()
  state.durationMs = Math.max(80, opts.durationMs ?? 400)
  state.onComplete = opts.onComplete ?? null

  if (state.active) {
    currentSample(state, now, state.fromPos, state.fromTarget)
  } else {
    state.fromPos.copy(camera.position)
    state.fromTarget.copy(controls.target)
  }

  state.toPos.copy(view.position)
  state.toTarget.copy(view.target)
  state.startMs = now
  state.active = true
}
