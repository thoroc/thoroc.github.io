// Regression oracle for the stars TS-conversion plan (Phase 1).
//
// Calls computeGalaxyLayout() directly, in-process, against the frozen
// fixture — never via `bun run generate:stars`, which hits the live GitHub
// API and previously produced a false-positive "regression" from star-count
// drift between two live fetches an hour apart.
//
// Usage:
//   bun test-support/verify-galaxy-oracle.mjs check       # diff against the committed baseline
//   bun test-support/verify-galaxy-oracle.mjs freeze      # (re)write the committed baseline
//   bun test-support/verify-galaxy-oracle.mjs determinism # run twice, confirm identical

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeGalaxyLayout } from '../scripts/stars/compute-galaxy-layout.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'stars.fixture.json')
const BASELINE_PATH = path.join(__dirname, 'fixtures', 'galaxy.baseline.json')

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, sortKeysDeep(value[k])]),
    )
  }
  return value
}

function deepEqual(a, b) {
  return JSON.stringify(sortKeysDeep(a)) === JSON.stringify(sortKeysDeep(b))
}

function runDeterminismCheck(items, log) {
  const a = computeGalaxyLayout(items)
  const b = computeGalaxyLayout(items)
  if (deepEqual(a, b)) {
    log('DETERMINISTIC: two in-process calls produced identical output')
    return 0
  }
  log('NON-DETERMINISTIC: two in-process calls against the same input diverged')
  return 1
}

function runFreeze(items, log) {
  const galaxy = computeGalaxyLayout(items)
  writeFileSync(BASELINE_PATH, JSON.stringify(galaxy))
  log(`Wrote baseline: ${BASELINE_PATH}`)
  return 0
}

function runCheck(items, log) {
  const galaxy = computeGalaxyLayout(items)
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
  if (deepEqual(galaxy, baseline)) {
    log(
      'IDENTICAL: current computeGalaxyLayout() output matches the frozen baseline',
    )
    return 0
  }
  log('DIVERGED: current output does not match the frozen baseline')
  return 1
}

export function main(mode, items, log) {
  if (mode === 'determinism') return runDeterminismCheck(items, log)
  if (mode === 'freeze') return runFreeze(items, log)
  if (mode === 'check') return runCheck(items, log)
  log(
    'Usage: bun test-support/verify-galaxy-oracle.mjs <check|freeze|determinism>',
  )
  return 1
}

if (import.meta.main) {
  const items = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')).items
  process.exit(main(process.argv[2], items, console.log))
}
