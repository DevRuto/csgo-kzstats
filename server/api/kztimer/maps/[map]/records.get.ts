import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const mapName = getRouterParam(event, 'map')
  if (!mapName) {
    throw createError({ statusCode: 400, statusMessage: 'Map name is required' })
  }

  const query = getQuery(event)
  const type = query.type === 'tp' ? 'tp' : 'pro'
  const limit = Math.min(Number(query.limit) || 100, 200)

  const db = kztimerDb()

  const timeColumn = type === 'pro' ? 'runtimepro' : 'runtime'
  const teleportsColumn = type === 'pro' ? 'teleports_pro' : 'teleports'

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT steamid, name, ${timeColumn} AS runtime, ${teleportsColumn} AS teleports
     FROM playertimes
     WHERE mapname = ? AND ${timeColumn} > 0
     ORDER BY ${timeColumn} ASC
     LIMIT ?`,
    [mapName, limit]
  )

  return rows.map((row, index) => ({
    rank: index + 1,
    steamId: row.steamid as string,
    name: row.name as string,
    runTime: Number(row.runtime),
    teleports: row.teleports as number
  }))
})
