// Community-maintained map screenshot index: https://github.com/KZGlobalTeam/map-images
const MAPS_JSON_URL = 'https://raw.githubusercontent.com/KZGlobalTeam/map-images/refs/heads/public/maps.min.json'
const CACHE_TTL_MS = 1000 * 60 * 60 * 12

let cache: Map<string, string> | null = null
let cachedAt = 0
let inflight: Promise<Map<string, string>> | null = null

async function fetchMapImageIndex(): Promise<Map<string, string>> {
  try {
    // raw.githubusercontent.com serves .json files as text/plain, so force JSON parsing
    const raw = await $fetch<Array<{ name: string, webp: string }>>(MAPS_JSON_URL, {
      responseType: 'json'
    })
    if (!Array.isArray(raw)) {
      console.error('Unexpected map-images response shape', typeof raw)
      return new Map()
    }
    const index = new Map<string, string>()
    for (const entry of raw) {
      index.set(entry.name, entry.webp)
    }
    return index
  } catch (error) {
    console.error('Failed to fetch KZGlobalTeam map-images index', error)
    return new Map()
  }
}

async function getMapImageIndex(): Promise<Map<string, string>> {
  const stale = !cache || Date.now() - cachedAt > CACHE_TTL_MS
  if (stale && !inflight) {
    inflight = fetchMapImageIndex().then((index) => {
      cache = index
      cachedAt = Date.now()
      inflight = null
      return index
    })
  }
  // Serve the existing cache immediately if we have one, refreshing in the background;
  // only block on the network the very first time.
  return cache ?? inflight!
}

// Returns the full-size webp screenshot URL for a map, or null if none exists
export async function getMapImage(mapName: string): Promise<string | null> {
  const index = await getMapImageIndex()
  return index.get(mapName) ?? null
}

export async function getMapImages(mapNames: string[]): Promise<Map<string, string>> {
  const index = await getMapImageIndex()
  const result = new Map<string, string>()
  for (const name of mapNames) {
    const url = index.get(name)
    if (url) result.set(name, url)
  }
  return result
}
