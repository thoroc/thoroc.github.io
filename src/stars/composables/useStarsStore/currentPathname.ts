export const currentPathname = (): string => {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname || '/'
}
