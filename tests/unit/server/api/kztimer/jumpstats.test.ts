import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/jumpstats.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/jumpstats', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('rejects an unknown jump type', async () => {
    await expect(handler(mockEvent({ query: { type: 'nope' } }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid jump type'
    })
  })

  it('defaults to lj and selects the matching column prefix', async () => {
    const db = fakeDb([
      { steamid: 'STEAM_1:0:1', name: 'Player1', record: '250.5', pre: '10', max: '15', strafes: 8, sync: 95 }
    ])
    kztimerDb.mockReturnValue(db)

    const result = await handler(mockEvent())

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('`ljrecord`')
    expect(params).toEqual([100])
    expect(result).toEqual([
      { rank: 1, steamId: 'STEAM_1:0:1', name: 'Player1', record: 250.5, pre: 10, max: 15, strafes: 8, sync: 95 }
    ])
  })

  it('uses the matching prefix for a different jump type and clamps limit', async () => {
    const db = fakeDb([])
    kztimerDb.mockReturnValue(db)

    await handler(mockEvent({ query: { type: 'multibhop', limit: '9999' } }))

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('`multibhoprecord`')
    expect(params).toEqual([200])
  })
})
