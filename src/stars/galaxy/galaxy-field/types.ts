export interface FrameAngles {
  tiltX: number
  tiltY: number
  tiltZ: number
}

export interface GalaxyKernel {
  cx: number
  cy: number
  cz: number
  sigma: number
  frame: FrameAngles
  lang: string
}

export interface CosmicLanguageField {
  kernels: Map<string, GalaxyKernel>
  span: number
  coreR: number
}

export interface GalaxyLayoutLike {
  languages?: string[]
  langCounts?: Map<string, number>
  langKeys?: Set<string>
}

export interface LayoutItemLike {
  language?: string | null
}
