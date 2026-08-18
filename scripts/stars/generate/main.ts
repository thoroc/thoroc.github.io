import { computeGalaxyLayoutForItems as defaultComputeGalaxyLayoutForItems } from './computeGalaxyLayoutForItems'
import { OWNER } from './constants'
import { fetchStars as defaultFetchStars } from './fetchStars'
import { normalizeStarItem } from './normalizeStarItem'
import type { GenerateDeps } from './types'
import { writeGalaxyJson as defaultWriteGalaxyJson } from './writeGalaxyJson'
import { writeSiteJson as defaultWriteSiteJson } from './writeSiteJson'
import { writeStarsJson as defaultWriteStarsJson } from './writeStarsJson'

export const main = async (deps: GenerateDeps = {}): Promise<void> => {
  const {
    fetchStars = defaultFetchStars,
    computeGalaxyLayoutForItems = defaultComputeGalaxyLayoutForItems,
    writeStarsJson = defaultWriteStarsJson,
    writeGalaxyJson = defaultWriteGalaxyJson,
    writeSiteJson = defaultWriteSiteJson,
    now = () => new Date(),
    log = console.log,
    warn = console.warn,
    error = console.error,
    exit = process.exit,
  } = deps

  log(`Fetching starred repos for @${OWNER}…`)
  try {
    const stars = await fetchStars(OWNER)
    const generatedAt = now().toISOString()
    const items = stars.map(normalizeStarItem)

    let galaxy = null
    try {
      galaxy = await computeGalaxyLayoutForItems(items)
    } catch (layoutError) {
      warn(
        'Galaxy layout precompute failed, client will fall back to runtime layout:',
        layoutError,
      )
    }

    writeStarsJson(stars, generatedAt)
    writeGalaxyJson(galaxy)
    writeSiteJson(generatedAt)
    log(
      `Wrote public/stars/data/{stars,galaxy,site}.json (${stars.length} repos)`,
    )
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : caught
    error('Failed to generate stars data:', message)
    exit(1)
  }
}

if (import.meta.main) {
  await main()
}
