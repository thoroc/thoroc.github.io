import { hashStr } from './hashStr'

export const hashSeed = (base: unknown, salt: unknown): number =>
  hashStr(`${base}::${salt}`)
