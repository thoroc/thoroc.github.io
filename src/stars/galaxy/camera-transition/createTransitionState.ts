import * as THREE from 'three'
import type { TransitionState } from './types'

export const createTransitionState = (): TransitionState => ({
  active: false,
  startMs: 0,
  durationMs: 400,
  onComplete: null,
  fromPos: new THREE.Vector3(),
  fromTarget: new THREE.Vector3(),
  toPos: new THREE.Vector3(),
  toTarget: new THREE.Vector3(),
})
