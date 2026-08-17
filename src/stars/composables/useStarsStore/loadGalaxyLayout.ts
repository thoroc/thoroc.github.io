import { STARS_DATA_BASE } from '../../config'
import {
  GALAXY_LAYOUT_CACHE_TAG,
  GALAXY_LAYOUT_VERSION,
} from '../../galaxy/layout-payload'
import { pickGalaxyLayoutPayload } from './pickGalaxyLayoutPayload'
import { galaxyLayoutPayload } from './state'
import type { GalaxyLayout } from './types'

export const loadGalaxyLayout = async (): Promise<GalaxyLayout | null> => {
  const base = STARS_DATA_BASE
  let remote: Partial<GalaxyLayout> | null = null

  try {
    const res = await fetch(
      `${base}galaxy.json?v=${GALAXY_LAYOUT_VERSION}-${GALAXY_LAYOUT_CACHE_TAG}`,
      { cache: 'no-store' },
    )
    if (res.ok) remote = await res.json()
  } catch {
    /* ignore */
  }

  const picked = pickGalaxyLayoutPayload(remote)
  if (picked) galaxyLayoutPayload.value = picked
  return picked
}
