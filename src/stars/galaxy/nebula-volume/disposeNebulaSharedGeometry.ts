import { nebulaVolumeState } from './state'

export const disposeNebulaSharedGeometry = (): void => {
  if (nebulaVolumeState.boxGeometry) {
    nebulaVolumeState.boxGeometry.dispose()
    nebulaVolumeState.boxGeometry = null
  }
  if (nebulaVolumeState.material) {
    nebulaVolumeState.material.dispose()
    nebulaVolumeState.material = null
  }
}
