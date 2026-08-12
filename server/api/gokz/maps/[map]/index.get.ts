import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const mapName = getRouterParam(event, 'map')
  if (!mapName) {
    throw createError({ statusCode: 400, statusMessage: 'Map name is required' })
  }

  const db = gokzDb()
  const [[map]] = await db.query<RowDataPacket[]>(
    'SELECT MapID, Name, InRankedPool, LastPlayed, Created FROM Maps WHERE Name = ?',
    [mapName]
  )

  if (!map) {
    throw createError({ statusCode: 404, statusMessage: 'Map not found' })
  }

  const [courses] = await db.query<RowDataPacket[]>(
    'SELECT MapCourseID, Course FROM MapCourses WHERE MapID = ? ORDER BY Course ASC',
    [map.MapID]
  )

  const image = await getMapImage(map.Name as string)

  return {
    id: map.MapID as number,
    name: map.Name as string,
    inRankedPool: Boolean(map.InRankedPool),
    lastPlayed: map.LastPlayed as string | null,
    createdAt: map.Created as string,
    courses: courses.map(c => ({
      mapCourseId: c.MapCourseID as number,
      course: c.Course as number
    })),
    image
  }
})
