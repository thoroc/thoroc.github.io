import { writeUiPrefs } from './writeUiPrefs'

export const writeSidebarCollapsedPref = (collapsed: boolean): void => {
  writeUiPrefs({ sidebarCollapsed: collapsed })
}
