const DESC_COLLAPSED_LINES = 2

function getLineHeight(el) {
  const style = getComputedStyle(el)
  const lineHeight = parseFloat(style.lineHeight)
  if (Number.isFinite(lineHeight)) return lineHeight
  return parseFloat(style.fontSize) * 1.45
}

/** Offscreen-clone measurement shared by measureDescOverflow and collapsedDescHasHiddenContent. */
function withOffscreenClone(el, width, ariaHidden, measure) {
  const clone = el.cloneNode(true)
  clone.removeAttribute('id')
  if (ariaHidden) clone.setAttribute('aria-hidden', 'true')
  Object.assign(clone.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    width: `${width}px`,
    visibility: 'hidden',
    pointerEvents: 'none',
    margin: '0',
  })
  clone.classList.remove('is-collapsed')

  document.body.appendChild(clone)
  void clone.offsetHeight
  const result = measure(clone)
  document.body.removeChild(clone)
  return result
}

/**
 * 用离屏克隆测量，不改动页面上真实节点的折叠 class，避免 resize 时「一直展开、按钮无用」
 * @param {HTMLElement} el
 * @param {number} [collapsedLines]
 */
export function measureDescOverflow(el, collapsedLines = DESC_COLLAPSED_LINES) {
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

/** 折叠后可见高度是否明显小于全文（用于渲染后去掉无效按钮） */
export function collapsedDescHasHiddenContent(el) {
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
