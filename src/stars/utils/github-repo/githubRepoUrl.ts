/** 由 fullName 拼仓库页 URL（stars.json 不再冗余存 url 字段） */
export const githubRepoUrl = (fullName: string): string => {
  const name = (fullName || '').trim()
  if (!name) return ''
  return `https://github.com/${name}`
}
