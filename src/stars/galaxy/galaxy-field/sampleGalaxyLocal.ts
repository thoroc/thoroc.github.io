import { COSMIC_UNIVERSE } from '../constants'
import { gauss3, hashSeed, hashUnit } from '../hash'

/** 星系内摆位：三维椭球高斯云（Sérsic 式中心渐密），无旋臂/极坐标盘 */
export const sampleGalaxyLocal = (
  h: number,
  _lang: string,
  galaxyR: number,
): [number, number, number] => {
  const { GALAXY_DISK_Y } = COSMIC_UNIVERSE
  const ax = galaxyR * (0.48 + hashUnit(h, 3) * 0.38)
  const ay = galaxyR * GALAXY_DISK_Y * (0.48 + hashUnit(h, 4) * 0.38)
  const az = galaxyR * (0.48 + hashUnit(h, 5) * 0.38)

  let lx =
    gauss3(hashSeed(h, 'lx1'), hashSeed(h, 'lx2'), hashSeed(h, 'lx3')) * ax
  let ly =
    gauss3(hashSeed(h, 'ly1'), hashSeed(h, 'ly2'), hashSeed(h, 'ly3')) * ay
  let lz =
    gauss3(hashSeed(h, 'lz1'), hashSeed(h, 'lz2'), hashSeed(h, 'lz3')) * az

  const r2 =
    (lx * lx) / (ax * ax) + (ly * ly) / (ay * ay) + (lz * lz) / (az * az)
  const bulge = Math.exp(-r2 * 1.35)
  const shrink = 0.52 + bulge * 0.48
  lx *= shrink
  ly *= shrink
  lz *= shrink

  const wisp = galaxyR * 0.04 * (1 - bulge * 0.6)
  lx += gauss3(hashSeed(h, 'w1'), hashSeed(h, 'w2'), hashSeed(h, 'w3')) * wisp
  ly +=
    gauss3(hashSeed(h, 'w4'), hashSeed(h, 'w5'), hashSeed(h, 'w6')) *
    wisp *
    0.85
  lz += gauss3(hashSeed(h, 'w7'), hashSeed(h, 'w8'), hashSeed(h, 'w9')) * wisp

  return [lx, ly, lz]
}
