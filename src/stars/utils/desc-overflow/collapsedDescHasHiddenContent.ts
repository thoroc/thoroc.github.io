import { withOffscreenClone } from './withOffscreenClone'

/** 折叠后可见高度是否明显小于全文（用于渲染后去掉无效按钮） */
export const collapsedDescHasHiddenContent = (
  el: HTMLElement | null | undefined,
): boolean => {
  if (!el?.classList.contains('is-collapsed')) return false
  const width = el.getBoundingClientRect().width
  if (width <= 0) return false

  const fullHeight = withOffscreenClone(
    el,
    width,
    false,
    (clone) => clone.scrollHeight,
  )

  void el.offsetHeight
  return fullHeight > el.clientHeight + 1
}
