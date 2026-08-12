import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/maps/[map]/index.get'
import { getMapImage, gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/maps/[map]', () => {
  beforeEach(() => {
    gokzDb.mockReset()
    getMapImage.mockReset()
  })

  it('requires a map name', async () => {
    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Map name is required'
    })
    expect(gokzDb).not.toHaveBeenCalled()
  })

  it('404s when the map does not exist', async () => {
    gokzDb.mockReturnValue(fakeDb([]))

    await expect(handler(mockEvent({ params: { map: 'kz_missing' } }))).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Map not found'
    })
  })

  it('returns the map with its courses and image', async () => {
    gokzDb.mockReturnValue(
      fakeDb(
        [{ MapID: 1, Name: 'kz_map1', InRankedPool: 1, LastPlayed: '2026-01-01', Created: '2025-01-01' }],
        [
          { MapCourseID: 10, Course: 0 },
          { MapCourseID: 11, Course: 1 }
        ]
      )
    )
    getMapImage.mockResolvedValue('https://example.com/1.webp')

    const result = await handler(mockEvent({ params: { map: 'kz_map1' } }))

    expect(result).toEqual({
      id: 1,
      name: 'kz_map1',
      inRankedPool: true,
      lastPlayed: '2026-01-01',
      createdAt: '2025-01-01',
      courses: [
        { mapCourseId: 10, course: 0 },
        { mapCourseId: 11, course: 1 }
      ],
      image: 'https://example.com/1.webp'
    })
  })
})
