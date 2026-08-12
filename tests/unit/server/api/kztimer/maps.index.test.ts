import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/maps/index.get'
import { getMapImages, kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/maps', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
    getMapImages.mockReset()
  })

  it('lists maps with no filter when search is blank', async () => {
    const db = fakeDb([{ mapname: 'kz_map1', players: 12 }])
    kztimerDb.mockReturnValue(db)
    getMapImages.mockResolvedValue(new Map([['kz_map1', 'https://example.com/1.webp']]))

    const result = await handler(mockEvent())

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).not.toContain('WHERE')
    expect(params).toEqual([])
    expect(result).toEqual([{ name: 'kz_map1', players: 12, image: 'https://example.com/1.webp' }])
  })

  it('filters by mapname with a LIKE wildcard when search is provided', async () => {
    const db = fakeDb([])
    kztimerDb.mockReturnValue(db)
    getMapImages.mockResolvedValue(new Map())

    await handler(mockEvent({ query: { search: 'map1' } }))

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('WHERE mapname LIKE ?')
    expect(params).toEqual(['%map1%'])
  })
})
