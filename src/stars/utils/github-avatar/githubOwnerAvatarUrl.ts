/** GitHub 用户/组织头像（直连 avatars CDN，避免 github.com/*.png 302） */
export const githubOwnerAvatarUrl = (owner: string, size = 80): string => {
  const name = (owner || '').trim()
  if (!name) return ''
  const px = Math.max(16, Math.min(512, Number(size) || 80))
  return `https://avatars.githubusercontent.com/${encodeURIComponent(name)}?s=${px}&v=4`
}
