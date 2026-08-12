// Competition ranking (1, 2, 2, 4, ...) matching SQL's RANK() OVER (ORDER BY ...),
// used where the real handlers compute a player's own rank rather than just a list position.
export function competitionRank<T>(rows: T[], keyFn: (row: T) => number): (T & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => keyFn(a) - keyFn(b))
  const result: (T & { rank: number })[] = []
  let rank = 0
  let lastKey: number | null = null
  for (const [index, row] of sorted.entries()) {
    const key = keyFn(row)
    if (lastKey === null || key !== lastKey) {
      rank = index + 1
      lastKey = key
    }
    result.push({ ...row, rank })
  }
  return result
}

// Keeps only the row with the smallest keyFn() value per groupFn() bucket —
// mirrors the `GROUP BY ... MIN(...)` "personal best" pattern used throughout the real queries.
export function bestPerGroup<T>(rows: T[], groupFn: (row: T) => string | number, keyFn: (row: T) => number): T[] {
  const best = new Map<string | number, T>()
  for (const row of rows) {
    const group = groupFn(row)
    const current = best.get(group)
    if (!current || keyFn(row) < keyFn(current)) {
      best.set(group, row)
    }
  }
  return [...best.values()]
}
