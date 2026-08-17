import { GALAXY, R_MAX, R_MIN } from '../constants'
import { gauss3, hashSeed, hashStr } from '../hash'
import { activityFactor } from './activityFactor'
import { diskHeight } from './diskHeight'
import { layoutLanguageKey } from './layoutLanguageKey'
import { radialFromRepoStars } from './radialFromRepoStars'
import { radialFromStarYear } from './radialFromStarYear'
import { spiralAngle } from './spiralAngle'
import { topicAngleOffset } from './topicAngleOffset'
import { topicRadialOffset } from './topicRadialOffset'
import type { LanguageLayout, RepoLike } from './types'
import { volumeOffset } from './volumeOffset'

export const repoPosition = (
  item: RepoLike,
  maxStars: number,
  layout: LanguageLayout | null = null,
): [number, number, number] => {
  const h = hashStr(item.id || item.fullName || '')
  const ra = hashSeed(h, 'r1')
  const rb = hashSeed(h, 'r2')
  const rc = hashSeed(h, 'r3')
  const a = hashSeed(h, 'a1')
  const b = hashSeed(h, 'a2')
  const cc = hashSeed(h, 'a3')
  const ya = hashSeed(h, 'y1')
  const yb = hashSeed(h, 'y2')
  const yc = hashSeed(h, 'y3')

  const yearR = radialFromStarYear(item.starredAt)
  const starR = radialFromRepoStars(item.stars, maxStars)
  const repoRr = yearR * 0.3 + starR * 0.7

  let rr: number
  let ang: number

  if (layout) {
    const lang = layoutLanguageKey(item, layout)
    const clusterAng =
      (layout.langAngles.get(lang) ?? 0) + topicAngleOffset(item, layout)
    const clusterRr = layout.langRadial.get(lang) ?? repoRr
    const wedge = layout.langWedge.get(lang) ?? layout.wedge
    const langN = layout.langCounts?.get(lang) ?? 1
    const langSpread = 0.95 + Math.sqrt(langN / 100) * 0.75

    const spreadAng =
      gauss3(a, b, cc) * wedge * GALAXY.LANG_CLUSTER_SPREAD_ANG * langSpread
    const spreadR =
      gauss3(ra, rb, rc) *
        (GALAXY.LANG_CLUSTER_SPREAD_R + wedge * 6) *
        langSpread +
      topicRadialOffset(item)

    ang = clusterAng + spreadAng
    rr = clusterRr + spreadR

    const spiralAng = spiralAngle(h, rr, a, b, cc)
    ang += spiralAng * 0.1
    rr = rr * 0.78 + repoRr * 0.22 + gauss3(ra, rb, rc) * 3.2
  } else {
    rr = repoRr + gauss3(ra, rb, rc) * 3.5
    ang = spiralAngle(h, rr, a, b, cc)
  }

  rr = Math.max(1.8, Math.min(R_MAX * 0.98, rr))

  const t = (rr - R_MIN) / (R_MAX - R_MIN + 1)
  const act = activityFactor(item.pushedAt)
  const starNorm =
    Math.log1p(Number(item.stars) || 0) / Math.log1p(Math.max(maxStars, 1))
  const y = diskHeight(h, { rr, ang, t, ySeed: [ya, yb, yc], starNorm, act })
  const [ox, oy, oz] = volumeOffset(h, {
    ySeed: [ya, yb, yc],
    rSeed: [ra, rb, rc],
  })
  const sf = layout?.spreadFactor ?? 1

  return [
    (Math.cos(ang) * rr + ox) * sf,
    (y + oy) * sf,
    (Math.sin(ang) * rr + oz) * sf,
  ]
}
