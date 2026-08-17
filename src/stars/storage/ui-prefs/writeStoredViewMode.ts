import { writeUiPrefs } from './writeUiPrefs'

export const writeStoredViewMode = (mode: string): void => {
  writeUiPrefs({ viewMode: mode === 'galaxy' ? 'galaxy' : 'list' })
}
