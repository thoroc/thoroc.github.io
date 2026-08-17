import { describe, expect, it } from 'bun:test'
import { galaxyFrameAngles } from './galaxyFrameAngles'
import { gasCloudFrameAngles } from './gasCloudFrameAngles'

describe('gasCloudFrameAngles', () => {
  it('matches galaxyFrameAngles for the same language', () => {
    expect(gasCloudFrameAngles('Rust')).toEqual(galaxyFrameAngles('Rust'))
  })
})
