import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 100, 200)

  const db = kztimerDb()

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT steamid, name, country, points, finishedmaps, finishedmapspro, finishedmapstp, lastseen
     FROM playerrank
     ORDER BY points DESC
     LIMIT ?`,
    [limit]
  )

  return rows.map((row, index) => ({
    rank: index + 1,
    steamId: row.steamid as string,
    name: row.name as string,
    country: row.country as string | null,
    points: row.points as number,
    finishedMaps: row.finishedmaps as number,
    finishedMapsPro: row.finishedmapspro as number,
    finishedMapsTp: row.finishedmapstp as number,
    lastSeen: row.lastseen as string
  }))
})
