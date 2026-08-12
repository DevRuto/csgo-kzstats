import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const mapName = getRouterParam(event, 'map')
  if (!mapName) {
    throw createError({ statusCode: 400, statusMessage: 'Map name is required' })
  }

  const query = getQuery(event)
  const mode = Number(query.mode ?? 2)
  const course = Number(query.course ?? 0)
  const type = query.type === 'tp' ? 'tp' : 'pro'
  const limit = Math.min(Number(query.limit) || 100, 200)

  if (!(mode in GOKZ_MODES)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mode' })
  }

  const db = gokzDb()

  const [[mapCourse]] = await db.query<RowDataPacket[]>(
    `SELECT mc.MapCourseID
     FROM MapCourses mc
     JOIN Maps m ON m.MapID = mc.MapID
     WHERE m.Name = ? AND mc.Course = ?`,
    [mapName, course]
  )

  if (!mapCourse) {
    throw createError({ statusCode: 404, statusMessage: 'Map or course not found' })
  }

  const teleportCondition = type === 'pro' ? 'Teleports = 0' : 'Teleports > 0'

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT best.SteamID32, p.Alias, p.Country, best.RunTime,
            MIN(t.Teleports) AS Teleports, MIN(t.Created) AS Created
     FROM (
       SELECT SteamID32, MIN(RunTime) AS RunTime
       FROM Times
       WHERE MapCourseID = ? AND Mode = ? AND ${teleportCondition}
       GROUP BY SteamID32
     ) best
     JOIN Times t ON t.MapCourseID = ? AND t.Mode = ? AND ${teleportCondition}
                  AND t.SteamID32 = best.SteamID32 AND t.RunTime = best.RunTime
     JOIN Players p ON p.SteamID32 = best.SteamID32
     GROUP BY best.SteamID32, p.Alias, p.Country, best.RunTime
     ORDER BY best.RunTime ASC
     LIMIT ?`,
    [mapCourse.MapCourseID, mode, mapCourse.MapCourseID, mode, limit]
  )

  return rows.map((row, index) => ({
    rank: index + 1,
    steamId32: row.SteamID32 as number,
    alias: row.Alias as string | null,
    country: row.Country as string | null,
    runTimeMs: row.RunTime as number,
    teleports: row.Teleports as number,
    createdAt: row.Created as string
  }))
})
