import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/players/index.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/players', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('returns an empty array without querying the db when search is blank', async () => {
    const result = await handler(mockEvent({ query: { search: '   ' } }))

    expect(result).toEqual([])
    expect(gokzDb).not.toHaveBeenCalled()
  })

  it('returns an empty array when search is omitted entirely', async () => {
    const result = await handler(mockEvent())

    expect(result).toEqual([])
    expect(gokzDb).not.toHaveBeenCalled()
  })

  it('searches by trimmed alias with a wildcard and clamps limit to 50', async () => {
    const db = fakeDb([{ SteamID32: 111, Alias: 'Player1', Country: 'US' }])
    gokzDb.mockReturnValue(db)

    const result = await handler(mockEvent({ query: { search: '  Player  ', limit: '9999' } }))

    expect(db.query).toHaveBeenCalledWith(expect.any(String), ['%Player%', 50])
    expect(result).toEqual([{ steamId32: 111, alias: 'Player1', country: 'US' }])
  })
})
