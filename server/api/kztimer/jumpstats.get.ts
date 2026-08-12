import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = typeof query.type === 'string' ? query.type : 'lj'
  const limit = Math.min(Number(query.limit) || 100, 200)

  const entry = KZTIMER_JUMP_TYPES[type]
  if (!entry) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid jump type' })
  }

  const db = kztimerDb()
  const p = entry.prefix

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT steamid, name, \`${p}record\` AS record, \`${p}pre\` AS pre,
            \`${p}max\` AS max, \`${p}strafes\` AS strafes, \`${p}sync\` AS sync
     FROM playerjumpstats3
     WHERE \`${p}record\` > 0
     ORDER BY \`${p}record\` DESC
     LIMIT ?`,
    [limit]
  )

  return rows.map((row, index) => ({
    rank: index + 1,
    steamId: row.steamid as string,
    name: row.name as string,
    record: Number(row.record),
    pre: Number(row.pre),
    max: Number(row.max),
    strafes: row.strafes as number,
    sync: row.sync as number
  }))
})
