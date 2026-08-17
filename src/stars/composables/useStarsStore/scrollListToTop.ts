import { scrollController, viewMode } from './state'

export const scrollListToTop = (): void => {
  if (viewMode.value !== 'list') return
  scrollController.fn()
}
