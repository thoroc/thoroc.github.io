import { describe, expect, it } from 'bun:test'
import { hexToRgb } from './hexToRgb'

describe('hexToRgb', () => {
  it('parses a 6-digit hex colour', () => {
    expect(hexToRgb('#ff8800')).toEqual([255, 136, 0])
  })

  it('parses a 3-digit hex colour', () => {
    expect(hexToRgb('#f80')).toEqual([255, 136, 0])
  })

  it('falls back to the default colour for empty input', () => {
    expect(hexToRgb('')).toEqual(hexToRgb('#6e7681'))
  })
})
