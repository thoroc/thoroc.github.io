import { COSMIC_UNIVERSE } from '../constants'
import { gauss3, hashSeed, hashStr, hashUnit } from '../hash'
import { openClusterSpread } from './openClusterSpread'
import type { TopicClusterCenter, Vec3, VirtualStarLike } from './types'

/** 开放星团成员：三维高斯弥散 + 丝状扰动，锚定所属仓 */
export const placeOpenClusterStar = (
  v: VirtualStarLike,
  repoAnchor: Vec3,
  clusterCenter: TopicClusterCenter,
  repoCount: number,
  positions: Float32Array,
  i: number,
  sf: number,
): void => {
  const h = hashStr(v.virtualKey)
  const { CLUSTER_WISP } = COSMIC_UNIVERSE
  const spread = openClusterSpread(repoCount, sf)
  const [rax, ray, raz] = repoAnchor
  const blend = 0.62
  const ax = clusterCenter[0] * (1 - blend) + rax * blend
  const ay = clusterCenter[1] * (1 - blend) + ray * blend
  const az = clusterCenter[2] * (1 - blend) + raz * blend

  let px =
    ax +
    gauss3(hashSeed(h, 'nx1'), hashSeed(h, 'nx2'), hashSeed(h, 'nx3')) * spread
  let py =
    ay +
    gauss3(hashSeed(h, 'ny1'), hashSeed(h, 'ny2'), hashSeed(h, 'ny3')) *
      spread *
      0.62
  let pz =
    az +
    gauss3(hashSeed(h, 'nz1'), hashSeed(h, 'nz2'), hashSeed(h, 'nz3')) * spread

  const wisp = spread * CLUSTER_WISP
  const stretch = hashUnit(h, 11) * Math.PI * 2
  px +=
    Math.cos(stretch) *
    gauss3(hashSeed(h, 'cx'), hashSeed(h, 'cy'), hashSeed(h, 'cz')) *
    wisp
  py +=
    gauss3(hashSeed(h, 'y4'), hashSeed(h, 'y5'), hashSeed(h, 'y6')) *
    wisp *
    0.72
  pz +=
    Math.sin(stretch) *
    gauss3(hashSeed(h, 'cz1'), hashSeed(h, 'cz2'), hashSeed(h, 'cz3')) *
    wisp

  positions[i * 3] = px
  positions[i * 3 + 1] = py
  positions[i * 3 + 2] = pz
}
