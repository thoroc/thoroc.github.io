import { describe, expect, it, spyOn } from 'bun:test'
import { reportFetchProgress } from './reportFetchProgress'

describe('reportFetchProgress', () => {
  it('logs an in-progress message by default', () => {
    const log = spyOn(console, 'log').mockImplementation(() => undefined)
    reportFetchProgress(2, 150)
    expect(log).toHaveBeenCalledWith('Fetching page 2… (150 so far)')
    log.mockRestore()
  })

  it('logs a completion message when done', () => {
    const log = spyOn(console, 'log').mockImplementation(() => undefined)
    reportFetchProgress(3, 250, { done: true })
    expect(log).toHaveBeenCalledWith('Fetched 250 starred repos')
    log.mockRestore()
  })
})
