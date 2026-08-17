import { hashSeed } from './hashSeed'

/** 0..1 均匀随机；用独立子种子，避免高位 shift 后精度塌陷 */
export const hashUnit = (h: number, shift = 0): number =>
  (hashSeed(h, `unit:${shift}`) >>> 0) / 4294967296
