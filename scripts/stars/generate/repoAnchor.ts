export const repoAnchor = (fullName: string): string =>
  fullName.toLowerCase().replace(/\//g, '-')
