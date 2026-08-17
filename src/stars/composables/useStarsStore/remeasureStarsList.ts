import { nextTick, type Ref } from 'vue'

interface VirtualizerLike {
  measureElement: (el: Element) => void
}

export const remeasureStarsList = (
  virtualizer: Ref<VirtualizerLike | null | undefined> | null | undefined,
  viewportEl: Element | null | undefined,
  itemIndex?: number | null,
): void => {
  const run = (): void => {
    const v = virtualizer?.value
    const root = viewportEl
    if (!v || !root) return

    const measureEl = (el: Element | null): void => {
      if (el) v.measureElement(el)
    }

    if (itemIndex != null && itemIndex >= 0) {
      measureEl(
        root.querySelector(
          `.stars-explorer__virtual-row[data-index="${itemIndex}"]`,
        ),
      )
    }

    root
      .querySelectorAll('.stars-explorer__virtual-row[data-index]')
      .forEach(measureEl)
  }

  nextTick(() => {
    requestAnimationFrame(run)
  })
}
