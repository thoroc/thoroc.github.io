import { GALAXY } from '../constants'
import { hashStr, hashUnit } from '../hash'
import { layoutLanguageKey } from './layoutLanguageKey'
import { primaryTopic } from './primaryTopic'
import type { LanguageLayout, RepoLike } from './types'

/** topic 在语言扇区内的角偏移（同 topic 会靠得更近） */
export const topicAngleOffset = (
  item: RepoLike,
  layout: LanguageLayout,
): number => {
  const lang = layoutLanguageKey(item, layout)
  const topic = primaryTopic(item) || '__none__'
  const wedge =
    layout.langWedge.get(lang) ?? layout.wedge * GALAXY.LANG_WEDGE_FILL
  const h = hashStr(`${lang}\0${topic}`)
  const u = hashUnit(h, 4)
  return (u - 0.5) * wedge * 0.75
}
