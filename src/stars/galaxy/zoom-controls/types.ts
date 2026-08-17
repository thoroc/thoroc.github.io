import type { Vector3 } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type { OrbitControls }

export interface CameraView {
  position: Vector3
  target: Vector3
}

export interface DollyOffsetAndDistance {
  offset: Vector3
  distance: number
  newDistance: number
}

export interface DollyOptions {
  zoomToCursor?: boolean
  ndc?: { x: number; y: number }
}

export interface FitToPointsOptions {
  padding?: number
  viewDir?: Vector3
  tiltX?: number
}

export interface FitToBoxOptions {
  padding?: number
  viewDir?: Vector3
}

export interface FocusCameraOptions {
  span?: number
  padding?: number
  maxDistance?: number
  aSize?: number
  bright?: number
  pixelRatio?: number
}

export interface FitInsideObserverOptions {
  padding?: number
  defaultDistanceMult?: number
  viewDir?: Vector3 | [number, number, number]
}

export interface TrackballControls {
  target: Vector3
  update?: () => void
}
