import { rotateGalaxyLocal } from '../galaxy-field'
import { hashUnit } from '../hash'
import { pickGasClump } from './pickGasClump'
import { sampleEllipsoidVolume } from './sampleEllipsoidVolume'
import type { GasClumpField, GasDustParticle } from './types'

/** 暗尘采样：偏向 clump 中心高密度区 */
export const sampleGasDustParticle = (
  h: number,
  field: GasClumpField,
): GasDustParticle => {
  const cl = pickGasClump(h, field)
  const tier = hashUnit(h, 1) * 0.42
  const shrink = 0.52 + hashUnit(h, 2) * 0.22
  const ell = sampleEllipsoidVolume(
    h,
    cl.rx * shrink,
    cl.ry * shrink,
    cl.rz * shrink,
    tier,
  )
  const [rx, ry, rz] = rotateGalaxyLocal(
    cl.cx + ell.lx,
    cl.cy + ell.ly,
    cl.cz + ell.lz,
    cl.tiltX,
    cl.tiltZ,
    cl.tiltY ?? 0,
  ) as [number, number, number]
  return {
    lx: rx,
    ly: ry,
    lz: rz,
    density: 0.48 + ell.density * 0.52,
  }
}
