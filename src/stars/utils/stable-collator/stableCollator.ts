/** Locale-neutral tie-break comparator: fixed sort order regardless of the
 * active UI locale (see Decision 8, .context/plans/2026-08-20-stars-locale-zh-to-fr.md). */
export const stableCollator = (a: string, b: string): number =>
  a.localeCompare(b, 'en')
