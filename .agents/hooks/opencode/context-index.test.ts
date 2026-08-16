import { describe, expect, it } from 'bun:test'
import { buildOutstandingMessage, parseContextIndex } from './context-index'

const SAMPLE = `plans:
  - path: ".context/plans/one.md"
    title: "Ship hooks"
    status: "active"
follow-ups:
  - title: "Review PR"
    status: "active"
`

describe('parseContextIndex', () => {
  it('parses the context-index subset without dependencies', () => {
    const index = parseContextIndex(SAMPLE)
    expect(index.plans[0]).toEqual({
      path: '.context/plans/one.md',
      title: 'Ship hooks',
      status: 'active',
    })
    expect(index.followUps[0]).toEqual({ title: 'Review PR', status: 'active' })
  })

  it('marks unknown lines as unparseable', () => {
    expect(parseContextIndex('plans:\n??nope??\n').unparseable).toBe('??nope??')
  })
})

describe('buildOutstandingMessage', () => {
  it('renders active follow-ups before active plans', () => {
    const message = buildOutstandingMessage(parseContextIndex(SAMPLE))
    const followUpsAt = message?.indexOf('Active Follow-ups') ?? -1
    const plansAt = message?.indexOf('Active Plans') ?? -1
    expect(followUpsAt).toBeGreaterThan(-1)
    expect(plansAt).toBeGreaterThan(followUpsAt)
  })

  it('returns undefined when nothing is active', () => {
    expect(
      buildOutstandingMessage(
        parseContextIndex('plans:\n  - title: "x"\n    status: "done"\n'),
      ),
    ).toBeUndefined()
  })
})
