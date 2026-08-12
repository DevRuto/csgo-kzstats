import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const mode = Number(query.mode ?? 2)
  const jumpType = Number(query.type ?? 1)
  const limit = Math.min(Number(query.limit) || 100, 200)

  if (!(mode in GOKZ_MODES)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mode' })
  }
  if (!(jumpType in GOKZ_JUMP_TYPES)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid jump type' })
  }

  const db = gokzDb()

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT best.SteamID32, p.Alias, p.Country, best.Distance,
            MIN(j.Strafes) AS Strafes, MIN(j.Sync) AS Sync, MIN(j.Pre) AS Pre,
            MIN(j.Max) AS Max, MIN(j.Created) AS Created
     FROM (
       SELECT SteamID32, MAX(Distance) AS Distance
       FROM Jumpstats
       WHERE JumpType = ? AND Mode = ?
       GROUP BY SteamID32
     ) best
     JOIN Jumpstats j ON j.JumpType = ? AND j.Mode = ?
                      AND j.SteamID32 = best.SteamID32 AND j.Distance = best.Distance
     JOIN Players p ON p.SteamID32 = best.SteamID32
     GROUP BY best.SteamID32, p.Alias, p.Country, best.Distance
     ORDER BY best.Distance DESC
     LIMIT ?`,
    [jumpType, mode, jumpType, mode, limit]
  )

  return rows.map((row, index) => ({
    rank: index + 1,
    steamId32: row.SteamID32 as number,
    alias: row.Alias as string | null,
    country: row.Country as string | null,
    // Distance is stored as units * 10000, Sync/Pre/Max as value * 100 (fixed-point) in gokz.Jumpstats
    distance: (row.Distance as number) / 10000,
    strafes: row.Strafes as number,
    sync: (row.Sync as number) / 100,
    pre: (row.Pre as number) / 100,
    max: (row.Max as number) / 100,
    createdAt: row.Created as string
  }))
})
