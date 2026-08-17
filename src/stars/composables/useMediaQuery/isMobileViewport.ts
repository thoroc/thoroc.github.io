import { MOBILE_MEDIA } from './constants'

/** 当前是否为移动端视口（与 MOBILE_MEDIA 一致） */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MEDIA).matches
}
