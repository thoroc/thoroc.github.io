import { describe, expect, it } from 'bun:test'
import { en } from './messages.en'
import { fr } from './messages.fr'

describe('messages', () => {
  it('has fr and en packs with matching key sets', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort())
  })
})
