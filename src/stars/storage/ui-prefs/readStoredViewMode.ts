import { readUiPrefs } from './readUiPrefs'

export const readStoredViewMode = (): string => {
  const mode = readUiPrefs().viewMode
  return mode === 'galaxy' || mode === 'list' ? mode : ''
}
