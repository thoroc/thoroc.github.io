import type * as THREE from 'three'

export interface PointerPoint {
  x: number
  y: number
}

export interface PointerDownState {
  x: number
  y: number
  pointerId: number
  button: number
}

export interface PickViewSnapshot {
  motionSec: number
  camPos: THREE.Vector3
  target: THREE.Vector3
}

/**
 * Gesture/interaction state, shared by reference with useGalaxyCamera (whose
 * applyCameraAutoRotate reads orbitGestureActive/pinchActive/pointerDown
 * directly, and whose suspendGalaxyMotion/syncAutoRotateAfterInteraction
 * mutate/read it) and with useGalaxyScene (whose TrackballControls
 * start/end listeners set orbitGestureActive directly, matching the
 * original file's behavior exactly).
 */
export interface GalaxyInteractionState {
  pointerDown: PointerDownState | null
  pointerDragMoved: boolean
  orbitGestureActive: boolean
  activePointers: Map<number, PointerPoint>
  pinchActive: boolean
  lastPinchDistance: number | null
  middleDragLastY: number | null
  orbitDragLastX: number | null
  orbitDragLastY: number | null
  wheelDeltaAccum: number
  pointerPickIdx: number | null
  pointerPickView: PickViewSnapshot | null
  hoverRaf: number
  pendingHover: PointerPoint | null
}

export const createGalaxyInteractionState = (): GalaxyInteractionState => ({
  pointerDown: null,
  pointerDragMoved: false,
  orbitGestureActive: false,
  activePointers: new Map(),
  pinchActive: false,
  lastPinchDistance: null,
  middleDragLastY: null,
  orbitDragLastX: null,
  orbitDragLastY: null,
  wheelDeltaAccum: 0,
  pointerPickIdx: null,
  pointerPickView: null,
  hoverRaf: 0,
  pendingHover: null,
})

export const DRAG_THRESHOLD_SQ = 100
