import { describe, expect, it } from 'bun:test'
import { createTranslator } from './createTranslator'

describe('createTranslator', () => {
  it('translates a key for the given locale (function form)', () => {
    const t = createTranslator(() => 'en')
    expect(t('type')).toBe('Type')
  })

  it('translates a key for the given locale (ref-object form)', () => {
    const t = createTranslator({ value: 'en' })
    expect(t('type')).toBe('Type')
  })

  it('translates a key for a plain string locale', () => {
    const t = createTranslator('en')
    expect(t('type')).toBe('Type')
  })

  it('falls back to en for an unknown locale', () => {
    const t = createTranslator(() => 'xx')
    expect(t('type')).toBe('Type')
  })

  it('falls back to the en pack for a key missing in the active locale', () => {
    const t = createTranslator(() => 'en')
    expect(t('nonexistent-key')).toBe('nonexistent-key')
  })

  it('interpolates params into the message', () => {
    const t = createTranslator(() => 'en')
    expect(t('ownerProfile', { owner: 'thoroc' })).toBe('View thoroc on GitHub')
  })

  it('replaces every occurrence of a repeated placeholder', () => {
    const t = createTranslator(() => 'en')
    expect(t('statCountFiltered', { filtered: 3, total: 3 })).toBe('3 / 3')
  })
})
