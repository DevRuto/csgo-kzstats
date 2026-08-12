import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/players/[steamId]/index.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/players/[steamId]', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('requires a steamId', async () => {
    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'SteamID is required'
    })
    expect(kztimerDb).not.toHaveBeenCalled()
  })

  it('404s when the player is not found', async () => {
    kztimerDb.mockReturnValue(fakeDb([]))

    await expect(handler(mockEvent({ params: { steamId: 'STEAM_1:0:1' } }))).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Player not found'
    })
  })

  it('returns the player on success', async () => {
    kztimerDb.mockReturnValue(
      fakeDb([
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
    )

    const result = await handler(mockEvent({ params: { steamId: 'STEAM_1:0:1' } }))

    expect(result).toEqual({
      steamId: 'STEAM_1:0:1',
      name: 'Player1',
      country: 'US',
      points: 5000,
      finishedMaps: 20,
      finishedMapsPro: 15,
      finishedMapsTp: 5,
      lastSeen: '2026-01-01'
    })
  })
})
