import { describe, expect, it } from 'bun:test'
import { nextTick, ref } from 'vue'
import { remeasureStarsList } from './remeasureStarsList'

const waitFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

describe('remeasureStarsList', () => {
  it('measures the row matching itemIndex plus every rendered row', async () => {
    const root = document.createElement('div')
    for (let i = 0; i < 3; i += 1) {
      const row = document.createElement('div')
      row.className = 'stars-explorer__virtual-row'
      row.setAttribute('data-index', String(i))
      root.appendChild(row)
    }
    document.body.appendChild(root)

    const measured: Element[] = []
    const virtualizer = ref({
      measureElement: (el: Element) => {
        measured.push(el)
      },
    })

    remeasureStarsList(virtualizer, root, 1)
    await nextTick()
    await waitFrame()

    // Row at index 1 is measured twice (once by itemIndex, once by the
    // querySelectorAll sweep) — the other two rows once each.
    expect(measured.length).toBe(4)
    document.body.removeChild(root)
  })

  it('does nothing when the virtualizer or viewport is missing', async () => {
    const virtualizer = ref(null)
    expect(() => remeasureStarsList(virtualizer, null, 0)).not.toThrow()
    await nextTick()
    await waitFrame()
  })

  it('skips the itemIndex lookup when it is negative or null', async () => {
    const root = document.createElement('div')
    const row = document.createElement('div')
    row.className = 'stars-explorer__virtual-row'
    row.setAttribute('data-index', '0')
    root.appendChild(row)
    document.body.appendChild(root)

    const measured: Element[] = []
    const virtualizer = ref({
      measureElement: (el: Element) => {
        measured.push(el)
      },
    })

    remeasureStarsList(virtualizer, root, null)
    await nextTick()
    await waitFrame()

    expect(measured.length).toBe(1)
    document.body.removeChild(root)
  })
})
