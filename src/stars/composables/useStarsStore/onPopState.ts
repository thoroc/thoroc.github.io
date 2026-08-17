import { applyQuery } from './applyQuery'
import { scrollListToTop } from './scrollListToTop'

export const onPopState = (): void => {
  applyQuery()
  scrollListToTop()
}
