export const formatHomepageHost = (url: string | null | undefined): string => {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url
  }
}
