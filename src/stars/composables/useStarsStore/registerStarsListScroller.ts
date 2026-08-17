import { scrollController } from './state'

/** Falls back to a no-op when unregistering, so callers can always invoke scrollController.fn() safely. */
export const registerStarsListScroller = (fn: unknown): void => {
  scrollController.fn =
    typeof fn === 'function' ? (fn as () => void) : () => undefined
}
