import { readUiPrefs } from './readUiPrefs'

export const readStoredGalaxyAreaExpanded = (): boolean => {
  return readUiPrefs().galaxyAreaExpanded === true
}
