import { nebulaDustRgb, nebulaLangTint, repoLangRgb } from './colors.js'
import { COSMIC_UNIVERSE } from './constants.js'
import { gauss3, hashSeed, hashStr, hashUnit } from './hash'
import {
  buildCosmicLanguageField,
  buildGasClumpField,
  buildLanguageGalaxyHubs,
  galaxyFrameAngles,
  galaxyRadiusForLanguage,
  qualifyingGasLanguages,
  rotateGalaxyLocal,
  sampleGasCloudParticle,
  sampleGasDustParticle,
} from './morphological-layout.js'

/** 单个语言星系的气体云粒子（弥散 + 核心两层）+ 该语系核心半径 */
function emitLanguageGasParticles(lang, ctx, buffers, o) {
  const { hubs, layout, total, sf, perGalaxy, corePerGalaxy } = ctx
  const { positions, colors, sizes, phases, softness, density, stretch } =
    buffers
  const hub = hubs.get(lang) ?? [0, 0, 0]
  const gR = galaxyRadiusForLanguage(lang, layout, total) * sf
  const [br, bg, bb] = repoLangRgb(lang)
  const { tiltX, tiltY, tiltZ } = galaxyFrameAngles(lang)
  const gasField = buildGasClumpField(lang, gR)
  const morphStretch =
    gasField.morphology === 3
      ? 0.22
      : gasField.morphology === 4
        ? 0.18
        : gasField.morphology === 2
          ? 0.14
          : 0.06

  for (let j = 0; j < perGalaxy; j += 1) {
    const h = hashStr(`galaxy-gas:${lang}:${j}`)
    const particle = sampleGasCloudParticle(h, gasField)
    const [rx, ry, rz] = rotateGalaxyLocal(
      particle.lx,
      particle.ly,
      particle.lz,
      tiltX,
      tiltZ,
      tiltY,
    )
    const d = particle.density

    positions[o * 3] = hub[0] * sf + rx
    positions[o * 3 + 1] = hub[1] * sf + ry
    positions[o * 3 + 2] = hub[2] * sf + rz

    const [nr, ng, nb] = nebulaLangTint([br, bg, bb], d)
    colors[o * 3] = nr
    colors[o * 3 + 1] = ng
    colors[o * 3 + 2] = nb

    sizes[o] =
      5.2 + (1 - d) * 7.2 + d * 2.8 + hashUnit(h, 8) * (2.2 + (1 - d) * 3.4)

    phases[o] = hashUnit(h, 9) * Math.PI * 2
    softness[o] = 0.58 + (1 - d) * 0.38
    density[o] = d
    stretch[o] = (particle.stretch ?? morphStretch) + hashUnit(h, 13) * 0.22
    o += 1
  }

  for (let j = 0; j < corePerGalaxy; j += 1) {
    const h = hashStr(`galaxy-gas-core:${lang}:${j}`)
    const coreR = gR * (0.06 + hashUnit(h, 1) * 0.22)
    const ang = hashUnit(h, 2) * Math.PI * 2
    const lift = hashUnit(h, 3)
    const lx = Math.cos(ang) * coreR * (0.35 + hashUnit(h, 4) * 0.65)
    const ly = (lift - 0.5) * gR * 0.14 * (0.4 + hashUnit(h, 5) * 0.6)
    const lz = Math.sin(ang) * coreR * (0.35 + hashUnit(h, 6) * 0.65)
    const [rx, ry, rz] = rotateGalaxyLocal(lx, ly, lz, tiltX, tiltZ, tiltY)
    const d = 0.72 + hashUnit(h, 7) * 0.22

    positions[o * 3] = hub[0] * sf + rx
    positions[o * 3 + 1] = hub[1] * sf + ry
    positions[o * 3 + 2] = hub[2] * sf + rz

    const [nr, ng, nb] = nebulaLangTint([br, bg, bb], d)
    colors[o * 3] = nr
    colors[o * 3 + 1] = ng
    colors[o * 3 + 2] = nb

    sizes[o] = 14.0 + hashUnit(h, 8) * 12.0
    phases[o] = hashUnit(h, 9) * Math.PI * 2
    softness[o] = 0.38 + hashUnit(h, 10) * 0.12
    density[o] = d
    stretch[o] = morphStretch * 0.35
    o += 1
  }

  return { o, gR }
}

/** 全局背景雾气粒子（不属于任何语言星系，均匀撒在场里） */
function emitFieldGasParticles(field, sf, fieldGas, buffers, o) {
  const { positions, colors, sizes, phases, softness, density, stretch } =
    buffers
  const kernels = [...field.kernels.values()]
  const span = field.span
  const coreR = field.coreR
  for (let j = 0; j < fieldGas; j += 1) {
    const h = hashStr(`field-gas:${j}`)
    const u = hashUnit(h, 1)
    const v = hashUnit(h, 2)
    const w = hashUnit(h, 3)
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    const radial = coreR * 1.38 * Math.cbrt(w)
    let gx = radial * Math.sin(phi) * Math.cos(theta)
    let gy = radial * Math.cos(phi)
    let gz = radial * Math.sin(phi) * Math.sin(theta)
    gx +=
      gauss3(hashSeed(h, 'g1'), hashSeed(h, 'g2'), hashSeed(h, 'g3')) *
      span *
      0.04
    gy +=
      gauss3(hashSeed(h, 'g4'), hashSeed(h, 'g5'), hashSeed(h, 'g6')) *
      span *
      0.032
    gz +=
      gauss3(hashSeed(h, 'g7'), hashSeed(h, 'g8'), hashSeed(h, 'g9')) *
      span *
      0.04

    positions[o * 3] = gx * sf
    positions[o * 3 + 1] = gy * sf
    positions[o * 3 + 2] = gz * sf

    const pick =
      kernels[Math.floor(hashUnit(h, 10) * kernels.length) % kernels.length]
    const lang = pick?.lang ?? '其他'
    const [br, bg, bb] = repoLangRgb(lang)
    const d = 0.28 + hashUnit(h, 11) * 0.42
    const [nr, ng, nb] = nebulaLangTint([br, bg, bb], d)
    colors[o * 3] = nr
    colors[o * 3 + 1] = ng
    colors[o * 3 + 2] = nb
    sizes[o] = 4.8 + hashUnit(h, 13) * 7.2
    phases[o] = hashUnit(h, 14) * Math.PI * 2
    softness[o] = 0.72 + hashUnit(h, 15) * 0.24
    density[o] = d
    stretch[o] = 0.02 + hashUnit(h, 16) * 0.06
    o += 1
  }
  return { o, coreR }
}

export function buildGalaxyGasBuffers(layout, repos) {
  const { GAS_PARTICLES_PER_GALAXY, GAS_CORE_FILL_COUNT, FIELD_GAS_COUNT } =
    COSMIC_UNIVERSE
  const hubs = buildLanguageGalaxyHubs(layout)
  const field = buildCosmicLanguageField(
    layout,
    Math.max(repos?.length ?? 0, 1),
  )
  const total = Math.max(repos?.length ?? 0, 1)
  const sf = Math.min(layout.spreadFactor ?? 1, 1.32)
  const gasLangs = qualifyingGasLanguages(layout)
  const perGalaxy = GAS_PARTICLES_PER_GALAXY
  const corePerGalaxy = GAS_CORE_FILL_COUNT
  const fieldGas = FIELD_GAS_COUNT ?? 0
  const count = gasLangs.length * (perGalaxy + corePerGalaxy) + fieldGas
  if (!count) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0),
      sizes: new Float32Array(0),
      phases: new Float32Array(0),
      softness: new Float32Array(0),
      density: new Float32Array(0),
      stretch: new Float32Array(0),
      languages: [],
      langRadii: [],
      perGalaxy,
      corePerGalaxy,
      count: 0,
    }
  }

  const buffers = {
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    phases: new Float32Array(count),
    softness: new Float32Array(count),
    density: new Float32Array(count),
    stretch: new Float32Array(count),
  }
  const { positions, colors, sizes, phases, softness, density, stretch } =
    buffers
  const langRadii = []
  let o = 0

  const emitCtx = { hubs, layout, total, sf, perGalaxy, corePerGalaxy }
  for (const lang of gasLangs) {
    const emitted = emitLanguageGasParticles(lang, emitCtx, buffers, o)
    o = emitted.o
    langRadii.push(emitted.gR)
  }

  const { o: fieldGasEnd, coreR } = emitFieldGasParticles(
    field,
    sf,
    fieldGas,
    buffers,
    o,
  )
  o = fieldGasEnd

  const fieldGasStart = gasLangs.length * (perGalaxy + corePerGalaxy)
  return {
    positions,
    colors,
    sizes,
    phases,
    softness,
    density,
    stretch,
    languages: gasLangs,
    langRadii,
    perGalaxy,
    corePerGalaxy,
    fieldGasStart,
    fieldGasCount: fieldGas,
    fieldVolumeRadius: coreR * sf * 1.62,
    count,
  }
}

/** 暗尘层：与语言 gas 同 hub，采样 clump 中心 */
/** 单个语言星系的暗尘粒子（沿用该语系的 gas clump 场采样中心） */
function emitLanguageDustParticles(lang, ctx, buffers, o) {
  const { hubs, layout, total, sf, perGalaxy } = ctx
  const { positions, colors, sizes, density } = buffers
  const hub = hubs.get(lang) ?? [0, 0, 0]
  const gR = galaxyRadiusForLanguage(lang, layout, total) * sf
  const [br, bg, bb] = repoLangRgb(lang)
  const { tiltX, tiltY, tiltZ } = galaxyFrameAngles(lang)
  const gasField = buildGasClumpField(lang, gR)

  for (let j = 0; j < perGalaxy; j += 1) {
    const h = hashStr(`galaxy-dust:${lang}:${j}`)
    const particle = sampleGasDustParticle(h, gasField)
    const [rx, ry, rz] = rotateGalaxyLocal(
      particle.lx,
      particle.ly,
      particle.lz,
      tiltX,
      tiltZ,
      tiltY,
    )
    const d = particle.density

    positions[o * 3] = hub[0] * sf + rx
    positions[o * 3 + 1] = hub[1] * sf + ry
    positions[o * 3 + 2] = hub[2] * sf + rz

    const [dr, dg, db] = nebulaDustRgb([br, bg, bb], d)
    colors[o * 3] = dr
    colors[o * 3 + 1] = dg
    colors[o * 3 + 2] = db
    sizes[o] = 2.4 + d * 3.8 + hashUnit(h, 8) * 2.6
    density[o] = d
    o += 1
  }

  return o
}

/** 全局背景暗尘粒子（不属于任何语言星系，均匀撒在场里） */
function emitFieldDustParticles(field, sf, fieldDust, buffers, o) {
  const { positions, colors, sizes, density } = buffers
  const kernels = [...field.kernels.values()]
  const span = field.span
  const coreR = field.coreR
  for (let j = 0; j < fieldDust; j += 1) {
    const h = hashStr(`field-dust:${j}`)
    const u = hashUnit(h, 1)
    const v = hashUnit(h, 2)
    const w = hashUnit(h, 3)
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    const radial = coreR * 1.05 * Math.cbrt(w)
    let gx = radial * Math.sin(phi) * Math.cos(theta)
    let gy = radial * Math.cos(phi)
    let gz = radial * Math.sin(phi) * Math.sin(theta)
    gx +=
      gauss3(hashSeed(h, 'd1'), hashSeed(h, 'd2'), hashSeed(h, 'd3')) *
      span *
      0.035
    gy +=
      gauss3(hashSeed(h, 'd4'), hashSeed(h, 'd5'), hashSeed(h, 'd6')) *
      span *
      0.028
    gz +=
      gauss3(hashSeed(h, 'd7'), hashSeed(h, 'd8'), hashSeed(h, 'd9')) *
      span *
      0.035

    positions[o * 3] = gx * sf
    positions[o * 3 + 1] = gy * sf
    positions[o * 3 + 2] = gz * sf

    const pick =
      kernels[Math.floor(hashUnit(h, 10) * kernels.length) % kernels.length]
    const lang = pick?.lang ?? '其他'
    const [br, bg, bb] = repoLangRgb(lang)
    const d = 0.32 + hashUnit(h, 11) * 0.48
    const [dr, dg, db] = nebulaDustRgb([br, bg, bb], d)
    colors[o * 3] = dr
    colors[o * 3 + 1] = dg
    colors[o * 3 + 2] = db
    sizes[o] = 1.8 + hashUnit(h, 12) * 2.8
    density[o] = d
    o += 1
  }
  return o
}

export function buildGalaxyGasDustBuffers(layout, repos) {
  const { GAS_DUST_PER_GALAXY, FIELD_DUST_COUNT } = COSMIC_UNIVERSE
  const hubs = buildLanguageGalaxyHubs(layout)
  const field = buildCosmicLanguageField(
    layout,
    Math.max(repos?.length ?? 0, 1),
  )
  const total = Math.max(repos?.length ?? 0, 1)
  const sf = Math.min(layout.spreadFactor ?? 1, 1.32)
  const gasLangs = qualifyingGasLanguages(layout)
  const perGalaxy = GAS_DUST_PER_GALAXY ?? 0
  const fieldDust = FIELD_DUST_COUNT ?? 0
  const count = gasLangs.length * perGalaxy + fieldDust
  if (!count) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0),
      sizes: new Float32Array(0),
      density: new Float32Array(0),
      languages: [],
      perGalaxy,
      fieldDustStart: 0,
      fieldDustCount: 0,
      count: 0,
    }
  }

  const buffers = {
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    density: new Float32Array(count),
  }
  const { positions, colors, sizes, density } = buffers
  let o = 0

  const emitCtx = { hubs, layout, total, sf, perGalaxy }
  for (const lang of gasLangs) {
    o = emitLanguageDustParticles(lang, emitCtx, buffers, o)
  }
  o = emitFieldDustParticles(field, sf, fieldDust, buffers, o)

  const fieldDustStart = gasLangs.length * perGalaxy
  return {
    positions,
    colors,
    sizes,
    density,
    languages: gasLangs,
    perGalaxy,
    fieldDustStart,
    fieldDustCount: fieldDust,
    count,
  }
}
