import type * as THREE from 'three'
import type { MotionFields } from '../motion'

export interface PickOptions {
  camera: THREE.PerspectiveCamera
  points: THREE.Points
  restPositions: Float32Array
  starCount: number
  clientX: number
  clientY: number
  canvasRect: DOMRect
  sizes?: Float32Array | null
  brights?: Float32Array | null
  pixelRatio?: number
  motionFields?: MotionFields | null
  motionTimeSec?: number
}

export interface PickContext {
  camera: THREE.PerspectiveCamera
  matrix: THREE.Matrix4
  restPositions: Float32Array
  motionFields: MotionFields | null
  motionTimeSec: number
  w: number
  h: number
  clickX: number
  clickY: number
  sizes: Float32Array | null
  brights: Float32Array | null
  pixelRatio: number
}
