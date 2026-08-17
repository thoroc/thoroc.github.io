import { COSMIC_UNIVERSE, MORPHOLOGY_LAYOUT } from '../constants'
import {
  buildCosmicLanguageField,
  sampleCosmicFieldPosition,
  sampleCosmicVoid,
} from '../galaxy-field'
import { gauss3, hashSeed, hashStr, hashUnit } from '../hash'
import type { PlacementLayout, RepoLike, Vec3 } from './types'

export const buildCosmicRepoAnchors = (
  repos: RepoLike[],
  layout: PlacementLayout,
): Map<string, Vec3> => {
  const sf = Math.min(layout.spreadFactor ?? 1, 1.32)
  const total = Math.max(repos.length, 1)
  const field = buildCosmicLanguageField(layout, total)
  const repoPosById = new Map<string, Vec3>()
  const span = field.span
  const { INTERGALACTIC_RATIO, VOLUME_SCALE } = {
    ...COSMIC_UNIVERSE,
    VOLUME_SCALE: MORPHOLOGY_LAYOUT.VOLUME_SCALE,
  }

  for (const item of repos) {
    const id = item?.id
    if (!id) continue

    const h = hashStr(id)
    let x: number
    let y: number
    let z: number

    if (hashUnit(h, 0) < INTERGALACTIC_RATIO) {
      ;[x, y, z] = sampleCosmicVoid(h, span)
    } else {
      ;[x, y, z] = sampleCosmicFieldPosition(item, h, field, layout)
    }

    x *= sf
    y *= sf
    z *= sf

    const jitter = span * 0.022 * VOLUME_SCALE
    x +=
      gauss3(hashSeed(h, 'jx1'), hashSeed(h, 'jx2'), hashSeed(h, 'jx3')) *
      jitter
    y +=
      gauss3(hashSeed(h, 'jy1'), hashSeed(h, 'jy2'), hashSeed(h, 'jy3')) *
      jitter *
      0.78
    z +=
      gauss3(hashSeed(h, 'jz1'), hashSeed(h, 'jz2'), hashSeed(h, 'jz3')) *
      jitter

    repoPosById.set(id, [x, y, z])
  }

  return repoPosById
}
