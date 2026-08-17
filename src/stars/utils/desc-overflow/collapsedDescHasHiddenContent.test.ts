import { describe, expect, it } from 'bun:test'
import { collapsedDescHasHiddenContent } from './collapsedDescHasHiddenContent'

describe('collapsedDescHasHiddenContent', () => {
  it('returns false for a null or undefined element', () => {
    expect(collapsedDescHasHiddenContent(null)).toBe(false)
    expect(collapsedDescHasHiddenContent(undefined)).toBe(false)
  })

  it('returns false when the element is not collapsed', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    expect(collapsedDescHasHiddenContent(el)).toBe(false)
    document.body.removeChild(el)
  })

  it('returns false when the collapsed element has zero width', () => {
    const el = document.createElement('div')
    el.classList.add('is-collapsed')
    document.body.appendChild(el)
    expect(collapsedDescHasHiddenContent(el)).toBe(false)
    document.body.removeChild(el)
  })

  it('returns a boolean without throwing for a collapsed element with width', () => {
    const el = document.createElement('div')
    el.classList.add('is-collapsed')
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 200 }),
    })
    document.body.appendChild(el)
    expect(typeof collapsedDescHasHiddenContent(el)).toBe('boolean')
    document.body.removeChild(el)
  })
})
