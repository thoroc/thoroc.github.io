import { rotateTiltedY, rotateY } from '../motion-math'
import type { Vec3 } from './types'

/** 与 applyGalaxyHubMotion 一致的 JS 实现（气体云每帧摆位） */
export const applyGalaxyHubMotionJs = (
  x: number,
  y: number,
  z: number,
  hub: Vec3,
  motionOmega: [number, number, number, number],
  motionOmega2: [number, number, number, number],
  time: number,
): Vec3 => {
  const universeOrbit = time * motionOmega[0]
  const galaxySpin = time * motionOmega[1]
  const galaxyOrbit = time * motionOmega2[0]
  const tiltMix = motionOmega2[3]
  const galTilt = tiltMix * 0.18

  let relGx = x - hub[0]
  let relGy = y - hub[1]
  let relGz = z - hub[2]
  ;[relGx, relGy, relGz] = rotateTiltedY(
    relGx,
    relGy,
    relGz,
    galaxySpin,
    galTilt,
  )
  ;[relGx, relGy, relGz] = rotateY(relGx, relGy, relGz, galaxyOrbit)
  let px = hub[0] + relGx
  let py = hub[1] + relGy
  let pz = hub[2] + relGz
  ;[px, py, pz] = rotateY(px, py, pz, universeOrbit)
  return [px, py, pz]
}
