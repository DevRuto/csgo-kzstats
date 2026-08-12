// Small deterministic PRNG + helpers used to generate the offline demo dataset.
// Seeded so the demo looks the same across builds/screenshots.

export function mulberry32(seed: number): () => number {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

export function randFloat(rand: () => number, min: number, max: number): number {
  return rand() * (max - min) + min
}

export function pickN<T>(rand: () => number, items: T[], n: number): T[] {
  const pool = [...items]
  const picked: T[] = []
  const count = Math.min(n, pool.length)
  for (let i = 0; i < count; i++) {
    const index = Math.floor(rand() * pool.length)
    picked.push(pool.splice(index, 1)[0]!)
  }
  return picked
}

// Formats a point in time as "YYYY-MM-DD HH:MM:SS", matching the string shape
// mysql2's `dateStrings: true` returns for DATETIME columns in the real app.
export function timestampAgo(rand: () => number, maxDaysAgo: number, minDaysAgo = 0): string {
  const ms = Date.now() - randInt(rand, minDaysAgo * 86400000, maxDaysAgo * 86400000)
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
