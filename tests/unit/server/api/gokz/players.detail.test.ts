import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/players/[steamId32]/index.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/players/[steamId32]', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('rejects a non-numeric steamId32', async () => {
    await expect(handler(mockEvent({ params: { steamId32: 'not-a-number' } }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid SteamID32'
    })
    expect(gokzDb).not.toHaveBeenCalled()
  })

  it('404s when the player is not found', async () => {
    gokzDb.mockReturnValue(fakeDb([]))

    await expect(handler(mockEvent({ params: { steamId32: '111' } }))).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Player not found'
    })
  })

  it('returns the player on success', async () => {
    gokzDb.mockReturnValue(fakeDb([{ SteamID32: 111, Alias: 'Player1', Country: 'US' }]))

    const result = await handler(mockEvent({ params: { steamId32: '111' } }))

    expect(result).toEqual({ steamId32: 111, alias: 'Player1', country: 'US' })
  })
})
