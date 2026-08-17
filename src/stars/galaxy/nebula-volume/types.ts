import type { IUniform, Matrix4, Vector3 } from 'three'

export type LangRgb = [number, number, number]
export type Ellipsoid = [number, number, number]

export interface NebulaMaterialUniforms {
  uTime: IUniform<number>
  uLangTint: IUniform<Vector3>
  uEllipsoid: IUniform<Vector3>
  uSeed: IUniform<number>
  uStepCount: IUniform<number>
  uInvModelMatrix: IUniform<Matrix4>
}

export interface NebulaMeshOptions {
  isField?: boolean
}

export interface SharedUniforms {
  uTime?: { value: number }
}
