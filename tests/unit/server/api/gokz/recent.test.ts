import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/recent.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/recent', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('maps recent runs, deriving modeName and isPro', async () => {
    gokzDb.mockReturnValue(
      fakeDb([
        {
          TimeID: 1,
          SteamID32: 111,
          Alias: 'Player1',
          Country: 'US',
          MapName: 'kz_map1',
          Course: 0,
          Mode: 2,
          Teleports: 0,
          RunTime: 12345,
          Created: '2026-01-01 00:00:00'
        },
        {
          TimeID: 2,
          SteamID32: 222,
          Alias: null,
          Country: null,
          MapName: 'kz_map2',
          Course: 1,
          Mode: 0,
          Teleports: 3,
          RunTime: 54321,
          Created: '2026-01-02 00:00:00'
        }
      ])
    )

    const result = await handler(mockEvent())

    expect(result).toEqual([
      {
        id: 1,
        steamId32: 111,
        alias: 'Player1',
        country: 'US',
        map: 'kz_map1',
        course: 0,
        mode: 2,
        modeName: 'KZTimer',
        teleports: 0,
        runTimeMs: 12345,
        isPro: true,
        createdAt: '2026-01-01 00:00:00'
      },
      {
        id: 2,
        steamId32: 222,
        alias: null,
        country: null,
        map: 'kz_map2',
        course: 1,
        mode: 0,
        modeName: 'Vanilla',
        teleports: 3,
        runTimeMs: 54321,
        isPro: false,
        createdAt: '2026-01-02 00:00:00'
      }
    ])
  })
})
