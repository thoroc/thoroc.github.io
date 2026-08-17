import type * as THREE from 'three'
import type { CameraView, OrbitControls } from '../zoom-controls'

export type { CameraView, OrbitControls }

export interface TransitionState {
  active: boolean
  startMs: number
  durationMs: number
  onComplete: (() => void) | null
  fromPos: THREE.Vector3
  fromTarget: THREE.Vector3
  toPos: THREE.Vector3
  toTarget: THREE.Vector3
}

export interface StartOptions {
  durationMs?: number
  now?: number
  onComplete?: () => void
}

export interface CameraTransition {
  readonly active: boolean
  cancel: () => void
  start: (
    controls: OrbitControls,
    camera: THREE.PerspectiveCamera,
    view: CameraView,
    opts?: StartOptions,
  ) => void
  tick: (
    now: number,
    controls: OrbitControls,
    camera: THREE.PerspectiveCamera,
  ) => boolean
}
