import { patchQueryParam } from './patchQueryParam'
import { starredYear } from './state'

export const patchStarredYearInQuery = (
  yearValue: string | null | undefined,
): void => {
  starredYear.value = !yearValue || yearValue === 'all' ? 'all' : yearValue
  patchQueryParam('stars-year', starredYear)
}
