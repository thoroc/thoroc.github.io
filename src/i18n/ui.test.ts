import { describe, expect, it } from 'bun:test'
import { defaultLang, languages, type UiKey, ui, useTranslations } from './ui'

describe('i18n dictionary', () => {
  it('exposes the two supported languages', () => {
    expect(languages).toEqual({ en: 'English', fr: 'Français' })
  })

  it('has an English default language', () => {
    expect(defaultLang).toBe('en')
  })

  it('defines the same keys for every language', () => {
    const enKeys = Object.keys(ui.en).sort()
    for (const lang of Object.keys(ui) as Array<keyof typeof ui>) {
      expect(Object.keys(ui[lang]).sort()).toEqual(enKeys)
    }
  })

  it('has translations for all core keys', () => {
    const keys: UiKey[] = [
      'site.title',
      'nav.home',
      'nav.projects',
      'notFound.title',
    ]
    for (const key of keys) {
      expect(ui.en[key]).toBeTruthy()
      expect(ui.fr[key]).toBeTruthy()
    }
  })
})

describe('useTranslations', () => {
  it('returns the English value for an English key', () => {
    expect(useTranslations('en')('site.title')).toBe('thoroc — selected work')
  })

  it('returns the French value for a French key', () => {
    expect(useTranslations('fr')('nav.projects')).toBe('Projets')
  })
})
