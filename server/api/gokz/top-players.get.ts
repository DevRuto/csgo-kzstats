import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const mode = Number(query.mode ?? 2)
  const type = query.type === 'tp' ? 'tp' : 'pro'

  if (!(mode in GOKZ_MODES)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mode' })
  }

  const db = gokzDb()
  const teleportCondition = type === 'pro' ? 't.Teleports = 0' : 't.Teleports > 0'

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT best.SteamID32, p.Alias, p.Country, COUNT(*) AS wrs
     FROM (
       SELECT SteamID32, MapCourseID,
              RANK() OVER (PARTITION BY MapCourseID ORDER BY RunTime ASC) AS rnk
       FROM (
         SELECT SteamID32, MapCourseID, MIN(RunTime) AS RunTime
         FROM Times t
         WHERE t.Mode = ? AND ${teleportCondition}
         GROUP BY SteamID32, MapCourseID
       ) pb
     ) best
     JOIN Players p ON p.SteamID32 = best.SteamID32
     WHERE best.rnk = 1
     GROUP BY best.SteamID32, p.Alias, p.Country
     ORDER BY wrs DESC
     LIMIT 50`,
    [mode]
  )

  return rows.map((row, index) => ({
    rank: index + 1,
    steamId32: row.SteamID32 as number,
    alias: row.Alias as string | null,
    country: row.Country as string | null,
    worldRecords: row.wrs as number
  }))
})
