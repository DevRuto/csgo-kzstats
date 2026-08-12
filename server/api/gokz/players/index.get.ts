import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const limit = Math.min(Number(query.limit) || 20, 50)

  if (!search) {
    return []
  }

  const db = gokzDb()

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT SteamID32, Alias, Country
     FROM Players
     WHERE Alias LIKE ?
     ORDER BY Alias ASC
     LIMIT ?`,
    [`%${search}%`, limit]
  )

  return rows.map(row => ({
    steamId32: row.SteamID32 as number,
    alias: row.Alias as string | null,
    country: row.Country as string | null
  }))
})
