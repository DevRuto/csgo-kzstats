import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  const db = kztimerDb()
  const params: unknown[] = []
  let where = ''
  if (search) {
    where = 'WHERE mapname LIKE ?'
    params.push(`%${search}%`)
  }

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT mapname, COUNT(*) AS players
     FROM playertimes
     ${where}
     GROUP BY mapname
     ORDER BY mapname ASC`,
    params
  )

  return rows.map(row => ({
    name: row.mapname as string,
    players: row.players as number
  }))
})
