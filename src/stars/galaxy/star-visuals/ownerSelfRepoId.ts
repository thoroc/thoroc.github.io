export const ownerSelfRepoId = (owner: string, repoName?: string): string => {
  const name = String(owner || '')
    .trim()
    .toLowerCase()
  if (!name) return ''
  const repo = String(repoName || name)
    .trim()
    .toLowerCase()
  if (repo !== name) return ''
  return `${name}-${name}`
}
