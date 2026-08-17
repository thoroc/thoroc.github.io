export const rotateGalaxyLocal = (
  x: number,
  y: number,
  z: number,
  tiltX: number,
  tiltZ: number,
  tiltY = 0,
): [number, number, number] => {
  if (tiltY) {
    const cy = Math.cos(tiltY)
    const sy = Math.sin(tiltY)
    const x0 = cy * x + sy * z
    const z0 = -sy * x + cy * z
    x = x0
    z = z0
  }
  const cx = Math.cos(tiltX)
  const sx = Math.sin(tiltX)
  const y1 = y * cx - z * sx
  const z1 = y * sx + z * cx
  const cz = Math.cos(tiltZ)
  const sz = Math.sin(tiltZ)
  const x2 = x * cz - z1 * sz
  const z2 = x * sz + z1 * cz
  return [x2, y1, z2]
}
