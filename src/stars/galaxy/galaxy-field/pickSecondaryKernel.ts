import { hashUnit } from '../hash'
import type { GalaxyKernel } from './types'

export const pickSecondaryKernel = (
  h: number,
  lang: string,
  kernels: Map<string, GalaxyKernel>,
): GalaxyKernel | null => {
  const langs = [...kernels.keys()]
  if (langs.length < 2) return null
  const idx = Math.floor(hashUnit(h, 16) * langs.length) % langs.length
  let secLang = langs[idx] as string
  if (secLang === lang) secLang = langs[(idx + 1) % langs.length] as string
  return kernels.get(secLang) ?? null
}
