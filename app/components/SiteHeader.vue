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
  <header class="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-10">
    <div class="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <NuxtLink to="/" class="font-semibold tracking-tight text-neutral-100 hover:text-amber-400 transition-colors">
        kzstats<span class="text-amber-400">.local</span>
      </NuxtLink>

      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink
          v-if="pub.gokzEnabled"
          to="/gokz"
          class="transition-colors"
          :class="section === 'gokz' ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-100'"
        >
          GOKZ
        </NuxtLink>
        <NuxtLink
          v-if="pub.kztimerEnabled"
          to="/kztimer"
          class="transition-colors"
          :class="section === 'kztimer' ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-100'"
        >
          KZTimer
        </NuxtLink>
      </nav>

      <nav v-if="section === 'gokz'" class="flex items-center gap-4 text-sm ml-auto">
        <NuxtLink to="/gokz/maps" class="text-neutral-400 hover:text-neutral-100 transition-colors">Maps</NuxtLink>
        <NuxtLink to="/gokz/jumpstats" class="text-neutral-400 hover:text-neutral-100 transition-colors">Jumpstats</NuxtLink>
      </nav>
      <nav v-else-if="section === 'kztimer'" class="flex items-center gap-4 text-sm ml-auto">
        <NuxtLink to="/kztimer/maps" class="text-neutral-400 hover:text-neutral-100 transition-colors">Maps</NuxtLink>
        <NuxtLink to="/kztimer/ranks" class="text-neutral-400 hover:text-neutral-100 transition-colors">Ranks</NuxtLink>
        <NuxtLink to="/kztimer/jumpstats" class="text-neutral-400 hover:text-neutral-100 transition-colors">Jumpstats</NuxtLink>
      </nav>
    </div>
  </header>
</template>
