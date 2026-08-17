/** Map hash sub-seeds to roughly normal noise in [-1, 1] */
export const gauss3 = (ra: number, rb: number, rc: number): number => {
  const u1 = (ra >>> 0) / 4294967296
  const u2 = (rb >>> 0) / 4294967296
  const u3 = (rc >>> 0) / 4294967296
  const z0 =
    Math.sqrt(-2 * Math.log(Math.max(u1, 1e-9))) * Math.cos(2 * Math.PI * u2)
  const z1 =
    Math.sqrt(-2 * Math.log(Math.max(u2, 1e-9))) * Math.cos(2 * Math.PI * u3)
  return (z0 + z1) * 0.35
}
