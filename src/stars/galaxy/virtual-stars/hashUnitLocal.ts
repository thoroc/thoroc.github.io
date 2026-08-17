/**
 * Local hash utility private to this module — deliberately distinct from
 * (and not to be confused with) the canonical `hashUnit` in `../hash`,
 * which uses a different formula. Renamed from the ported code's shadowing
 * `hashUnit` to make that distinction explicit.
 */
export const hashUnitLocal = (h: number, shift = 0): number =>
  ((h >>> shift) & 0xfffffff) / 0xfffffff
