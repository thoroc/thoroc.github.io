import { expandedDescIds } from './state'

export const collapseDescExpanded = (id: string): void => {
  if (!expandedDescIds.value.has(id)) return
  const next = new Set(expandedDescIds.value)
  next.delete(id)
  expandedDescIds.value = next
}
