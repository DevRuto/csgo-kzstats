// https://nuxt.com/docs/api/configuration/nuxt-config

// `??` (not `||`) so an explicitly empty DB_*_DATABASE ("leave it blank to disable this
// section") is preserved instead of falling back to the default name.
const gokzDatabase = process.env.DB_GOKZ_DATABASE ?? 'gokz'
const kztimerDatabase = process.env.DB_KZTIMER_DATABASE ?? 'kztimer'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'kzstats-local',
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
      gokzEnabled: gokzDatabase !== '',
      kztimerEnabled: kztimerDatabase !== ''
    }
  }
})
