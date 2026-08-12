import { steamId32ToSteam2 } from '../../shared/utils/kz'

// Shared player roster for the offline demo. GOKZ and KZTimer are separate plugins/databases
// in the real app, but both are keyed off the same Steam account id (GOKZ's SteamID32 and
// KZTimer's "STEAM_X:Y:Z" both derive from it), so reusing one roster here means a player's
// `/players/:id` page shows coherent combined stats, same as it would on a real server that
// runs both plugins.

export interface DemoPlayer {
  accountId: number
  alias: string
  country: string | null
}

export const DEMO_PLAYERS: DemoPlayer[] = [
  { accountId: 142837561, alias: 'Frosthop', country: 'SE' },
  { accountId: 187364920, alias: 'Kridak', country: 'PL' },
  { accountId: 203981745, alias: 'Wavy.', country: 'US' },
  { accountId: 219473028, alias: 'Nyrusen', country: 'FI' },
  { accountId: 234819273, alias: 'Bhoppin_Bunny', country: 'BR' },
  { accountId: 248123987, alias: 'Glacius', country: 'DE' },
  { accountId: 261984732, alias: 'Tempo', country: 'KR' },
  { accountId: 275648193, alias: 'Zypher', country: 'FR' },
  { accountId: 289173645, alias: 'Orenji', country: 'JP' },
  { accountId: 301948273, alias: 'Kestrel', country: 'GB' },
  { accountId: 316293847, alias: 'Marrow', country: 'CA' },
  { accountId: 329481726, alias: 'Sn0wy', country: 'NO' },
  { accountId: 341827364, alias: 'Vaelen', country: 'NL' },
  { accountId: 356198472, alias: 'Lumen', country: 'RU' },
  { accountId: 368472913, alias: 'Steezy', country: 'AU' },
  { accountId: 372918465, alias: 'Furiousbhop', country: 'TR' }
]

// Deterministic per-player "skill" multiplier: <1 is better than baseline, >1 is worse.
// Applied to generated run times (multiply) and jump distances (divide) so a given player
// tends to rank similarly across maps/modes instead of every record being pure noise.
export const PLAYER_SKILL: Record<number, number> = Object.fromEntries(
  DEMO_PLAYERS.map((p, i) => [p.accountId, 0.82 + (i / (DEMO_PLAYERS.length - 1)) * 0.75])
)

export function playerSteamId(accountId: number): string {
  return steamId32ToSteam2(accountId)
}
