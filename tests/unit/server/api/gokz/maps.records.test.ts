import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/maps/[map]/records.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/maps/[map]/records', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('requires a map name', async () => {
    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Map name is required'
    })
  })

  it('rejects an invalid mode', async () => {
    await expect(
      handler(mockEvent({ params: { map: 'kz_map1' }, query: { mode: '9' } }))
    ).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Invalid mode' })
  })

  it('404s when the map/course combination does not exist', async () => {
    gokzDb.mockReturnValue(fakeDb([]))

    await expect(handler(mockEvent({ params: { map: 'kz_missing' } }))).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Map or course not found'
    })
  })

  it('looks up the course, then queries records with the resolved MapCourseID', async () => {
    const db = fakeDb(
      [{ MapCourseID: 42 }],
      [{ SteamID32: 111, Alias: 'Player1', Country: 'US', RunTime: 1000, Teleports: 0, Created: '2026-01-01' }]
    )
    gokzDb.mockReturnValue(db)

    const result = await handler(mockEvent({ params: { map: 'kz_map1' }, query: { course: '1', limit: '9999' } }))

    expect(db.query).toHaveBeenNthCalledWith(1, expect.any(String), ['kz_map1', 1])
    const [sql, params] = db.query.mock.calls[1]
    expect(sql).toContain('Teleports = 0')
    expect(params).toEqual([42, 2, 42, 2, 200])
    expect(result).toEqual([
      { rank: 1, steamId32: 111, alias: 'Player1', country: 'US', runTimeMs: 1000, teleports: 0, createdAt: '2026-01-01' }
    ])
  })

  it('uses the tp teleport condition when type=tp', async () => {
    const db = fakeDb([{ MapCourseID: 42 }], [])
    gokzDb.mockReturnValue(db)

    await handler(mockEvent({ params: { map: 'kz_map1' }, query: { type: 'tp' } }))

    const [sql] = db.query.mock.calls[1]
    expect(sql).toContain('Teleports > 0')
  })
})
