import { expandedDescIds } from './state'

export const isDescExpanded = (id: string): boolean => {
  return expandedDescIds.value.has(id)
}
