import { hashStr, hashUnit } from '../hash'
import { rotateTiltedY, rotateY } from '../motion-math'
import type { MotionFields, Vec3 } from './types'
import { xzRadius } from './xzRadius'

export const applyHierarchicalMotion = (
  rx: number,
  ry: number,
  rz: number,
  fields: MotionFields,
  i: number,
  time: number,
): Vec3 => {
  const {
    galaxyHubs,
    nebulaCenters,
    motionOmega,
    motionOmega2,
    yBobAmp,
    yBobPhase,
  } = fields

  const hubX = galaxyHubs[i * 3] as number
  const hubY = galaxyHubs[i * 3 + 1] as number
  const hubZ = galaxyHubs[i * 3 + 2] as number
  const nebX = nebulaCenters[i * 3] as number
  const nebY = nebulaCenters[i * 3 + 1] as number
  const nebZ = nebulaCenters[i * 3 + 2] as number

  const universeOrbit = motionOmega[i * 4] as number
  const galaxySpin = motionOmega[i * 4 + 1] as number
  const clusterSpin = motionOmega[i * 4 + 2] as number

  const galaxyOrbit = motionOmega2[i * 4] as number
  const clusterOrbit = motionOmega2[i * 4 + 1] as number
  const tiltMix = motionOmega2[i * 4 + 3] as number

  const galTilt = tiltMix * 0.12
  const clusterTilt = (hashUnit(hashStr(`cl-tilt:${i}`), 0) - 0.5) * 0.12

  let x = rx
  let y = ry
  let z = rz

  if (clusterSpin !== 0 || clusterOrbit !== 0) {
    let relCx = x - nebX
    let relCy = y - nebY
    let relCz = z - nebZ
    ;[relCx, relCy, relCz] = rotateTiltedY(
      relCx,
      relCy,
      relCz,
      time * clusterSpin,
      clusterTilt,
    ) as Vec3
    if (clusterOrbit !== 0) {
      ;[relCx, relCy, relCz] = rotateY(
        relCx,
        relCy,
        relCz,
        time * clusterOrbit,
      ) as Vec3
    }
    x = nebX + relCx
    y = nebY + relCy
    z = nebZ + relCz
  }

  let relGx = x - hubX
  let relGy = y - hubY
  let relGz = z - hubZ
  const galR = Math.max(xzRadius(relGx, relGz), 6)
  const diffSpin = galaxySpin * (1.15 / galR ** 0.38)
  ;[relGx, relGy, relGz] = rotateTiltedY(
    relGx,
    relGy,
    relGz,
    time * diffSpin,
    galTilt,
  ) as Vec3
  if (galaxyOrbit !== 0) {
    ;[relGx, relGy, relGz] = rotateY(
      relGx,
      relGy,
      relGz,
      time * galaxyOrbit,
    ) as Vec3
  }
  x = hubX + relGx
  y =
    hubY +
    relGy +
    Math.sin(time * diffSpin * 0.6 + (yBobPhase[i] as number)) *
      (yBobAmp[i] as number)
  z = hubZ + relGz

  ;[x, y, z] = rotateY(x, y, z, time * universeOrbit) as Vec3

  return [x, y, z]
}
