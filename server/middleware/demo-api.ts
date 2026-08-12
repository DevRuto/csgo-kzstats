import { matchDemoRoute } from '../../app/mocks/router'

// Offline demo build (DEMO=true, see nuxt.config.ts): answers /api/** from the fixtures in
// app/mocks/ instead of a real database, so `nuxt generate`'s SSR prerendering doesn't need a
// live GOKZ/KZTimer DB. Runs before the real server/api/** handlers and short-circuits the
// request when it matches; otherwise falls through untouched. The equivalent client-side
// interception (needed once this is static-hosted with no server at all) lives in
// app/plugins/demo-api.client.ts.
export default defineEventHandler((event) => {
  const { public: pub } = useRuntimeConfig(event)
  if (!pub.demoMode) return

  const path = event.path || ''
  const apiIndex = path.indexOf('/api/')
  if (apiIndex === -1) return

  const [pathname, search] = path.slice(apiIndex + '/api/'.length).split('?')
  const match = matchDemoRoute(pathname ?? '', new URLSearchParams(search ?? ''))
  if (!match) return

  setResponseStatus(event, match.status)
  return match.body
})
