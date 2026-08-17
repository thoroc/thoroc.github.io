export const getLineHeight = (el: HTMLElement): number => {
  const style = getComputedStyle(el)
  const lineHeight = Number.parseFloat(style.lineHeight)
  if (Number.isFinite(lineHeight)) return lineHeight
  return Number.parseFloat(style.fontSize) * 1.45
}
