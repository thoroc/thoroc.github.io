import { GALAXY } from '../constants'
import { gauss3, hashSeed } from '../hash'

export interface VolumeOffsetParams {
  ySeed: [number, number, number]
  rSeed: [number, number, number]
}

/** 在盘坐标基础上叠加 3D 椭球散布 */
export const volumeOffset = (
  h: number,
  { ySeed, rSeed }: VolumeOffsetParams,
): [number, number, number] => {
  const [ya, yb, yc] = ySeed
  const [ra, rb, rc] = rSeed
  const vx = gauss3(hashSeed(h, 'vx1'), hashSeed(h, 'vx2'), hashSeed(h, 'vx3'))
  const vy = gauss3(ya, yb, yc)
  const vz = gauss3(ra, rb, rc)
  return [
    vx * GALAXY.VOLUME_SPREAD_XZ,
    vy * GALAXY.VOLUME_SPREAD_Y,
    vz * GALAXY.VOLUME_SPREAD_XZ,
  ]
}
