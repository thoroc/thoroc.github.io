import { rotateGalaxyLocal } from '../galaxy-field'
import { hashUnit } from '../hash'
import { pickGasClump } from './pickGasClump'
import { sampleEllipsoidVolume } from './sampleEllipsoidVolume'
import { sampleFilamentParticle } from './sampleFilamentParticle'
import type { GasCloudParticle, GasClumpField } from './types'

/** 单粒气体云：丝状链 + 椭球体混合采样 */
export const sampleGasCloudParticle = (
  h: number,
  field: GasClumpField,
): GasCloudParticle => {
  const cl = pickGasClump(h, field)
  const useFilament = !cl.pillar && hashUnit(h, 0) < 0.52

  let local: { lx: number; ly: number; lz: number; density: number }
  let stretch: number
  if (useFilament) {
    const filament = sampleFilamentParticle(h, cl)
    local = filament
    stretch = filament.stretch
  } else {
    const tier = hashUnit(h, 1)
    const ell = sampleEllipsoidVolume(h, cl.rx, cl.ry, cl.rz, tier, !!cl.pillar)
    local = {
      lx: cl.cx + ell.lx,
      ly: cl.cy + ell.ly,
      lz: cl.cz + ell.lz,
      density: ell.density * (cl.pillar ? 1.08 : 1.0),
    }
    stretch = cl.pillar
      ? 0.08 + hashUnit(h, 13) * 0.12
      : 0.12 + hashUnit(h, 13) * 0.28
  }

  const [rx, ry, rz] = rotateGalaxyLocal(
    local.lx,
    local.ly,
    local.lz,
    cl.tiltX,
    cl.tiltZ,
    cl.tiltY ?? 0,
  ) as [number, number, number]
  return {
    lx: rx,
    ly: ry,
    lz: rz,
    density: local.density,
    stretch,
  }
}
