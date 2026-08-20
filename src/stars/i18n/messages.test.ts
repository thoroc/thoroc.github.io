import { describe, expect, it } from 'bun:test'
import { messages } from './messages'

describe('messages', () => {
  it('has fr and en packs with matching key sets', () => {
    const frKeys = Object.keys(messages.fr as Record<string, string>).sort()
    const enKeys = Object.keys(messages.en as Record<string, string>).sort()
    expect(frKeys).toEqual(enKeys)
  })
})
