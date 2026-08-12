import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/players/[steamId]/records.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/players/[steamId]/records', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('requires a steamId', async () => {
    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'SteamID is required'
    })
  })

  it('defaults to the pro columns (runtimepro/teleports_pro)', async () => {
    const db = fakeDb([{ mapname: 'kz_map1', runtime: '10.5', teleports: 0, rnk: 1 }])
    kztimerDb.mockReturnValue(db)

    const result = await handler(mockEvent({ params: { steamId: 'STEAM_1:0:1' } }))

    const [sql, params] = db.query.mock.calls[0]
    expect(sql).toContain('runtimepro AS runtime')
    expect(sql).toContain('teleports_pro AS teleports')
    expect(params).toEqual(['STEAM_1:0:1'])
    expect(result).toEqual([{ map: 'kz_map1', rank: 1, runTime: 10.5, teleports: 0 }])
  })

  it('uses the tp (non-pro) columns when type=tp', async () => {
    const db = fakeDb([])
    kztimerDb.mockReturnValue(db)

    await handler(mockEvent({ params: { steamId: 'STEAM_1:0:1' }, query: { type: 'tp' } }))

    const [sql] = db.query.mock.calls[0]
    expect(sql).toContain('runtime AS runtime')
    expect(sql).not.toContain('runtimepro')
    expect(sql).toContain('teleports AS teleports')
    expect(sql).not.toContain('teleports_pro')
  })
})
