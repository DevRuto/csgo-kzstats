import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const mapName = getRouterParam(event, 'map')
  if (!mapName) {
    throw createError({ statusCode: 400, statusMessage: 'Map name is required' })
  }

  const db = kztimerDb()
  const [[row]] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS players FROM playertimes WHERE mapname = ?',
    [mapName]
  )

  if (!row || row.players === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Map not found' })
  }

  const image = await getMapImage(mapName)

  return {
    name: mapName,
    players: row.players as number,
    image
  }
})
