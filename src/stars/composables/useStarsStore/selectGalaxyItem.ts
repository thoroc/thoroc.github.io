import { persistSession } from './persistSession'
import { galaxyFocus, galaxySelected } from './state'
import { syncQuery } from './syncQuery'
import type { StarsRepoItem } from './types'

export const selectGalaxyItem = (
  item: StarsRepoItem | null | undefined,
): void => {
  if (!item?.id) return
  galaxySelected.value = item
  galaxyFocus.value = item.id
  persistSession()
  syncQuery()
}
