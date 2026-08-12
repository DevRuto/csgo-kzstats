// Offline-demo stand-in for the KZTimer endpoints under server/api/kztimer/**. Same approach
// as app/mocks/gokz.ts: a small seeded dataset generated once, answering the same query params
// and response shapes the real handlers return.
import { DEMO_PLAYERS, PLAYER_SKILL, playerSteamId } from './players'
import { mulberry32, randInt, randFloat, pickN, timestampAgo } from './random'
import { competitionRank } from './util'
import { KZTIMER_JUMP_TYPES } from '../../shared/utils/kz'

interface KtMapDef { name: string, baseTimeSeconds: number }

const KT_MAPS: KtMapDef[] = [
  { name: 'kz_baxter', baseTimeSeconds: 55 },
  { name: 'kz_alien_city', baseTimeSeconds: 130 },
  { name: 'kz_avalon', baseTimeSeconds: 210 },
  { name: 'kz_azure', baseTimeSeconds: 75 },
  { name: 'kz_athena', baseTimeSeconds: 95 }
]

const KT_MAP_IMAGES: Record<string, string> = {
  kz_baxter: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_baxter.webp',
  kz_alien_city: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_alien_city.webp',
  kz_avalon: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_avalon.webp',
  kz_azure: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_azure.webp',
  kz_athena: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_athena.webp'
}

// Roughly plausible max distances (units), before per-player skill is applied — one row
// per player in the real playerjumpstats3 table, one column-set per jump type.
const KT_JUMP_BASELINE: Record<string, number> = {
  lj: 255,
  bhop: 295,
  multibhop: 320,
  wj: 235,
  ladderjump: 180,
  dropbhop: 190,
  ljblock: 270,
  cj: 275
}

interface KtTimeRow {
  steamId: string
  name: string
  country: string | null
  map: string
  runtimepro: number
  teleportsPro: number
  proDate: string
  runtime: number
  teleports: number
  tpDate: string | null
}

function buildTimes(): KtTimeRow[] {
  const rand = mulberry32(0x3c9e17)
  const rows: KtTimeRow[] = []

  for (const map of KT_MAPS) {
    const participants = pickN(rand, DEMO_PLAYERS, randInt(rand, 4, 12))
    for (const player of participants) {
      const skill = PLAYER_SKILL[player.accountId]!
      const proTime = Number((map.baseTimeSeconds * skill * randFloat(rand, 0.92, 1.18)).toFixed(3))
      const hasTp = rand() < 0.55
      rows.push({
        steamId: playerSteamId(player.accountId),
        name: player.alias,
        country: player.country,
        map: map.name,
        runtimepro: proTime,
        teleportsPro: 0,
        proDate: timestampAgo(rand, 90),
        runtime: hasTp ? Number((proTime * randFloat(rand, 0.85, 1.3)).toFixed(3)) : 0,
        teleports: hasTp ? randInt(rand, 1, 20) : 0,
        tpDate: hasTp ? timestampAgo(rand, 90) : null
      })
    }
  }
  return rows
}

interface KtRankRow {
  steamId: string
  name: string
  country: string | null
  points: number
  finishedMaps: number
  finishedMapsPro: number
  finishedMapsTp: number
  lastSeen: string
}

function buildRanks(times: KtTimeRow[]): KtRankRow[] {
  const rand = mulberry32(0x1e88b2)
  return DEMO_PLAYERS.map((player) => {
    const skill = PLAYER_SKILL[player.accountId]!
    const steamId = playerSteamId(player.accountId)
    const rows = times.filter(r => r.steamId === steamId)
    const proMaps = rows.filter(r => r.runtimepro > 0)
    const tpMaps = rows.filter(r => r.runtime > 0)
    const dates = rows.flatMap(r => [r.proDate, r.tpDate].filter((d): d is string => d !== null))
    return {
      steamId,
      name: player.alias,
      country: player.country,
      points: Math.round((2.1 - skill) * 6000 * randFloat(rand, 0.85, 1.15)),
      finishedMaps: new Set(rows.map(r => r.map)).size,
      finishedMapsPro: proMaps.length,
      finishedMapsTp: tpMaps.length,
      lastSeen: dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : timestampAgo(rand, 60)
    }
  })
}

interface KtJumpRow {
  steamId: string
  name: string
  values: Record<string, { record: number, pre: number, max: number, strafes: number, sync: number }>
}

function buildJumps(): KtJumpRow[] {
  const rand = mulberry32(0x2f61aa)
  return DEMO_PLAYERS.map((player) => {
    const skill = PLAYER_SKILL[player.accountId]!
    const values: KtJumpRow['values'] = {}
    for (const key of Object.keys(KZTIMER_JUMP_TYPES)) {
      const baseline = KT_JUMP_BASELINE[key]!
      values[key] = {
        record: Number((baseline / skill * randFloat(rand, 0.88, 1.04)).toFixed(3)),
        pre: Number(randFloat(rand, 15, 55).toFixed(1)),
        max: Number(randFloat(rand, 230, 320).toFixed(1)),
        strafes: randInt(rand, 3, 9),
        sync: randInt(rand, 65, 99)
      }
    }
    return { steamId: playerSteamId(player.accountId), name: player.alias, values }
  })
}

const KT_TIMES = buildTimes()
const KT_RANKS = buildRanks(KT_TIMES)
const KT_JUMPS = buildJumps()

export function kztimerStats() {
  return {
    maps: new Set(KT_TIMES.map(r => r.map)).size,
    players: KT_RANKS.length,
    personalBests: KT_TIMES.length
  }
}

export function kztimerRecent() {
  const entries: { steamId: string, name: string, map: string, runTime: number, teleports: number, isPro: boolean, createdAt: string }[] = []
  for (const row of KT_TIMES) {
    if (row.runtimepro > 0) {
      entries.push({ steamId: row.steamId, name: row.name, map: row.map, runTime: row.runtimepro, teleports: 0, isPro: true, createdAt: row.proDate })
    }
    if (row.runtime > 0 && row.tpDate) {
      entries.push({ steamId: row.steamId, name: row.name, map: row.map, runTime: row.runtime, teleports: row.teleports, isPro: false, createdAt: row.tpDate })
    }
  }
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30)
}

export function kztimerMapsList(search: string) {
  return KT_MAPS
    .filter(m => !search || m.name.includes(search.toLowerCase()))
    .map(m => ({
      name: m.name,
      players: KT_TIMES.filter(r => r.map === m.name).length,
      image: KT_MAP_IMAGES[m.name] ?? null
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function kztimerMapDetail(name: string) {
  const players = KT_TIMES.filter(r => r.map === name).length
  if (!players) return null
  return { name, players, image: KT_MAP_IMAGES[name] ?? null }
}

export function kztimerMapRecords(name: string, type: 'pro' | 'tp', limit: number) {
  const rows = KT_TIMES
    .filter(r => r.map === name && (type === 'pro' ? r.runtimepro > 0 : r.runtime > 0))
    .map(r => ({
      steamId: r.steamId,
      name: r.name,
      runTime: type === 'pro' ? r.runtimepro : r.runtime,
      teleports: type === 'pro' ? r.teleportsPro : r.teleports
    }))
    .sort((a, b) => a.runTime - b.runTime)
    .slice(0, limit)

  return rows.map((row, index) => ({ rank: index + 1, ...row }))
}

export function kztimerRanks(limit: number) {
  return [...KT_RANKS]
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((row, index) => ({ rank: index + 1, ...row }))
}

export function kztimerJumpstats(typeKey: string, limit: number) {
  if (!(typeKey in KZTIMER_JUMP_TYPES)) return null
  return KT_JUMPS
    .map(row => ({ steamId: row.steamId, name: row.name, ...row.values[typeKey]! }))
    .filter(row => row.record > 0)
    .sort((a, b) => b.record - a.record)
    .slice(0, limit)
    .map((row, index) => ({ rank: index + 1, ...row }))
}

export function kztimerPlayersSearch(search: string, limit: number) {
  if (!search) return []
  const needle = search.toLowerCase()
  return KT_RANKS
    .filter(r => r.name.toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(r => ({ steamId: r.steamId, name: r.name, country: r.country }))
}

export function kztimerPlayerDetail(steamId: string) {
  const player = KT_RANKS.find(r => r.steamId === steamId)
  if (!player) return null
  return { ...player }
}

export function kztimerPlayerRecords(steamId: string, type: 'pro' | 'tp') {
  const results: { map: string, rank: number, runTime: number, teleports: number }[] = []

  for (const map of KT_MAPS) {
    const rows = KT_TIMES
      .filter(r => r.map === map.name && (type === 'pro' ? r.runtimepro > 0 : r.runtime > 0))
      .map(r => ({
        steamId: r.steamId,
        runTime: type === 'pro' ? r.runtimepro : r.runtime,
        teleports: type === 'pro' ? r.teleportsPro : r.teleports
      }))
    const ranked = competitionRank(rows, r => r.runTime)
    const mine = ranked.find(r => r.steamId === steamId)
    if (mine) {
      results.push({ map: map.name, rank: mine.rank, runTime: mine.runTime, teleports: mine.teleports })
    }
  }

  return results.sort((a, b) => a.map.localeCompare(b.map))
}
