import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async () => {
  const db = kztimerDb()

  const [[mapRow]] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(DISTINCT mapname) AS count FROM playertimes'
  )
  const [[playerRow]] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS count FROM playerrank'
  )
  const [[runRow]] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS count FROM playertimes'
  )

  return {
    maps: mapRow.count as number,
    players: playerRow.count as number,
    personalBests: runRow.count as number
  }
})
