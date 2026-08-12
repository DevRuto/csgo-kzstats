import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const steamId32 = Number(getRouterParam(event, 'steamId32'))
  if (!Number.isInteger(steamId32)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid SteamID32' })
  }

  const query = getQuery(event)
  const mode = Number(query.mode ?? 2)
  const type = query.type === 'tp' ? 'tp' : 'pro'

  if (!(mode in GOKZ_MODES)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mode' })
  }

  const db = gokzDb()
  const teleportCondition = type === 'pro' ? 'Teleports = 0' : 'Teleports > 0'

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT m.Name AS MapName, mc.Course, ranked.RunTime, ranked.Rank,
            MIN(t.Teleports) AS Teleports, MIN(t.Created) AS Created
     FROM (
       SELECT SteamID32, MapCourseID, RunTime,
              RANK() OVER (PARTITION BY MapCourseID ORDER BY RunTime ASC) AS Rank
       FROM (
         SELECT SteamID32, MapCourseID, MIN(RunTime) AS RunTime
         FROM Times
         WHERE Mode = ? AND ${teleportCondition}
         GROUP BY SteamID32, MapCourseID
       ) pb
     ) ranked
     JOIN MapCourses mc ON mc.MapCourseID = ranked.MapCourseID
     JOIN Maps m ON m.MapID = mc.MapID
     JOIN Times t ON t.MapCourseID = ranked.MapCourseID AND t.SteamID32 = ranked.SteamID32
                  AND t.Mode = ? AND ${teleportCondition} AND t.RunTime = ranked.RunTime
     WHERE ranked.SteamID32 = ?
     GROUP BY m.Name, mc.Course, ranked.RunTime, ranked.Rank
     ORDER BY m.Name ASC, mc.Course ASC`,
    [mode, mode, steamId32]
  )

  return rows.map(row => ({
    map: row.MapName as string,
    course: row.Course as number,
    rank: row.Rank as number,
    runTimeMs: row.RunTime as number,
    teleports: row.Teleports as number,
    createdAt: row.Created as string
  }))
})
