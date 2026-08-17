export const normLogCount = (
  value: number | undefined,
  max: number,
): number => {
  const v = Math.log1p(Number(value) || 0)
  const m = Math.log1p(Math.max(max, 1))
  return m > 0 ? v / m : 0
}
