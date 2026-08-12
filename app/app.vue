<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <main class="mx-auto max-w-6xl px-4 py-8">
      <NuxtPage />
    </main>
    <footer class="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-600">
      csgo-kzstats &mdash; reads directly from the local gokz and kztimer databases.
    </footer>
  </div>
</template>
