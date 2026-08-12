// https://nuxt.com/docs/api/configuration/nuxt-config

// `??` (not `||`) so an explicitly empty DB_*_DATABASE ("leave it blank to disable this
// section") is preserved instead of falling back to the default name.
const gokzDatabase = process.env.DB_GOKZ_DATABASE ?? 'gokz'
const kztimerDatabase = process.env.DB_KZTIMER_DATABASE ?? 'kztimer'

// Offline demo build for GH Pages (see app/mocks/, server/middleware/demo-api.ts and
// app/plugins/demo-api.client.ts): with DEMO=true, /api/** is answered from generated
// fixtures instead of a real database, both during `nuxt generate` prerendering (server
// middleware) and after deployment, when pages re-fetch client-side (the client plugin).
// Rendering itself is untouched — this stays a normal SSR-prerendered `nuxt generate` build,
// just pointed at fake data, so GH Pages' project-page subpath (app.baseURL) works the same
// way it does for any other static Nuxt site.
const isDemo = process.env.DEMO === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  tailwindcss: {
    cssPath: '~/assets/css/main.css'
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark'
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'csgo-kzstats',
      meta: [
        { name: 'description', content: 'Local leaderboard for GOKZ and KZTimer records' }
      ]
    }
  },
  runtimeConfig: {
    db: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3308,
      user: process.env.DB_USER || 'kzstats',
      password: process.env.DB_PASSWORD || 'local',
      gokzDatabase,
      kztimerDatabase
    },
    public: {
      serverName: process.env.SERVER_NAME || 'Local KZ',
      gokzEnabled: gokzDatabase !== '',
      kztimerEnabled: kztimerDatabase !== '',
      demoMode: isDemo
    }
  }
})
