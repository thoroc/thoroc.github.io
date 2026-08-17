import { expandedDescIds } from './state'

export const toggleDescExpanded = (id: string): void => {
  const next = new Set(expandedDescIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedDescIds.value = next
}
