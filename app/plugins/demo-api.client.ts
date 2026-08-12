import { matchDemoRoute } from '../mocks/router'

// Offline GH Pages demo: there's no Nitro server to answer /api/** once this is a static
// export, so when NUXT_PUBLIC_DEMO_MODE is set we intercept those requests in the browser
// and answer them from the generated fixtures in app/mocks/. Every page still calls
// useFetch('/api/...') exactly as it does against a real server.
export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig()
  if (!pub.demoMode) return

  const realFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const rawUrl = input instanceof Request ? input.url : input
    const url = new URL(rawUrl, window.location.href)
    const apiIndex = url.pathname.indexOf('/api/')

    if (apiIndex !== -1) {
      const apiPath = url.pathname.slice(apiIndex + '/api/'.length)
      const match = matchDemoRoute(apiPath, url.searchParams)
      if (match) {
        // Small artificial delay so loading states are visible, like a real network call.
        await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 160))
        return new Response(JSON.stringify(match.body), {
          status: match.status,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return realFetch(input as RequestInfo, init)
  }
})
