import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import middleware from '~/app/middleware/section-guard.global'

// This global route middleware uses Nuxt's defineNuxtRouteMiddleware/useRuntimeConfig/
// abortNavigation, auto-imported (not explicitly imported) like the rest of the app code.
// defineNuxtRouteMiddleware is just an identity wrapper in real Nuxt, so it's stubbed as
// such here; abortNavigation is stubbed to return whatever it was called with so its
// argument (the createError() result) can be asserted directly.
function stubRuntimeConfig(pub: { gokzEnabled: boolean; kztimerEnabled: boolean }) {
  vi.stubGlobal('useRuntimeConfig', () => ({ public: pub }))
  vi.stubGlobal('abortNavigation', (err: unknown) => err)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('section-guard.global middleware', () => {
  beforeEach(() => {
    stubRuntimeConfig({ gokzEnabled: false, kztimerEnabled: false })
  })

  it('blocks /gokz routes with a 404 when GOKZ is disabled', () => {
    const result = middleware({ path: '/gokz/maps' } as never, {} as never)

    expect(result).toMatchObject({ statusCode: 404, statusMessage: 'GOKZ is not configured on this server' })
  })

  it('blocks /kztimer routes with a 404 when KZTimer is disabled', () => {
    const result = middleware({ path: '/kztimer/ranks' } as never, {} as never)

    expect(result).toMatchObject({ statusCode: 404, statusMessage: 'KZTimer is not configured on this server' })
  })

  it('allows /gokz routes through when GOKZ is enabled', () => {
    stubRuntimeConfig({ gokzEnabled: true, kztimerEnabled: false })

    const result = middleware({ path: '/gokz/maps' } as never, {} as never)

    expect(result).toBeUndefined()
  })

  it('allows unrelated routes through regardless of config', () => {
    const result = middleware({ path: '/' } as never, {} as never)

    expect(result).toBeUndefined()
  })
})
