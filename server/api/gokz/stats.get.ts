import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async () => {
  const db = gokzDb()

  const [[mapRow]] = await db.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM Maps')
  const [[playerRow]] = await db.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM Players')
  const [modeRows] = await db.query<RowDataPacket[]>(
    `SELECT Mode, COUNT(*) AS runs, COUNT(DISTINCT SteamID32) AS players
     FROM Times
     GROUP BY Mode
     ORDER BY Mode ASC`
  )

  return {
    maps: mapRow.count as number,
    players: playerRow.count as number,
    modes: modeRows.map(row => ({
      mode: row.Mode as number,
      name: gokzModeName(row.Mode as number),
      runs: row.runs as number,
      players: row.players as number
    }))
  }
})
