import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async () => {
  const db = kztimerDb()

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT steamid, name, runtime, teleports, map, date
     FROM LatestRecords
     ORDER BY date DESC
     LIMIT 30`
  )

  return rows.map(row => ({
    steamId: row.steamid as string,
    name: row.name as string,
    map: row.map as string,
    runTime: Number(row.runtime),
    teleports: row.teleports as number,
    isPro: row.teleports === 0,
    createdAt: row.date as string
  }))
})
