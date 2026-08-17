import { cancelTransition } from './cancelTransition'
import { createTransitionState } from './createTransitionState'
import { startTransition } from './startTransition'
import { tickTransition } from './tickTransition'
import type { CameraTransition } from './types'

/** 可中断、可重定向的相机 position + target 缓动 */
export const createCameraTransition = (): CameraTransition => {
  const state = createTransitionState()

  return {
    get active() {
      return state.active
    },
    cancel: () => cancelTransition(state),
    start: (controls, camera, view, opts) =>
      startTransition(state, controls, camera, view, opts),
    tick: (now, controls, camera) =>
      tickTransition(state, now, controls, camera),
  }
}
