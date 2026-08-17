import { countBy } from './countBy'
import type { CountOption, StarItem } from './types'

export const buildLanguageOptions = (
  items: Array<Pick<StarItem, 'language'>>,
): CountOption[] => {
  return countBy(items, (item) => item.language || '其他')
}
