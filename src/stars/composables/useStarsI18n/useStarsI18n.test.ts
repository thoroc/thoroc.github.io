import { describe, expect, it } from 'bun:test'
import { STARS_ROUTE_BASE } from '../../config'
import { useStarsI18n } from './useStarsI18n'

describe('useStarsI18n', () => {
  it('exposes the store locale, a translator, and the base path', () => {
    const { locale, t, basePath } = useStarsI18n()
    expect(typeof locale.value).toBe('string')
    expect(typeof t.value).toBe('function')
    expect(basePath.value).toBe(STARS_ROUTE_BASE)
  })

  it('translates a key using the current store locale', () => {
    const { t } = useStarsI18n()
    expect(t.value('type')).toBeTruthy()
  })
})
