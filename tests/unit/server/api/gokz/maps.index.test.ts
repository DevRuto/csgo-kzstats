import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/maps/index.get'
import { getMapImages, gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/maps', () => {
  beforeEach(() => {
    gokzDb.mockReset()
    getMapImages.mockReset()
  })

  it('lists maps with no filter when search is blank', async () => {
    const db = fakeDb([
      { MapID: 1, Name: 'kz_map1', InRankedPool: 1, LastPlayed: '2026-01-01', CourseCount: 2 }
    ])
    gokzDb.mockReturnValue(db)
    getMapImages.mockResolvedValue(new Map([['kz_map1', 'https://example.com/1.webp']]))

    const result = await handler(mockEvent())

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).not.toContain('WHERE m.Name')
    expect(params).toEqual([])
    expect(result).toEqual([
      {
        id: 1,
        name: 'kz_map1',
        inRankedPool: true,
        lastPlayed: '2026-01-01',
        courseCount: 2,
        image: 'https://example.com/1.webp'
      }
    ])
  })

  it('filters by name with a LIKE wildcard when search is provided', async () => {
    const db = fakeDb([])
    gokzDb.mockReturnValue(db)
    getMapImages.mockResolvedValue(new Map())

    await handler(mockEvent({ query: { search: 'map1' } }))

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('WHERE m.Name LIKE ?')
    expect(params).toEqual(['%map1%'])
  })

  it('falls back to null image when no map-images entry exists', async () => {
    const db = fakeDb([{ MapID: 1, Name: 'kz_unknown', InRankedPool: 0, LastPlayed: null, CourseCount: 0 }])
    gokzDb.mockReturnValue(db)
    getMapImages.mockResolvedValue(new Map())

    const result = await handler(mockEvent())

    expect(result[0]).toMatchObject({ image: null, inRankedPool: false, lastPlayed: null })
  })
})
