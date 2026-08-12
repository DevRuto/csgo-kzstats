import { createPool } from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'

let gokzPool: Pool | null = null
let kztimerPool: Pool | null = null

function basePoolConfig() {
  const { db } = useRuntimeConfig()
  return {
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true as const
  }
}

export function gokzDb(): Pool {
  if (!gokzPool) {
    const { db } = useRuntimeConfig()
    gokzPool = createPool({ ...basePoolConfig(), database: db.gokzDatabase })
  }
  return gokzPool
}

export function kztimerDb(): Pool {
  if (!kztimerPool) {
    const { db } = useRuntimeConfig()
    kztimerPool = createPool({ ...basePoolConfig(), database: db.kztimerDatabase })
  }
  return kztimerPool
}
