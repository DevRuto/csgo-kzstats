import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/maps/[map]/records.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/maps/[map]/records', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('requires a map name', async () => {
    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Map name is required'
    })
  })

  it('defaults to the pro columns (runtimepro/teleports_pro)', async () => {
    const db = fakeDb([{ steamid: 'STEAM_1:0:1', name: 'Player1', runtime: '10.5', teleports: 0 }])
    kztimerDb.mockReturnValue(db)

    const result = await handler(mockEvent({ params: { map: 'kz_map1' } }))

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('runtimepro AS runtime')
    expect(sql).toContain('teleports_pro AS teleports')
    expect(params).toEqual(['kz_map1', 100])
    expect(result).toEqual([{ rank: 1, steamId: 'STEAM_1:0:1', name: 'Player1', runTime: 10.5, teleports: 0 }])
  })

  it('uses the tp (non-pro) columns and clamps limit when type=tp', async () => {
    const db = fakeDb([])
    kztimerDb.mockReturnValue(db)

    await handler(mockEvent({ params: { map: 'kz_map1' }, query: { type: 'tp', limit: '9999' } }))

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('runtime AS runtime')
    expect(sql).not.toContain('runtimepro')
    expect(sql).toContain('teleports AS teleports')
    expect(sql).not.toContain('teleports_pro')
    expect(params).toEqual(['kz_map1', 200])
  })
})
