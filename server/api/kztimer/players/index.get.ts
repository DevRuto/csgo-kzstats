import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const limit = Math.min(Number(query.limit) || 20, 50)

  if (!search) {
    return []
  }

  const db = kztimerDb()

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT steamid, name, country
     FROM playerrank
     WHERE name LIKE ?
     ORDER BY name ASC
     LIMIT ?`,
    [`%${search}%`, limit]
  )

  return rows.map(row => ({
    steamId: row.steamid as string,
    name: row.name as string,
    country: row.country as string | null
  }))
})
