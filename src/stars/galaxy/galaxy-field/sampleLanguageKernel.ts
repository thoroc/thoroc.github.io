import { rotateGalaxyLocal } from './rotateGalaxyLocal'
import { sampleGalaxyLocal } from './sampleGalaxyLocal'
import type { GalaxyKernel } from './types'

/** 在语言高斯核内采样（取向随核 frame 旋转） */
export const sampleLanguageKernel = (
  h: number,
  kernel: GalaxyKernel,
): [number, number, number] => {
  const { cx, cy, cz, sigma, frame, lang } = kernel
  const [lx, ly, lz] = sampleGalaxyLocal(h, lang, sigma)
  const [rx, ry, rz] = rotateGalaxyLocal(
    lx,
    ly,
    lz,
    frame.tiltX,
    frame.tiltZ,
    frame.tiltY,
  )
  return [cx + rx, cy + ry, cz + rz]
}
