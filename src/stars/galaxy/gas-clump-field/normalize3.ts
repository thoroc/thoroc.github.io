export const normalize3 = (
  x: number,
  y: number,
  z: number,
): [number, number, number] => {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}
