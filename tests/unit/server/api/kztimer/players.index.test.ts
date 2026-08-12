import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/players/index.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/players', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('returns an empty array without querying the db when search is blank', async () => {
    const result = await handler(mockEvent())

    expect(result).toEqual([])
    expect(kztimerDb).not.toHaveBeenCalled()
  })

  it('searches by trimmed name with a wildcard and clamps limit to 50', async () => {
    const db = fakeDb([{ steamid: 'STEAM_1:0:1', name: 'Player1', country: 'US' }])
    kztimerDb.mockReturnValue(db)

    const result = await handler(mockEvent({ query: { search: '  Player  ', limit: '9999' } }))

    expect(db.query).toHaveBeenCalledWith(expect.any(String), ['%Player%', 50])
    expect(result).toEqual([{ steamId: 'STEAM_1:0:1', name: 'Player1', country: 'US' }])
  })
})
