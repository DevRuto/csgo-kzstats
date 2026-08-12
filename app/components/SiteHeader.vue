<script setup lang="ts">
const route = useRoute()
const { public: pub } = useRuntimeConfig()
const section = computed(() => {
  if (route.path.startsWith('/gokz')) return 'gokz'
  if (route.path.startsWith('/kztimer')) return 'kztimer'
  return null
})
</script>

<template>
  <header class="border-b border-ink-800 bg-ink-950/80 backdrop-blur sticky top-0 z-10">
    <div class="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <NuxtLink to="/" class="font-semibold tracking-tight text-ink-100 hover:text-accent transition-colors">
        csgo<span class="text-accent">.kzstats</span>
      </NuxtLink>

      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink
          v-if="pub.gokzEnabled"
          to="/gokz"
          class="transition-colors"
          :class="section === 'gokz' ? 'text-accent' : 'text-ink-400 hover:text-ink-100'"
        >
          GOKZ
        </NuxtLink>
        <NuxtLink
          v-if="pub.kztimerEnabled"
          to="/kztimer"
          class="transition-colors"
          :class="section === 'kztimer' ? 'text-accent' : 'text-ink-400 hover:text-ink-100'"
        >
          KZTimer
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4 ml-auto">
        <nav v-if="section === 'gokz'" class="flex items-center gap-4 text-sm">
          <NuxtLink to="/gokz/maps" class="text-ink-400 hover:text-ink-100 transition-colors">Maps</NuxtLink>
          <NuxtLink to="/gokz/jumpstats" class="text-ink-400 hover:text-ink-100 transition-colors">Jumpstats</NuxtLink>
        </nav>
        <nav v-else-if="section === 'kztimer'" class="flex items-center gap-4 text-sm">
          <NuxtLink to="/kztimer/maps" class="text-ink-400 hover:text-ink-100 transition-colors">Maps</NuxtLink>
          <NuxtLink to="/kztimer/ranks" class="text-ink-400 hover:text-ink-100 transition-colors">Ranks</NuxtLink>
          <NuxtLink to="/kztimer/jumpstats" class="text-ink-400 hover:text-ink-100 transition-colors">Jumpstats</NuxtLink>
        </nav>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
