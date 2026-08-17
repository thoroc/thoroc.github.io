import { STARS_DATA_BASE } from '../../config'
import { siteMeta } from './state'

export const loadSiteMeta = async (): Promise<void> => {
  const base = STARS_DATA_BASE
  try {
    const res = await fetch(`${base}site.json`)
    if (res.ok) siteMeta.value = await res.json()
  } catch {
    siteMeta.value = null
  }
}
