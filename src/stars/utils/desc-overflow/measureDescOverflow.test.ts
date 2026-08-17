import { describe, expect, it } from 'bun:test'
import { measureDescOverflow } from './measureDescOverflow'

describe('measureDescOverflow', () => {
  it('returns false when the element has zero width', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    expect(measureDescOverflow(el)).toBe(false)
    document.body.removeChild(el)
  })

  it('returns a boolean without throwing for a normal element', () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 200 }),
    })
    document.body.appendChild(el)
    expect(typeof measureDescOverflow(el)).toBe('boolean')
    document.body.removeChild(el)
  })

  it('accepts a custom collapsedLines override', () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 200 }),
    })
    document.body.appendChild(el)
    expect(typeof measureDescOverflow(el, 4)).toBe('boolean')
    document.body.removeChild(el)
  })
})
