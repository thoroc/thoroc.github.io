/** FNV-1a 32-bit hash — deterministic layout seed */
export const hashStr = (input: unknown): number => {
  const s = String(input ?? '')
  let h = 2166136261
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
