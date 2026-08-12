import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  const db = gokzDb()
  const params: unknown[] = []
  let where = ''
  if (search) {
    where = 'WHERE m.Name LIKE ?'
    params.push(`%${search}%`)
  }

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT m.MapID, m.Name, m.InRankedPool, m.LastPlayed,
            (SELECT COUNT(*) FROM MapCourses mc WHERE mc.MapID = m.MapID) AS CourseCount
     FROM Maps m
     ${where}
     ORDER BY m.Name ASC`,
    params
  )

  const images = await getMapImages(rows.map(row => row.Name as string))

  return rows.map(row => ({
    id: row.MapID as number,
    name: row.Name as string,
    inRankedPool: Boolean(row.InRankedPool),
    lastPlayed: row.LastPlayed as string | null,
    courseCount: row.CourseCount as number,
    image: images.get(row.Name as string) ?? null
  }))
})
