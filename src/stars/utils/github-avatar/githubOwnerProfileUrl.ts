/** 用户或组织主页 */
export const githubOwnerProfileUrl = (owner: string): string => {
  const name = (owner || '').trim()
  if (!name) return ''
  return `https://github.com/${encodeURIComponent(name)}`
}
