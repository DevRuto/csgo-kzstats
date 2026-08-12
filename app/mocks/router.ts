// Maps `/api/**` requests to the demo data in ./gokz.ts and ./kztimer.ts, mirroring the
// file-based routes under server/api/** closely enough that the real query params (mode,
// type, course, search, limit) behave the same way. Used by app/plugins/demo-api.client.ts.
import { GOKZ_MODES, GOKZ_JUMP_TYPES } from '../../shared/utils/kz'
import * as gokz from './gokz'
import * as kztimer from './kztimer'

export interface DemoResponse { status: number, body: unknown }

function ok(body: unknown): DemoResponse {
  return { status: 200, body }
}

function notFound(statusMessage: string): DemoResponse {
  return { status: 404, body: { statusCode: 404, statusMessage } }
}

function badRequest(statusMessage: string): DemoResponse {
  return { status: 400, body: { statusCode: 400, statusMessage } }
}

function clampLimit(raw: string | null, fallback: number, max: number): number {
  return Math.min(Number(raw) || fallback, max)
}

// `apiPath` is the request pathname with everything up to and including "/api/" stripped
// (e.g. "gokz/maps/kz_aztec/records"). Returns null for anything that isn't a known demo route.
export function matchDemoRoute(apiPath: string, params: URLSearchParams): DemoResponse | null {
  const segments = apiPath.split('/').filter(Boolean).map(decodeURIComponent)
  const [system, ...rest] = segments

  if (system === 'gokz') return matchGokz(rest, params)
  if (system === 'kztimer') return matchKztimer(rest, params)
  return null
}

function matchGokz(segments: string[], params: URLSearchParams): DemoResponse | null {
  const [section, arg, sub] = segments

  if (section === 'stats' && segments.length === 1) return ok(gokz.gokzStats())
  if (section === 'recent' && segments.length === 1) return ok(gokz.gokzRecent())

  if (section === 'jumpstats' && segments.length === 1) {
    const mode = Number(params.get('mode') ?? 2)
    const jumpType = Number(params.get('type') ?? 1)
    if (!(mode in GOKZ_MODES)) return badRequest('Invalid mode')
    if (!(jumpType in GOKZ_JUMP_TYPES)) return badRequest('Invalid jump type')
    const limit = clampLimit(params.get('limit'), 100, 200)
    return ok(gokz.gokzJumpstats(mode, jumpType, limit))
  }

  if (section === 'top-players' && segments.length === 1) {
    const mode = Number(params.get('mode') ?? 2)
    if (!(mode in GOKZ_MODES)) return badRequest('Invalid mode')
    const type = params.get('type') === 'tp' ? 'tp' : 'pro'
    return ok(gokz.gokzTopPlayers(mode, type))
  }

  if (section === 'players') {
    if (segments.length === 1) {
      const search = (params.get('search') ?? '').trim()
      const limit = clampLimit(params.get('limit'), 20, 50)
      return ok(gokz.gokzPlayersSearch(search, limit))
    }
    const steamId32 = Number(arg)
    if (!Number.isInteger(steamId32)) return badRequest('Invalid SteamID32')
    if (segments.length === 3 && sub === 'records') {
      const mode = Number(params.get('mode') ?? 2)
      if (!(mode in GOKZ_MODES)) return badRequest('Invalid mode')
      const type = params.get('type') === 'tp' ? 'tp' : 'pro'
      return ok(gokz.gokzPlayerRecords(steamId32, mode, type))
    }
    if (segments.length === 2) {
      const player = gokz.gokzPlayerDetail(steamId32)
      return player ? ok(player) : notFound('Player not found')
    }
  }

  if (section === 'maps') {
    if (segments.length === 1) {
      const search = (params.get('search') ?? '').trim()
      return ok(gokz.gokzMapsList(search))
    }
    if (segments.length === 3 && sub === 'records') {
      const mode = Number(params.get('mode') ?? 2)
      const course = Number(params.get('course') ?? 0)
      if (!(mode in GOKZ_MODES)) return badRequest('Invalid mode')
      const type = params.get('type') === 'tp' ? 'tp' : 'pro'
      const limit = clampLimit(params.get('limit'), 100, 200)
      const result = gokz.gokzMapRecords(arg!, mode, course, type, limit)
      return result ? ok(result) : notFound('Map or course not found')
    }
    if (segments.length === 2) {
      const map = gokz.gokzMapDetail(arg!)
      return map ? ok(map) : notFound('Map not found')
    }
  }

  return null
}

function matchKztimer(segments: string[], params: URLSearchParams): DemoResponse | null {
  const [section, arg, sub] = segments

  if (section === 'stats' && segments.length === 1) return ok(kztimer.kztimerStats())
  if (section === 'recent' && segments.length === 1) return ok(kztimer.kztimerRecent())

  if (section === 'ranks' && segments.length === 1) {
    const limit = clampLimit(params.get('limit'), 100, 200)
    return ok(kztimer.kztimerRanks(limit))
  }

  if (section === 'jumpstats' && segments.length === 1) {
    const type = params.get('type') ?? 'lj'
    const limit = clampLimit(params.get('limit'), 100, 200)
    const result = kztimer.kztimerJumpstats(type, limit)
    return result ? ok(result) : badRequest('Invalid jump type')
  }

  if (section === 'players') {
    if (segments.length === 1) {
      const search = (params.get('search') ?? '').trim()
      const limit = clampLimit(params.get('limit'), 20, 50)
      return ok(kztimer.kztimerPlayersSearch(search, limit))
    }
    if (segments.length === 3 && sub === 'records') {
      const type = params.get('type') === 'tp' ? 'tp' : 'pro'
      return ok(kztimer.kztimerPlayerRecords(arg!, type))
    }
    if (segments.length === 2) {
      const player = kztimer.kztimerPlayerDetail(arg!)
      return player ? ok(player) : notFound('Player not found')
    }
  }

  if (section === 'maps') {
    if (segments.length === 1) {
      const search = (params.get('search') ?? '').trim()
      return ok(kztimer.kztimerMapsList(search))
    }
    if (segments.length === 3 && sub === 'records') {
      const type = params.get('type') === 'tp' ? 'tp' : 'pro'
      const limit = clampLimit(params.get('limit'), 100, 200)
      return ok(kztimer.kztimerMapRecords(arg!, type, limit))
    }
    if (segments.length === 2) {
      const map = kztimer.kztimerMapDetail(arg!)
      return map ? ok(map) : notFound('Map not found')
    }
  }

  return null
}
