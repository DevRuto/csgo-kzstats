<script setup lang="ts">
const search = ref('')
const debouncedSearch = ref('')
let timer: ReturnType<typeof setTimeout>

watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debouncedSearch.value = value }, 250)
})

const { data: maps, status } = await useFetch('/api/kztimer/maps', {
  query: { search: debouncedSearch }
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-neutral-100">KZTimer Maps</h1>
      <input
        v-model="search"
        type="search"
        placeholder="Search maps&hellip;"
        class="w-64 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400/50"
      >
    </div>

    <div v-if="status === 'pending'" class="text-neutral-500 text-sm">Loading&hellip;</div>
    <div v-else-if="!maps?.length" class="text-neutral-500 text-sm">No maps found.</div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="map in maps"
        :key="map.name"
        :to="`/kztimer/maps/${map.name}`"
        class="group rounded-lg border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-amber-400/50 transition-colors"
      >
        <MapThumb :src="map.image" :alt="map.name" />
        <div class="px-4 py-3">
          <div class="text-neutral-200 font-medium truncate group-hover:text-amber-400 transition-colors">{{ map.name }}</div>
          <div class="text-xs text-neutral-500 mt-1">{{ map.players }} player{{ map.players === 1 ? '' : 's' }}</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
