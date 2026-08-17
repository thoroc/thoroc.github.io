import { describe, expect, it } from 'bun:test'
import { getLineHeight } from './getLineHeight'

describe('getLineHeight', () => {
  it('parses a numeric line-height from computed style', () => {
    const el = document.createElement('div')
    el.style.lineHeight = '24px'
    document.body.appendChild(el)
    expect(getLineHeight(el)).toBe(24)
    document.body.removeChild(el)
  })

  it('falls back to fontSize * 1.45 when line-height is not numeric', () => {
    const el = document.createElement('div')
    el.style.lineHeight = 'normal'
    el.style.fontSize = '10px'
    document.body.appendChild(el)
    expect(getLineHeight(el)).toBeCloseTo(14.5)
    document.body.removeChild(el)
  })
})
