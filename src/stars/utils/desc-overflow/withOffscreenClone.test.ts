import { describe, expect, it } from 'bun:test'
import { withOffscreenClone } from './withOffscreenClone'

describe('withOffscreenClone', () => {
  it('clones the element offscreen, measures it, then removes the clone', () => {
    const el = document.createElement('div')
    el.id = 'original'
    el.className = 'is-collapsed'
    document.body.appendChild(el)

    const bodyChildrenBefore = document.body.children.length
    let seenDuringMeasure: HTMLElement | null = null
    const result = withOffscreenClone(el, 200, true, (clone) => {
      seenDuringMeasure = clone
      return 'measured'
    })

    expect(result).toBe('measured')
    expect(seenDuringMeasure).not.toBeNull()
    expect((seenDuringMeasure as unknown as HTMLElement).id).toBe('')
    expect(
      (seenDuringMeasure as unknown as HTMLElement).classList.contains(
        'is-collapsed',
      ),
    ).toBe(false)
    expect(
      (seenDuringMeasure as unknown as HTMLElement).getAttribute('aria-hidden'),
    ).toBe('true')
    expect(document.body.children.length).toBe(bodyChildrenBefore)

    document.body.removeChild(el)
  })

  it('omits aria-hidden when ariaHidden is false', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let ariaHidden: string | null = 'unset'
    withOffscreenClone(el, 100, false, (clone) => {
      ariaHidden = clone.getAttribute('aria-hidden')
      return null
    })
    expect(ariaHidden).toBeNull()

    document.body.removeChild(el)
  })
})
