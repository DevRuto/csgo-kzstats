import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/recent.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/recent', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('maps recent runs, coercing runtime and deriving isPro', async () => {
    kztimerDb.mockReturnValue(
      fakeDb([
        { steamid: 'STEAM_1:0:1', name: 'Player1', runtime: '12.345', teleports: 0, map: 'kz_map1', date: '2026-01-01' },
        { steamid: 'STEAM_1:1:2', name: 'Player2', runtime: '54.321', teleports: 2, map: 'kz_map2', date: '2026-01-02' }
      ])
    )

    const result = await handler(mockEvent())

    expect(result).toEqual([
      { steamId: 'STEAM_1:0:1', name: 'Player1', map: 'kz_map1', runTime: 12.345, teleports: 0, isPro: true, createdAt: '2026-01-01' },
      { steamId: 'STEAM_1:1:2', name: 'Player2', map: 'kz_map2', runTime: 54.321, teleports: 2, isPro: false, createdAt: '2026-01-02' }
    ])
  })
})
