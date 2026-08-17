import { describe, expect, it } from 'bun:test'
import { activityFactor } from './activityFactor'
import { pushRecencyScore } from './pushRecencyScore'

describe('activityFactor', () => {
  it('delegates to pushRecencyScore', () => {
    expect(activityFactor('2020-01-01')).toBe(pushRecencyScore('2020-01-01'))
  })
})
