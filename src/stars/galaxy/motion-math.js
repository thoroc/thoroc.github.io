/** Shared by motion.js (per-star motion fields) and motion-hubs.js (language-hub motion). */

export function motionSign(key) {
  let h = 0
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) | 0
  }
  return h % 2 === 0 ? 1 : -1
}

export function rotateY(x, y, z, ang) {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  return [c * x + s * z, y, -s * x + c * z]
}

/** 绕 Y 倾斜轴旋转（用于层间不同倾角） */
export function rotateTiltedY(x, y, z, ang, tilt) {
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
