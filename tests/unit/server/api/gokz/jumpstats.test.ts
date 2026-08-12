import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/jumpstats.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/jumpstats', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('defaults to mode=2 (KZTimer), type=1 (Bunnyhop), limit=100 and unscales fixed-point columns', async () => {
    const db = fakeDb([
      {
        SteamID32: 111,
        Alias: 'Player1',
        Country: 'US',
        Distance: 2500000,
        Strafes: 8,
        Sync: 9500,
        Pre: 100,
        Max: 25000,
        Created: '2026-01-01 00:00:00'
      }
    ])
    gokzDb.mockReturnValue(db)

    const result = await handler(mockEvent())

    expect(db.query).toHaveBeenCalledWith(expect.any(String), [1, 2, 1, 2, 100])
    expect(result).toEqual([
      {
        rank: 1,
        steamId32: 111,
        alias: 'Player1',
        country: 'US',
        distance: 250,
        strafes: 8,
        sync: 95,
        pre: 1,
        max: 250,
        createdAt: '2026-01-01 00:00:00'
      }
    ])
  })

  it('passes through explicit mode/type and clamps limit to 200', async () => {
    const db = fakeDb([])
    gokzDb.mockReturnValue(db)

    await handler(mockEvent({ query: { mode: '1', type: '0', limit: '9999' } }))

    expect(db.query).toHaveBeenCalledWith(expect.any(String), [0, 1, 0, 1, 200])
  })

  it('rejects an invalid mode', async () => {
    await expect(handler(mockEvent({ query: { mode: '7' } }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid mode'
    })
  })

  it('rejects an invalid jump type', async () => {
    await expect(handler(mockEvent({ query: { type: '99' } }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid jump type'
    })
  })
})
