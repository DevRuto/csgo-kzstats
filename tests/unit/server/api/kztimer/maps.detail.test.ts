import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/maps/[map]/index.get'
import { getMapImage, kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/maps/[map]', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
    getMapImage.mockReset()
  })

  it('requires a map name', async () => {
    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Map name is required'
    })
  })

  it('404s when no players have played the map', async () => {
    kztimerDb.mockReturnValue(fakeDb([{ players: 0 }]))

    await expect(handler(mockEvent({ params: { map: 'kz_empty' } }))).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  })

  it('returns player count and image on success', async () => {
    kztimerDb.mockReturnValue(fakeDb([{ players: 12 }]))
    getMapImage.mockResolvedValue('https://example.com/1.webp')

    const result = await handler(mockEvent({ params: { map: 'kz_map1' } }))

    expect(result).toEqual({ name: 'kz_map1', players: 12, image: 'https://example.com/1.webp' })
  })
})
