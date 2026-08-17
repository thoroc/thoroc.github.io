import { GALAXY } from '../constants'
import { gauss3, hashSeed, hashStr } from '../hash'
import { primaryTopic } from './primaryTopic'
import type { RepoLike } from './types'

/** topic 在语言团内的径向微偏移 */
export const topicRadialOffset = (item: RepoLike): number => {
  const topic = primaryTopic(item) || '__none__'
  const h = hashStr(`r:${item.language}:${topic}:${item.id}`)
  return (
    gauss3(hashSeed(h, 'a'), hashSeed(h, 'b'), hashSeed(h, 'c')) *
    GALAXY.TOPIC_RADIAL_JITTER
  )
}
