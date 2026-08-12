<template>
  <div class="min-h-screen bg-ink-950 text-ink-100 transition-colors">
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <main class="mx-auto max-w-6xl px-4 py-8">
      <NuxtPage />
    </main>
    <footer class="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-600">
      csgo-kzstats &mdash; reads directly from the local gokz and kztimer databases.
    </footer>
  </div>
</template>
