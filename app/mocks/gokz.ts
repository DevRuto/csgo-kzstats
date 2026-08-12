// Offline-demo stand-in for the GOKZ endpoints under server/api/gokz/**. Generates a small,
// internally-consistent dataset once (seeded, so it's stable across builds) and answers the
// same query params / response shapes the real handlers return, so the pages need no changes.
import { DEMO_PLAYERS, PLAYER_SKILL } from './players'
import { mulberry32, randInt, randFloat, pickN, timestampAgo } from './random'
import { competitionRank, bestPerGroup } from './util'
import { gokzModeName } from '../../shared/utils/kz'

interface GokzMapCourseDef { mapCourseId: number, course: number, baseTimeMs: number }
interface GokzMapDef {
  id: number
  name: string
  inRankedPool: boolean
  courses: GokzMapCourseDef[]
}

let courseSeq = 1
function courseDef(course: number, baseTimeMs: number): GokzMapCourseDef {
  return { mapCourseId: courseSeq++, course, baseTimeMs }
}

const GOKZ_MAPS: GokzMapDef[] = [
  { id: 1, name: 'kz_aztec', inRankedPool: false, courses: [courseDef(0, 62000)] },
  { id: 2, name: 'kz_ancient_v3', inRankedPool: true, courses: [courseDef(0, 95000)] },
  { id: 3, name: 'kz_andromeda', inRankedPool: false, courses: [courseDef(0, 140000)] },
  { id: 4, name: 'kz_arcadium', inRankedPool: true, courses: [courseDef(0, 88000), courseDef(1, 32000)] },
  { id: 5, name: 'kz_backwards', inRankedPool: false, courses: [courseDef(0, 71000)] },
  { id: 6, name: 'kz_beginnerblock_go', inRankedPool: false, courses: [courseDef(0, 34000), courseDef(1, 14000), courseDef(2, 19000)] },
  { id: 7, name: 'kz_synergy_x', inRankedPool: true, courses: [courseDef(0, 185000)] }
]

const GOKZ_MAP_IMAGES: Record<string, string> = {
  kz_aztec: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_aztec.webp',
  kz_ancient_v3: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_ancient_v3.webp',
  kz_andromeda: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_andromeda.webp',
  kz_arcadium: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_arcadium.webp',
  kz_backwards: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_backwards.webp',
  kz_beginnerblock_go: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_beginnerblock_go.webp',
  kz_synergy_x: 'https://github.com/KZGlobalTeam/map-images/raw/public/webp/kz_synergy_x.webp'
}

const MODE_MULTIPLIER: Record<number, number> = { 0: 1.15, 1: 1.05, 2: 1 }
// Roughly plausible max jump distances (units) per GOKZ jump type, before per-player skill is applied.
const JUMP_BASELINE: Record<number, number> = { 0: 255, 1: 295, 2: 320, 3: 235, 4: 180, 5: 190, 6: 270, 7: 275, 8: 230 }

interface GokzTimeRow {
  steamId32: number
  mapCourseId: number
  mapName: string
  course: number
  mode: number
  teleports: number
  runTimeMs: number
  createdAt: string
}

interface GokzJumpRow {
  steamId32: number
  mode: number
  jumpType: number
  distance: number
  strafes: number
  sync: number
  pre: number
  max: number
  createdAt: string
}

function buildTimes(): GokzTimeRow[] {
  const rand = mulberry32(0x6b7a11)
  const rows: GokzTimeRow[] = []
  let nextId = 1

  for (const map of GOKZ_MAPS) {
    for (const course of map.courses) {
      for (const mode of [0, 1, 2]) {
        const participants = pickN(rand, DEMO_PLAYERS, randInt(rand, 4, 11))
        for (const player of participants) {
          const skill = PLAYER_SKILL[player.accountId]!
          const proTime = Math.round(course.baseTimeMs * skill * MODE_MULTIPLIER[mode]! * randFloat(rand, 0.92, 1.18))
          rows.push({
            steamId32: player.accountId,
            mapCourseId: course.mapCourseId,
            mapName: map.name,
            course: course.course,
            mode,
            teleports: 0,
            runTimeMs: proTime,
            createdAt: timestampAgo(rand, 90)
          })
          nextId++
          if (rand() < 0.5) {
            rows.push({
              steamId32: player.accountId,
              mapCourseId: course.mapCourseId,
              mapName: map.name,
              course: course.course,
              mode,
              teleports: randInt(rand, 1, 20),
              runTimeMs: Math.round(proTime * randFloat(rand, 0.85, 1.3)),
              createdAt: timestampAgo(rand, 90)
            })
            nextId++
          }
        }
      }
    }
  }
  void nextId
  return rows
}

function buildJumps(): GokzJumpRow[] {
  const rand = mulberry32(0x4a5f21)
  const rows: GokzJumpRow[] = []

  for (const mode of [0, 1, 2]) {
    for (const jumpType of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
      const participants = pickN(rand, DEMO_PLAYERS, randInt(rand, 5, 12))
      const baseline = JUMP_BASELINE[jumpType]!
      for (const player of participants) {
        const skill = PLAYER_SKILL[player.accountId]!
        rows.push({
          steamId32: player.accountId,
          mode,
          jumpType,
          distance: Number((baseline / skill * randFloat(rand, 0.88, 1.04)).toFixed(3)),
          strafes: randInt(rand, 3, 9),
          sync: Number(randFloat(rand, 65, 99).toFixed(1)),
          pre: Number(randFloat(rand, 15, 55).toFixed(1)),
          max: Number(randFloat(rand, 230, 320).toFixed(1)),
          createdAt: timestampAgo(rand, 90)
        })
      }
    }
  }
  return rows
}

const GOKZ_TIMES = buildTimes()
const GOKZ_JUMPS = buildJumps()

function playerRef(steamId32: number) {
  return DEMO_PLAYERS.find(p => p.accountId === steamId32) ?? null
}

function findMap(name: string): GokzMapDef | null {
  return GOKZ_MAPS.find(m => m.name === name) ?? null
}

export function gokzStats() {
  const players = new Set(GOKZ_TIMES.map(r => r.steamId32))
  const modes = [0, 1, 2].map((mode) => {
    const rows = GOKZ_TIMES.filter(r => r.mode === mode)
    return {
      mode,
      name: gokzModeName(mode),
      runs: rows.length,
      players: new Set(rows.map(r => r.steamId32)).size
    }
  }).filter(m => m.runs > 0)

  return {
    maps: GOKZ_MAPS.length,
    players: players.size,
    modes
  }
}

export function gokzRecent() {
  return [...GOKZ_TIMES]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30)
    .map((row, index) => {
      const player = playerRef(row.steamId32)
      return {
        id: index + 1,
        steamId32: row.steamId32,
        alias: player?.alias ?? null,
        country: player?.country ?? null,
        map: row.mapName,
        course: row.course,
        mode: row.mode,
        modeName: gokzModeName(row.mode),
        teleports: row.teleports,
        runTimeMs: row.runTimeMs,
        isPro: row.teleports === 0,
        createdAt: row.createdAt
      }
    })
}

export function gokzMapsList(search: string) {
  return GOKZ_MAPS
    .filter(m => !search || m.name.includes(search.toLowerCase()))
    .map(m => ({
      id: m.id,
      name: m.name,
      inRankedPool: m.inRankedPool,
      lastPlayed: mapLastPlayed(m.name),
      courseCount: m.courses.length,
      image: GOKZ_MAP_IMAGES[m.name] ?? null
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function mapLastPlayed(name: string): string | null {
  const rows = GOKZ_TIMES.filter(r => r.mapName === name)
  if (!rows.length) return null
  return rows.reduce((latest, r) => (r.createdAt > latest ? r.createdAt : latest), rows[0]!.createdAt)
}

function mapCreatedAt(name: string): string {
  // Deterministic "map added" date, well before any run on it.
  const rand = mulberry32(name.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), 7))
  return timestampAgo(rand, 400, 120)
}

export function gokzMapDetail(name: string) {
  const map = findMap(name)
  if (!map) return null
  return {
    id: map.id,
    name: map.name,
    inRankedPool: map.inRankedPool,
    lastPlayed: mapLastPlayed(map.name),
    createdAt: mapCreatedAt(map.name),
    courses: map.courses.map(c => ({ mapCourseId: c.mapCourseId, course: c.course })),
    image: GOKZ_MAP_IMAGES[map.name] ?? null
  }
}

export function gokzMapRecords(name: string, mode: number, course: number, type: 'pro' | 'tp', limit: number) {
  const map = findMap(name)
  if (!map) return null
  const courseDef = map.courses.find(c => c.course === course)
  if (!courseDef) return null

  const rows = GOKZ_TIMES.filter(r =>
    r.mapCourseId === courseDef.mapCourseId
    && r.mode === mode
    && (type === 'pro' ? r.teleports === 0 : r.teleports > 0)
  )
  const best = bestPerGroup(rows, r => r.steamId32, r => r.runTimeMs)
    .sort((a, b) => a.runTimeMs - b.runTimeMs)
    .slice(0, limit)

  return best.map((row, index) => {
    const player = playerRef(row.steamId32)
    return {
      rank: index + 1,
      steamId32: row.steamId32,
      alias: player?.alias ?? null,
      country: player?.country ?? null,
      runTimeMs: row.runTimeMs,
      teleports: row.teleports,
      createdAt: row.createdAt
    }
  })
}

export function gokzJumpstats(mode: number, jumpType: number, limit: number) {
  const rows = GOKZ_JUMPS.filter(r => r.mode === mode && r.jumpType === jumpType)
  const best = bestPerGroup(rows, r => r.steamId32, r => -r.distance)
    .sort((a, b) => b.distance - a.distance)
    .slice(0, limit)

  return best.map((row, index) => {
    const player = playerRef(row.steamId32)
    return {
      rank: index + 1,
      steamId32: row.steamId32,
      alias: player?.alias ?? null,
      country: player?.country ?? null,
      distance: row.distance,
      strafes: row.strafes,
      sync: row.sync,
      pre: row.pre,
      max: row.max,
      createdAt: row.createdAt
    }
  })
}

export function gokzTopPlayers(mode: number, type: 'pro' | 'tp') {
  const rows = GOKZ_TIMES.filter(r => r.mode === mode && (type === 'pro' ? r.teleports === 0 : r.teleports > 0))
  const wrsByPlayer = new Map<number, number>()

  const byMapCourse = new Map<number, GokzTimeRow[]>()
  for (const row of rows) {
    if (!byMapCourse.has(row.mapCourseId)) byMapCourse.set(row.mapCourseId, [])
    byMapCourse.get(row.mapCourseId)!.push(row)
  }

  for (const mapRows of byMapCourse.values()) {
    const best = bestPerGroup(mapRows, r => r.steamId32, r => r.runTimeMs)
    const ranked = competitionRank(best, r => r.runTimeMs)
    for (const row of ranked) {
      if (row.rank === 1) {
        wrsByPlayer.set(row.steamId32, (wrsByPlayer.get(row.steamId32) ?? 0) + 1)
      }
    }
  }

  return [...wrsByPlayer.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([steamId32, wrs], index) => {
      const player = playerRef(steamId32)
      return {
        rank: index + 1,
        steamId32,
        alias: player?.alias ?? null,
        country: player?.country ?? null,
        serverRecords: wrs
      }
    })
}

export function gokzPlayersSearch(search: string, limit: number) {
  if (!search) return []
  const needle = search.toLowerCase()
  return DEMO_PLAYERS
    .filter(p => p.alias.toLowerCase().includes(needle))
    .sort((a, b) => a.alias.localeCompare(b.alias))
    .slice(0, limit)
    .map(p => ({ steamId32: p.accountId, alias: p.alias, country: p.country }))
}

export function gokzPlayerDetail(steamId32: number) {
  const player = playerRef(steamId32)
  if (!player) return null
  return { steamId32: player.accountId, alias: player.alias, country: player.country }
}

export function gokzPlayerRecords(steamId32: number, mode: number, type: 'pro' | 'tp') {
  const results: { map: string, course: number, rank: number, runTimeMs: number, teleports: number, createdAt: string }[] = []

  for (const map of GOKZ_MAPS) {
    for (const course of map.courses) {
      const rows = GOKZ_TIMES.filter(r =>
        r.mapCourseId === course.mapCourseId
        && r.mode === mode
        && (type === 'pro' ? r.teleports === 0 : r.teleports > 0)
      )
      const best = bestPerGroup(rows, r => r.steamId32, r => r.runTimeMs)
      const ranked = competitionRank(best, r => r.runTimeMs)
      const mine = ranked.find(r => r.steamId32 === steamId32)
      if (mine) {
        results.push({
          map: map.name,
          course: course.course,
          rank: mine.rank,
          runTimeMs: mine.runTimeMs,
          teleports: mine.teleports,
          createdAt: mine.createdAt
        })
      }
    }
  }

  return results.sort((a, b) => a.map.localeCompare(b.map) || a.course - b.course)
}
