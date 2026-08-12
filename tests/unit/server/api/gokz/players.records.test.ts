import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/players/[steamId32]/records.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/players/[steamId32]/records', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('rejects a non-numeric steamId32', async () => {
    await expect(handler(mockEvent({ params: { steamId32: 'nope' } }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid SteamID32'
    })
  })

  it('rejects an invalid mode', async () => {
    await expect(
      handler(mockEvent({ params: { steamId32: '111' }, query: { mode: '9' } }))
    ).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Invalid mode' })
  })

  it('queries with the steamId32, mode and teleport condition, and shapes the rows', async () => {
    const db = fakeDb([
      { MapName: 'kz_map1', Course: 0, RunTime: 12345, Rank: 3, Teleports: 0, Created: '2026-01-01' }
    ])
    gokzDb.mockReturnValue(db)

    const result = await handler(mockEvent({ params: { steamId32: '111' } }))

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('Teleports = 0')
    expect(params).toEqual([2, 2, 111])
    expect(result).toEqual([
      { map: 'kz_map1', course: 0, rank: 3, runTimeMs: 12345, teleports: 0, createdAt: '2026-01-01' }
    ])
  })

  it('uses the tp teleport condition when type=tp', async () => {
    const db = fakeDb([])
    gokzDb.mockReturnValue(db)

    await handler(mockEvent({ params: { steamId32: '111' }, query: { type: 'tp' } }))

    const [sql] = db.query.mock.calls[0]
    expect(sql).toContain('Teleports > 0')
  })
})
