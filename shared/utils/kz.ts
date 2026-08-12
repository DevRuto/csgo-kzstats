// GOKZ mode IDs as stored in gokz.Times/gokz.Jumpstats.Mode, per gokz-core's Mode_* enum
// (Mode_Vanilla = 0, Mode_SimpleKZ = 1, Mode_KZTimer = 2)
export const GOKZ_MODES: Record<number, { name: string; short: string }> = {
  0: { name: 'Vanilla', short: 'VNL' },
  1: { name: 'SimpleKZ', short: 'SKZ' },
  2: { name: 'KZTimer', short: 'KZT' }
}

export function gokzModeName(mode: number): string {
  return GOKZ_MODES[mode]?.name ?? `Mode ${mode}`
}

// Display order for mode tabs in the UI: KZTimer, SimpleKZ, Vanilla
export const GOKZ_MODE_TAB_OPTIONS = [2, 1, 0].map(value => ({
  label: GOKZ_MODES[value].name,
  value
}))

// JumpType IDs as stored in gokz.Jumpstats.JumpType, per gokz-core's JumpType_* enum
export const GOKZ_JUMP_TYPES: Record<number, { name: string; short: string }> = {
  0: { name: 'Long Jump', short: 'LJ' },
  1: { name: 'Bunnyhop', short: 'BH' },
  2: { name: 'Multi Bunnyhop', short: 'MBH' },
  3: { name: 'Weird Jump', short: 'WJ' },
  4: { name: 'Ladder Jump', short: 'LAJ' },
  5: { name: 'Ladderhop', short: 'LAH' },
  6: { name: 'Jumpbug', short: 'JB' },
  7: { name: 'Lowpre Bunnyhop', short: 'LBH' },
  8: { name: 'Lowpre Weird Jump', short: 'LWJ' }
}

export function gokzJumpTypeName(type: number): string {
  return GOKZ_JUMP_TYPES[type]?.name ?? `Type ${type}`
}

// Formats a duration given in seconds as HH:MM:SS.mmm (hours omitted when zero)
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '-'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const secondsStr = seconds.toFixed(3).padStart(6, '0')
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${secondsStr}`
  }
  return `${minutes}:${secondsStr}`
}

// gokz.Times.RunTime is stored in milliseconds
export function formatDurationMs(ms: number): string {
  return formatDuration(ms / 1000)
}

export function formatDistance(units: number): string {
  return `${units.toFixed(3)} units`
}

// KZTimer's playerjumpstats3 stores one column-prefix per jump category
// (e.g. "lj" -> ljrecord/ljpre/ljmax/ljstrafes/ljsync)
export const KZTIMER_JUMP_TYPES: Record<string, { name: string; prefix: string }> = {
  lj: { name: 'Long Jump', prefix: 'lj' },
  bhop: { name: 'Bunnyhop', prefix: 'bhop' },
  multibhop: { name: 'Multi Bunnyhop', prefix: 'multibhop' },
  wj: { name: 'Weird Jump', prefix: 'wj' },
  ladderjump: { name: 'Ladder Jump', prefix: 'ladderjump' },
  dropbhop: { name: 'Drop Bunnyhop', prefix: 'dropbhop' },
  ljblock: { name: 'Block Long Jump', prefix: 'ljblock' },
  cj: { name: 'CJ', prefix: 'cj' }
}

export function kztimerJumpTypeName(key: string): string {
  return KZTIMER_JUMP_TYPES[key]?.name ?? key
}

// GOKZ's Players.SteamID32 stores the Steam3 account id (the "Z" component of a
// Steam2 id), while KZTimer's playerrank/playertimes.steamid stores the classic
// "STEAM_X:Y:Z" string. These convert between the two so a player can be looked
// up across both plugins' databases. SourceMod's modern engines (CS:GO/CS2, which
// both plugins target) always report the universe digit as 1, so that's what we
// generate here to match what's actually stored in KZTimer's database.
export function steamId32ToSteam2(accountId: number): string {
  const y = accountId % 2
  const z = Math.floor(accountId / 2)
  return `STEAM_1:${y}:${z}`
}

export function steam2ToSteamId32(steamId: string): number | null {
  const match = /^STEAM_[0-5]:([01]):(\d+)$/.exec(steamId)
  if (!match) return null
  const y = Number(match[1])
  const z = Number(match[2])
  return z * 2 + y
}
