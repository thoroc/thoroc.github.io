import type { TransitionState } from './types'

export const cancelTransition = (state: TransitionState): void => {
  state.active = false
  state.onComplete = null
}
