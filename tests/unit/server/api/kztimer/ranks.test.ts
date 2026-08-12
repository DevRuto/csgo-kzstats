import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/ranks.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/ranks', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('ranks players by points and clamps limit to 200', async () => {
    const db = fakeDb([
      {
        steamid: 'STEAM_1:0:1',
        name: 'Player1',
        country: 'US',
        points: 5000,
        finishedmaps: 20,
        finishedmapspro: 15,
        finishedmapstp: 5,
        lastseen: '2026-01-01'
      }
    ])
    kztimerDb.mockReturnValue(db)

    const result = await handler(mockEvent({ query: { limit: '9999' } }))

    expect(db.query).toHaveBeenCalledWith(expect.any(String), [200])
    expect(result).toEqual([
      {
        rank: 1,
        steamId: 'STEAM_1:0:1',
        name: 'Player1',
        country: 'US',
        points: 5000,
        finishedMaps: 20,
        finishedMapsPro: 15,
        finishedMapsTp: 5,
        lastSeen: '2026-01-01'
      }
    ])
  })
})
