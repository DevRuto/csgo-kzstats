import { vi } from 'vitest'
import type { Pool } from 'mysql2/promise'

// mysql2/promise's Pool#query() resolves to a [rows, fields] tuple. Handlers destructure
// either `const [rows] = await db.query(...)` or `const [[row]] = await db.query(...)`,
// so a single `rows` array per call satisfies both call sites.
export function fakeDb(...rowSets: unknown[][]): Pool {
  const query = vi.fn()
  for (const rows of rowSets) {
    query.mockResolvedValueOnce([rows, []])
  }
  return { query } as unknown as Pool
}
