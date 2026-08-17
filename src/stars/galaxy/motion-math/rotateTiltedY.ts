/** 绕 Y 倾斜轴旋转（用于层间不同倾角） */
export const rotateTiltedY = (
  x: number,
  y: number,
  z: number,
  ang: number,
  tilt: number,
): [number, number, number] => {
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const y1 = y * ct - z * st
  const z1 = y * st + z * ct
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const x2 = c * x + s * z1
  const z2 = -s * x + c * z1
  const y2 = y1 * ct + z2 * st
  const z3 = -y1 * st + z2 * ct
  return [x2, y2, z3]
}
