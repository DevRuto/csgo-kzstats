import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const steamId = getRouterParam(event, 'steamId')
  if (!steamId) {
    throw createError({ statusCode: 400, statusMessage: 'SteamID is required' })
  }

  const query = getQuery(event)
  const type = query.type === 'tp' ? 'tp' : 'pro'

  const db = kztimerDb()

  const timeColumn = type === 'pro' ? 'runtimepro' : 'runtime'
  const teleportsColumn = type === 'pro' ? 'teleports_pro' : 'teleports'

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT ranked.mapname, ranked.runtime, ranked.teleports, ranked.rnk
     FROM (
       SELECT mapname, steamid, ${timeColumn} AS runtime, ${teleportsColumn} AS teleports,
              RANK() OVER (PARTITION BY mapname ORDER BY ${timeColumn} ASC) AS rnk
       FROM playertimes
       WHERE ${timeColumn} > 0
     ) ranked
     WHERE ranked.steamid = ?
     ORDER BY ranked.mapname ASC`,
    [steamId]
  )

  return rows.map(row => ({
    map: row.mapname as string,
    rank: row.rnk as number,
    runTime: Number(row.runtime),
    teleports: row.teleports as number
  }))
})
