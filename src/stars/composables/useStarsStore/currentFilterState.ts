import type { FilterOptions } from '../../utils/stars-filter'
import { language, license, qApplied, sort, starredYear, type } from './state'

export const currentFilterState = (
  overrides: Partial<FilterOptions> = {},
): FilterOptions => {
  return {
    q: qApplied.value,
    language: language.value,
    license: license.value,
    starredYear: starredYear.value,
    type: type.value,
    sort: sort.value,
    ...overrides,
  }
}
