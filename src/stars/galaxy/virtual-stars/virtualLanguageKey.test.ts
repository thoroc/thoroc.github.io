import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import type { LayoutLike, VirtualStar } from './types'
import { virtualLanguageKey } from './virtualLanguageKey'

const makeLayout = (langs: string[]): LayoutLike =>
  ({ langKeys: new Set(langs) }) as unknown as LayoutLike

const makeStar = (language: string): VirtualStar => ({
  repoId: 'r1',
  item: {},
  language,
  topic: null,
  virtualKey: 'r1\0',
})

describe('virtualLanguageKey', () => {
  it('returns the language when it is a known layout key', () => {
    expect(virtualLanguageKey(makeStar('Rust'), makeLayout(['Rust']))).toBe(
      'Rust',
    )
  })

  it('falls back to the other-language key for an unknown language', () => {
    expect(virtualLanguageKey(makeStar('COBOL'), makeLayout(['Rust']))).toBe(
      OTHER_LANGUAGE_KEY,
    )
  })

  it('falls back to the other-language key when language is empty', () => {
    expect(virtualLanguageKey(makeStar(''), makeLayout(['Rust']))).toBe(
      OTHER_LANGUAGE_KEY,
    )
  })
})
