/** Offscreen-clone measurement shared by measureDescOverflow and collapsedDescHasHiddenContent. */
export const withOffscreenClone = <T>(
  el: HTMLElement,
  width: number,
  ariaHidden: boolean,
  measure: (clone: HTMLElement) => T,
): T => {
  const clone = el.cloneNode(true) as HTMLElement
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
