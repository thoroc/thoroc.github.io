import { OTHER_LANGUAGE_KEY } from '../other-language'
import { countBy } from './countBy'
import type { CountOption, StarItem } from './types'

export const buildLanguageOptions = (
  items: Array<Pick<StarItem, 'language'>>,
): CountOption[] => {
  return countBy(items, (item) => item.language || OTHER_LANGUAGE_KEY)
}
