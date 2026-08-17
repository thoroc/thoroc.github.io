export const rotateY = (
  x: number,
  y: number,
  z: number,
  ang: number,
): [number, number, number] => {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  return [c * x + s * z, y, -s * x + c * z]
}
