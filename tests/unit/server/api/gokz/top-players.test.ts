import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/top-players.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/top-players', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('defaults to pro (no teleports) and mode=2, ranking by server record count', async () => {
    const db = fakeDb([{ SteamID32: 111, Alias: 'Player1', Country: 'US', wrs: 5 }])
    gokzDb.mockReturnValue(db)

    const result = await handler(mockEvent())

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('t.Teleports = 0')
    expect(params).toEqual([2])
    expect(result).toEqual([{ rank: 1, steamId32: 111, alias: 'Player1', country: 'US', serverRecords: 5 }])
  })

  it('switches to the teleport condition when type=tp', async () => {
    const db = fakeDb([])
    gokzDb.mockReturnValue(db)

    await handler(mockEvent({ query: { type: 'tp' } }))

    const [sql] = db.query.mock.calls[0]
    expect(sql).toContain('t.Teleports > 0')
  })

  it('rejects an invalid mode', async () => {
    await expect(handler(mockEvent({ query: { mode: '7' } }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid mode'
    })
  })
})
