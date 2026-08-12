import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async () => {
  const db = gokzDb()

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT t.TimeID, p.SteamID32, p.Alias, p.Country, m.Name AS MapName, mc.Course,
            t.Mode, t.Teleports, t.RunTime, t.Created
     FROM Times t
     JOIN Players p ON p.SteamID32 = t.SteamID32
     JOIN MapCourses mc ON mc.MapCourseID = t.MapCourseID
     JOIN Maps m ON m.MapID = mc.MapID
     ORDER BY t.Created DESC
     LIMIT 30`
  )

  return rows.map(row => ({
    id: row.TimeID as number,
    steamId32: row.SteamID32 as number,
    alias: row.Alias as string | null,
    country: row.Country as string | null,
    map: row.MapName as string,
    course: row.Course as number,
    mode: row.Mode as number,
    modeName: gokzModeName(row.Mode as number),
    teleports: row.Teleports as number,
    runTimeMs: row.RunTime as number,
    isPro: row.Teleports === 0,
    createdAt: row.Created as string
  }))
})
