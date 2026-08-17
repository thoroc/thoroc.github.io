import { nextTick } from 'vue'
import { rowRemeasureController } from './state'

export const requestStarsRowRemeasure = (itemIndex?: number | null): void => {
  nextTick(() => rowRemeasureController.fn(itemIndex))
}
