import { writeUiPrefs } from './writeUiPrefs'

export const writeStoredGalaxyAreaExpanded = (expanded: boolean): void => {
  writeUiPrefs({ galaxyAreaExpanded: expanded === true })
}
