import { beforeEach, describe, expect, it } from 'vitest'
import handler from '~/server/api/kztimer/stats.get'
import { kztimerDb } from '~/tests/setup'
import { fakeDb } from '~/tests/helpers/db'
import { mockEvent } from '~/tests/helpers/event'

describe('GET /api/kztimer/stats', () => {
  beforeEach(() => {
    kztimerDb.mockReset()
  })

  it('aggregates map/player/personal-best counts', async () => {
    kztimerDb.mockReturnValue(fakeDb([{ count: 5 }], [{ count: 200 }], [{ count: 4000 }]))

    const result = await handler(mockEvent())

    expect(result).toEqual({ maps: 5, players: 200, personalBests: 4000 })
  })
})
