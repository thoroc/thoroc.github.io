import { describe, expect, it } from 'bun:test'
import { roundPos } from './roundPos'

describe('roundPos', () => {
  it('rounds to two decimal places', () => {
    expect(roundPos(1.23456)).toBe(1.23)
  })

  it('returns null for non-finite values', () => {
    expect(roundPos(Number.NaN)).toBeNull()
    expect(roundPos(Number.POSITIVE_INFINITY)).toBeNull()
    expect(roundPos(undefined)).toBeNull()
  })
})
