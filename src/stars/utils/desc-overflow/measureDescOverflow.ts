import { DESC_COLLAPSED_LINES } from './constants'
import { getLineHeight } from './getLineHeight'
import { withOffscreenClone } from './withOffscreenClone'

/** 用离屏克隆测量，不改动页面上真实节点的折叠 class，避免 resize 时「一直展开、按钮无用」 */
export const measureDescOverflow = (
  el: HTMLElement,
  collapsedLines: number = DESC_COLLAPSED_LINES,
): boolean => {
  const width = el.getBoundingClientRect().width
  if (width <= 0) return false
  const maxCollapsed = getLineHeight(el) * collapsedLines

  return withOffscreenClone(el, width, true, (clone) => {
    const fullHeight = clone.scrollHeight
    clone.classList.add('is-collapsed')
    void clone.offsetHeight
    const collapsedVisible = clone.clientHeight
    return fullHeight > collapsedVisible + 1 && fullHeight > maxCollapsed + 1
  })
}
