export interface GasClump {
  cx: number
  cy: number
  cz: number
  rx: number
  ry: number
  rz: number
  tiltX: number
  tiltY: number
  tiltZ: number
  weight: number
  filDx: number
  filDy: number
  filDz: number
  pillar: boolean
}

export interface GasClumpField {
  clumps: GasClump[]
  weightSum: number
  morphology: number
}

export interface EllipsoidSample {
  lx: number
  ly: number
  lz: number
  density: number
}

export interface FilamentSample {
  lx: number
  ly: number
  lz: number
  density: number
  stretch: number
}

export interface GasCloudParticle {
  lx: number
  ly: number
  lz: number
  density: number
  stretch: number
}

export interface GasDustParticle {
  lx: number
  ly: number
  lz: number
  density: number
}
