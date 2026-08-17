import { rowRemeasureController } from './state'

/** Falls back to a no-op when unregistering, so callers can always invoke rowRemeasureController.fn() safely. */
export const registerStarsRowRemeasure = (fn: unknown): void => {
  rowRemeasureController.fn =
    typeof fn === 'function'
      ? (fn as (itemIndex?: number | null) => void)
      : () => undefined
}
