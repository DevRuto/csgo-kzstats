import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// mapImages.ts caches its fetch result in module-scoped variables, so each test needs a
// fresh module instance (vi.resetModules + dynamic import) to avoid bleeding state between tests.
const $fetchMock = vi.fn()

beforeEach(() => {
  vi.resetModules()
  $fetchMock.mockReset()
  vi.stubGlobal('$fetch', $fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function loadMapImages() {
  return import('../../../../server/utils/mapImages')
}

describe('getMapImage / getMapImages', () => {
  it('returns the webp url for a known map', async () => {
    $fetchMock.mockResolvedValue([{ name: 'kz_map1', webp: 'https://example.com/kz_map1.webp' }])
    const { getMapImage } = await loadMapImages()

    await expect(getMapImage('kz_map1')).resolves.toBe('https://example.com/kz_map1.webp')
  })

  it('returns null for an unknown map', async () => {
    $fetchMock.mockResolvedValue([{ name: 'kz_map1', webp: 'https://example.com/kz_map1.webp' }])
    const { getMapImage } = await loadMapImages()

    await expect(getMapImage('kz_unknown')).resolves.toBeNull()
  })

  it('only includes entries found in the index, preserving lookup by name', async () => {
    $fetchMock.mockResolvedValue([
      { name: 'kz_map1', webp: 'https://example.com/1.webp' },
      { name: 'kz_map2', webp: 'https://example.com/2.webp' }
    ])
    const { getMapImages } = await loadMapImages()

    const result = await getMapImages(['kz_map1', 'kz_missing', 'kz_map2'])
    expect(result).toEqual(
      new Map([
        ['kz_map1', 'https://example.com/1.webp'],
        ['kz_map2', 'https://example.com/2.webp']
      ])
    )
  })

  it('returns an empty map/null when the upstream fetch fails, without throwing', async () => {
    $fetchMock.mockRejectedValue(new Error('network error'))
    const { getMapImage, getMapImages } = await loadMapImages()

    await expect(getMapImage('kz_map1')).resolves.toBeNull()
    await expect(getMapImages(['kz_map1'])).resolves.toEqual(new Map())
  })

  it('returns an empty map when the upstream response is not an array', async () => {
    $fetchMock.mockResolvedValue({ unexpected: 'shape' })
    const { getMapImage } = await loadMapImages()

    await expect(getMapImage('kz_map1')).resolves.toBeNull()
  })

  it('reuses the cached index instead of refetching within the TTL window', async () => {
    $fetchMock.mockResolvedValue([{ name: 'kz_map1', webp: 'https://example.com/1.webp' }])
    const { getMapImage } = await loadMapImages()

    await getMapImage('kz_map1')
    await getMapImage('kz_map1')
    await getMapImage('kz_map1')

    expect($fetchMock).toHaveBeenCalledTimes(1)
  })

  it('serves stale data immediately and refreshes in the background once the TTL expires', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    $fetchMock.mockResolvedValue([{ name: 'kz_map1', webp: 'https://example.com/stale.webp' }])
    const { getMapImage } = await loadMapImages()

    await expect(getMapImage('kz_map1')).resolves.toBe('https://example.com/stale.webp')
    expect($fetchMock).toHaveBeenCalledTimes(1)

    // Move past the 12h cache TTL and let the background refresh resolve to fresh data.
    vi.setSystemTime(new Date('2026-01-01T13:00:00Z'))
    $fetchMock.mockResolvedValue([{ name: 'kz_map1', webp: 'https://example.com/fresh.webp' }])

    const staleResult = await getMapImage('kz_map1')
    expect(staleResult).toBe('https://example.com/stale.webp')
    expect($fetchMock).toHaveBeenCalledTimes(2)

    await vi.waitFor(async () => {
      expect(await getMapImage('kz_map1')).toBe('https://example.com/fresh.webp')
    })
  })
})
