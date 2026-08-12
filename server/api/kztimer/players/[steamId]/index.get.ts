import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const steamId = getRouterParam(event, 'steamId')
  if (!steamId) {
    throw createError({ statusCode: 400, statusMessage: 'SteamID is required' })
  }

  const db = kztimerDb()
  const [[player]] = await db.query<RowDataPacket[]>(
    `SELECT steamid, name, country, points, finishedmaps, finishedmapspro, finishedmapstp, lastseen
     FROM playerrank
     WHERE steamid = ?`,
    [steamId]
  )

  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  }

  return {
    steamId: player.steamid as string,
    name: player.name as string,
    country: player.country as string | null,
    points: player.points as number,
    finishedMaps: player.finishedmaps as number,
    finishedMapsPro: player.finishedmapspro as number,
    finishedMapsTp: player.finishedmapstp as number,
    lastSeen: player.lastseen as string
  }
})
