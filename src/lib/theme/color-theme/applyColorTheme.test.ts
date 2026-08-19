import { describe, expect, it } from 'bun:test'
import { applyColorTheme } from './applyColorTheme'

describe('applyColorTheme', () => {
  it('sets the resolved theme on documentElement.dataset', () => {
    const resolved = applyColorTheme('dark')
    expect(resolved).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('returns the resolved theme for a light preference', () => {
    expect(applyColorTheme('light')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
