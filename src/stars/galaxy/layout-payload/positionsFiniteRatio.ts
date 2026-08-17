export const positionsFiniteRatio = (
  flat: ArrayLike<number> | null | undefined,
): number => {
  if (!flat?.length) return 0
  let finite = 0
  for (let i = 0; i < flat.length; i += 1) {
    const v = flat[i]
    if (v != null && Number.isFinite(v)) finite += 1
  }
  return finite / flat.length
}
