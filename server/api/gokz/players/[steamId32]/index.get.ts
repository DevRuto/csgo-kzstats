import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const steamId32 = Number(getRouterParam(event, 'steamId32'))
  if (!Number.isInteger(steamId32)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid SteamID32' })
  }

  const db = gokzDb()
  const [[player]] = await db.query<RowDataPacket[]>(
    'SELECT SteamID32, Alias, Country FROM Players WHERE SteamID32 = ?',
    [steamId32]
  )

  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  }

  return {
    steamId32: player.SteamID32 as number,
    alias: player.Alias as string | null,
    country: player.Country as string | null
  }
})
