import { OTHER_LANGUAGE_KEY } from '../other-language'
import type { StarItem } from './types'

export const itemLanguageKey = (item: Pick<StarItem, 'language'>): string => {
  return item.language || OTHER_LANGUAGE_KEY
}
