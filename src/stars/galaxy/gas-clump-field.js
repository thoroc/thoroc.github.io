import { COSMIC_UNIVERSE } from './constants.js'
import { galaxyFrameAngles, rotateGalaxyLocal } from './galaxy-field.js'
import { gauss3, hashSeed, hashStr, hashUnit } from './hash.js'

/**
 * 多 clump 气体场：椭球团 + 丝状链，模拟真实星云结构
 */
export function buildGasClumpField(lang, galaxyR) {
  const h = hashStr(`gas-mono:${lang}`)
  const gR = galaxyR
  const { GAS_DISK_RADIUS_MULT, GAS_DISK_RADIUS_JITTER } = COSMIC_UNIVERSE
  const diskR = GAS_DISK_RADIUS_MULT + hashUnit(h, 1) * GAS_DISK_RADIUS_JITTER
  const frame = galaxyFrameAngles(lang)
  const clumpCount = 3 + Math.floor(hashUnit(h, 2) * 4)

  /** @type {Array<{ cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, tiltX: number, tiltY: number, tiltZ: number, weight: number, filDx: number, filDy: number, filDz: number, pillar: boolean }>} */
  const clumps = []
  let weightSum = 0

  for (let ci = 0; ci < clumpCount; ci += 1) {
    const ch = hashStr(`gas-clump:${lang}:${ci}`)
    const ang = hashUnit(ch, 0) * Math.PI * 2
    const dist = gR * (0.08 + hashUnit(ch, 1) * 0.68)
    const scale = 0.34 + hashUnit(ch, 3) * 0.48
    const filAng = hashUnit(ch, 9) * Math.PI * 2
    const weight = 0.45 + hashUnit(ch, 8) * 1.15
    const pillar = hashUnit(ch, 11) < 0.38
    const rxBase = gR * diskR * scale * (0.88 + hashUnit(ch, 4) * 0.42)
    const ryBase = gR * diskR * scale * (0.68 + hashUnit(ch, 5) * 0.38)
    const rzBase = gR * diskR * scale * (0.82 + hashUnit(ch, 6) * 0.4)
    clumps.push({
      cx: Math.cos(ang) * dist,
      cy: (hashUnit(ch, 2) - 0.5) * gR * (pillar ? 0.28 : 0.22),
      cz: Math.sin(ang) * dist,
      rx: pillar ? rxBase * 0.32 : rxBase,
      ry: pillar ? ryBase * (2.1 + hashUnit(ch, 12) * 0.9) : ryBase,
      rz: pillar ? rzBase * 0.34 : rzBase,
      tiltX: frame.tiltX,
      tiltY: frame.tiltY,
      tiltZ: frame.tiltZ + (hashUnit(ch, 7) - 0.5) * 0.45,
      weight,
      filDx: pillar ? 0 : Math.cos(filAng),
      filDy: pillar ? 1 : (hashUnit(ch, 10) - 0.5) * 0.32,
      filDz: pillar ? 0 : Math.sin(filAng),
      pillar,
    })
    weightSum += weight
  }

  if (!clumps.length) {
    clumps.push({
      cx: 0,
      cy: 0,
      cz: 0,
      rx: gR * diskR * 0.72,
      ry: gR * diskR * 0.58,
      rz: gR * diskR * 0.68,
      tiltX: frame.tiltX,
      tiltY: frame.tiltY,
      tiltZ: frame.tiltZ,
      weight: 1,
      filDx: 1,
      filDy: 0,
      filDz: 0,
      pillar: false,
    })
    weightSum = 1
  }

  return { clumps, weightSum, morphology: 2 }
}

function pickGasClump(h, field) {
  const clumps = field.clumps
  let target = hashUnit(h, 0) * field.weightSum
  for (let i = 0; i < clumps.length; i += 1) {
    target -= clumps[i].weight
    if (target <= 0) return clumps[i]
  }
  return clumps[clumps.length - 1]
}

/** 在椭球/尘柱体内采样 */
function sampleEllipsoidVolume(h, rx, ry, rz, tier, pillar = false) {
  const u = hashUnit(h, 6)
  const v = hashUnit(h, 7)
  const w = hashUnit(h, 8)
  let lx
  let ly
  let lz
  let radial
  if (pillar) {
    const theta = Math.PI * 2 * u
    radial = w ** 1.15 * (0.82 + tier * 0.14)
    lx = Math.cos(theta) * radial * rx
    lz = Math.sin(theta) * radial * rz
    ly = (v * 2 - 1) * ry * (0.55 + radial * 0.45)
  } else {
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    radial = w ** 1.48 * (0.88 + tier * 0.16)
    const sr = Math.sin(phi)
    lx = sr * Math.cos(theta) * radial * rx
    ly = Math.cos(phi) * radial * ry
    lz = sr * Math.sin(theta) * radial * rz
  }
  const bulge = Math.exp(-radial * radial * (pillar ? 1.8 : 2.2))
  const edgeFade = 1.0 - smoothstep(pillar ? 0.68 : 0.72, 0.98, radial)
  const density = (0.16 + bulge * 0.38 + hashUnit(h, 9) * 0.1) * edgeFade
  const wisp = 0.14 * (1 - radial * 0.55)
  lx +=
    gauss3(hashSeed(h, 'w1'), hashSeed(h, 'w2'), hashSeed(h, 'w3')) * rx * wisp
  ly +=
    gauss3(hashSeed(h, 'w4'), hashSeed(h, 'w5'), hashSeed(h, 'w6')) * ry * wisp
  lz +=
    gauss3(hashSeed(h, 'w7'), hashSeed(h, 'w8'), hashSeed(h, 'w9')) * rz * wisp
  return { lx, ly, lz, density }
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function normalize3(x, y, z) {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

function sampleFilamentParticle(h, cl) {
  const chainT = hashUnit(h, 2)
  const chainLen = cl.rx * (0.58 + hashUnit(h, 3) * 1.35)
  const perpAng = hashUnit(h, 4) * Math.PI * 2
  const perpR =
    cl.rx * 0.16 * (1 - Math.abs(chainT - 0.5) * 1.2) * hashUnit(h, 5)
  const [dx, dy, dz] = normalize3(cl.filDx ?? 1, cl.filDy ?? 0, cl.filDz ?? 0)
  let px = dy * Math.sin(perpAng) - dz * Math.cos(perpAng)
  let py = dz * Math.sin(perpAng) - dx * Math.cos(perpAng)
  let pz = dx * Math.sin(perpAng) - dy * Math.cos(perpAng)
  ;[px, py, pz] = normalize3(px, py, pz)

  const along = (chainT - 0.5) * chainLen
  let lx = cl.cx + dx * along + px * perpR
  let ly = cl.cy + dy * along + py * perpR * 0.65
  let lz = cl.cz + dz * along + pz * perpR

  const wisp = 0.1 * cl.rx
  lx += gauss3(hashSeed(h, 'f1'), hashSeed(h, 'f2'), hashSeed(h, 'f3')) * wisp
  ly +=
    gauss3(hashSeed(h, 'f4'), hashSeed(h, 'f5'), hashSeed(h, 'f6')) *
    wisp *
    0.55
  lz += gauss3(hashSeed(h, 'f7'), hashSeed(h, 'f8'), hashSeed(h, 'f9')) * wisp

  const radial = Math.abs(chainT - 0.5) * 2
  const edgeFade = 1.0 - smoothstep(0.52, 0.96, radial)
  const density = (0.2 + (1 - radial) * 0.38 + hashUnit(h, 9) * 0.14) * edgeFade
  const stretch = 0.48 + hashUnit(h, 10) * 0.52
  return { lx, ly, lz, density, stretch }
}

/**
 * 单粒气体云：丝状链 + 椭球体混合采样
 * @returns {{ lx: number, ly: number, lz: number, density: number, stretch: number }}
 */
export function sampleGasCloudParticle(h, field) {
  const cl = pickGasClump(h, field)
  const useFilament = !cl.pillar && hashUnit(h, 0) < 0.52

  let local
  let stretch
  if (useFilament) {
    local = sampleFilamentParticle(h, cl)
    stretch = local.stretch
  } else {
    const tier = hashUnit(h, 1)
    const ell = sampleEllipsoidVolume(h, cl.rx, cl.ry, cl.rz, tier, !!cl.pillar)
    local = {
      lx: cl.cx + ell.lx,
      ly: cl.cy + ell.ly,
      lz: cl.cz + ell.lz,
      density: ell.density * (cl.pillar ? 1.08 : 1.0),
    }
    stretch = cl.pillar
      ? 0.08 + hashUnit(h, 13) * 0.12
      : 0.12 + hashUnit(h, 13) * 0.28
  }

  const [rx, ry, rz] = rotateGalaxyLocal(
    local.lx,
    local.ly,
    local.lz,
    cl.tiltX,
    cl.tiltZ,
    cl.tiltY ?? 0,
  )
  return {
    lx: rx,
    ly: ry,
    lz: rz,
    density: local.density,
    stretch,
  }
}

/**
 * 暗尘采样：偏向 clump 中心高密度区
 * @returns {{ lx: number, ly: number, lz: number, density: number }}
 */
export function sampleGasDustParticle(h, field) {
  const cl = pickGasClump(h, field)
  const tier = hashUnit(h, 1) * 0.42
  const shrink = 0.52 + hashUnit(h, 2) * 0.22
  const ell = sampleEllipsoidVolume(
    h,
    cl.rx * shrink,
    cl.ry * shrink,
    cl.rz * shrink,
    tier,
  )
  const [rx, ry, rz] = rotateGalaxyLocal(
    cl.cx + ell.lx,
    cl.cy + ell.ly,
    cl.cz + ell.lz,
    cl.tiltX,
    cl.tiltZ,
    cl.tiltY ?? 0,
  )
  return {
    lx: rx,
    ly: ry,
    lz: rz,
    density: 0.48 + ell.density * 0.52,
  }
}
