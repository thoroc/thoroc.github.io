/** t: 0~1 */
export const easeInOutCubic = (t: number): number => {
  const x = Math.max(0, Math.min(1, t))
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}
