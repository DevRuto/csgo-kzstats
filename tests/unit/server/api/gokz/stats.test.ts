import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/gokz/stats.get'
import { gokzDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/gokz/stats', () => {
  beforeEach(() => {
    gokzDb.mockReset()
  })

  it('aggregates map/player counts and per-mode run counts', async () => {
    gokzDb.mockReturnValue(
      fakeDb(
        [{ count: 12 }],
        [{ count: 340 }],
        [
          { Mode: 0, runs: 10, players: 4 },
          { Mode: 2, runs: 500, players: 90 }
        ]
      )
    )

    const result = await handler(mockEvent())

    expect(result).toEqual({
      maps: 12,
      players: 340,
      modes: [
        { mode: 0, name: 'Vanilla', runs: 10, players: 4 },
        { mode: 2, name: 'KZTimer', runs: 500, players: 90 }
      ]
    })
  })
})
