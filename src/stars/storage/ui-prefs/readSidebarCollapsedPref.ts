import { readUiPrefs } from './readUiPrefs'

export const readSidebarCollapsedPref = (): boolean => {
  return readUiPrefs().sidebarCollapsed === true
}
