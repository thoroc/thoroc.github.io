export interface GalaxyLayout {
  version: number
  anchorId: string | null
  positions: number[]
}

export interface VirtualStarRef {
  virtualKey: string
  repoId: string
}
