import { persistSession } from './persistSession'
import { galaxyFocus, galaxySelected } from './state'
import { syncQuery } from './syncQuery'

export const closeGalaxyDetail = (): void => {
  galaxySelected.value = null
  galaxyFocus.value = ''
  persistSession()
  syncQuery()
}
