import * as THREE from 'three'
import { nebulaVolumeState } from './state'

/** 共享盒体几何（局部空间 -0.5..0.5，由 scale 拉成椭球） */
export const getNebulaBoxGeometry = (): THREE.BoxGeometry => {
  if (!nebulaVolumeState.boxGeometry) {
    nebulaVolumeState.boxGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1)
  }
  return nebulaVolumeState.boxGeometry
}
