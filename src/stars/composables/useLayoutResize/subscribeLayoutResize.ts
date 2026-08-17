const subscribers = new Set<() => void>()
let listening = false
let rafId = 0

const flush = (): void => {
  rafId = 0
  subscribers.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ignore subscriber errors */
    }
  })
}

const onWindowResize = (): void => {
  if (rafId) return
  rafId = requestAnimationFrame(flush)
}

/** 窗口尺寸变化时通知订阅方（虚拟列表内多卡片共享一条监听） */
export const subscribeLayoutResize = (fn: () => void): (() => void) => {
  subscribers.add(fn)
  if (!listening) {
    listening = true
    window.addEventListener('resize', onWindowResize, { passive: true })
  }
  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0 && listening) {
      window.removeEventListener('resize', onWindowResize)
      listening = false
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    }
  }
}
