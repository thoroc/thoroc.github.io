export const roundPos = (value: number | null | undefined): number | null => {
  if (!Number.isFinite(value)) return null
  return Math.round((value as number) * 100) / 100
}
