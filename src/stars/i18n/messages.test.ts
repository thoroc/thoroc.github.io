import { describe, expect, it } from 'bun:test'
import { messages } from './messages'

describe('messages', () => {
  it('has zh-CN and en packs with matching key sets', () => {
    const zhKeys = Object.keys(
      messages['zh-CN'] as Record<string, string>,
    ).sort()
    const enKeys = Object.keys(messages.en as Record<string, string>).sort()
    expect(zhKeys).toEqual(enKeys)
  })
})
