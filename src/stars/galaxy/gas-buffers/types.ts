export interface GasBuffers {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  phases: Float32Array
  softness: Float32Array
  density: Float32Array
  stretch: Float32Array
}

export interface DustBuffers {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  density: Float32Array
}

export interface GalaxyLayoutLike {
  spreadFactor?: number
  languages?: string[]
  langCounts?: Map<string, number>
  langKeys?: Set<string>
}

export interface LanguageEmitCtx {
  hubs: Map<string, number[]>
  layout: GalaxyLayoutLike
  total: number
  sf: number
  perGalaxy: number
  corePerGalaxy: number
}

export interface FieldKernel {
  lang?: string
}

export interface GasField {
  kernels: Map<string, FieldKernel>
  span: number
  coreR: number
}
