import { describe, expect, it } from 'vitest'
import {
  GOKZ_MODE_TAB_OPTIONS,
  formatDistance,
  formatDuration,
  formatDurationMs,
  gokzJumpTypeName,
  gokzModeName,
  kztimerJumpTypeName,
  steam2ToSteamId32,
  steamId32ToSteam2
} from '../../../shared/utils/kz'

describe('gokzModeName', () => {
  it('resolves known modes', () => {
    expect(gokzModeName(0)).toBe('Vanilla')
    expect(gokzModeName(1)).toBe('SimpleKZ')
    expect(gokzModeName(2)).toBe('KZTimer')
  })

  it('falls back for unknown modes', () => {
    expect(gokzModeName(99)).toBe('Mode 99')
  })
})

describe('GOKZ_MODE_TAB_OPTIONS', () => {
  it('orders tabs KZTimer, SimpleKZ, Vanilla', () => {
    expect(GOKZ_MODE_TAB_OPTIONS.map(o => o.value)).toEqual([2, 1, 0])
    expect(GOKZ_MODE_TAB_OPTIONS.map(o => o.label)).toEqual(['KZTimer', 'SimpleKZ', 'Vanilla'])
  })
})

describe('gokzJumpTypeName', () => {
  it('resolves known jump types', () => {
    expect(gokzJumpTypeName(0)).toBe('Long Jump')
    expect(gokzJumpTypeName(1)).toBe('Bunnyhop')
  })

  it('falls back for unknown jump types', () => {
    expect(gokzJumpTypeName(42)).toBe('Type 42')
  })
})

describe('kztimerJumpTypeName', () => {
  it('resolves known keys', () => {
    expect(kztimerJumpTypeName('lj')).toBe('Long Jump')
    expect(kztimerJumpTypeName('cj')).toBe('CJ')
  })

  it('falls back to the raw key for unknown keys', () => {
    expect(kztimerJumpTypeName('made-up')).toBe('made-up')
  })
})

describe('formatDuration', () => {
  it('formats sub-minute durations without a minute rollover', () => {
    expect(formatDuration(12.345)).toBe('0:12.345')
  })

  it('pads single-digit seconds', () => {
    expect(formatDuration(5.1)).toBe('0:05.100')
  })

  it('formats minutes without hours', () => {
    expect(formatDuration(75.5)).toBe('1:15.500')
  })

  it('formats hours when present', () => {
    expect(formatDuration(3661.001)).toBe('1:01:01.001')
  })

  it('omits hours when zero even for long minute counts', () => {
    expect(formatDuration(3599.999)).toBe('59:59.999')
  })

  it('returns a placeholder for negative input', () => {
    expect(formatDuration(-1)).toBe('-')
  })

  it('returns a placeholder for non-finite input', () => {
    expect(formatDuration(NaN)).toBe('-')
    expect(formatDuration(Infinity)).toBe('-')
  })

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0:00.000')
  })
})

describe('formatDurationMs', () => {
  it('converts milliseconds to seconds before formatting', () => {
    expect(formatDurationMs(1500)).toBe('0:01.500')
  })
})

describe('formatDistance', () => {
  it('formats to three decimal places with a unit suffix', () => {
    expect(formatDistance(12.3456)).toBe('12.346 units')
  })

  it('pads whole numbers to three decimals', () => {
    expect(formatDistance(7)).toBe('7.000 units')
  })
})

describe('steamId32ToSteam2 / steam2ToSteamId32', () => {
  it('converts an even account id (Y=0)', () => {
    expect(steamId32ToSteam2(4)).toBe('STEAM_1:0:2')
  })

  it('converts an odd account id (Y=1)', () => {
    expect(steamId32ToSteam2(5)).toBe('STEAM_1:1:2')
  })

  it('round-trips through both conversions', () => {
    for (const accountId of [0, 1, 4, 5, 123456789]) {
      const steam2 = steamId32ToSteam2(accountId)
      expect(steam2ToSteamId32(steam2)).toBe(accountId)
    }
  })

  it('parses any universe digit 0-5', () => {
    expect(steam2ToSteamId32('STEAM_0:1:2')).toBe(5)
    expect(steam2ToSteamId32('STEAM_5:1:2')).toBe(5)
  })

  it('returns null for malformed input', () => {
    expect(steam2ToSteamId32('not-a-steamid')).toBeNull()
    expect(steam2ToSteamId32('STEAM_1:2:5')).toBeNull()
    expect(steam2ToSteamId32('STEAM_6:1:5')).toBeNull()
  })
})
