<script setup lang="ts">
const search = ref('')
const debouncedSearch = ref('')
let timer: ReturnType<typeof setTimeout>

watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debouncedSearch.value = value }, 250)
})

const { data: maps, status } = await useFetch('/api/gokz/maps', {
  query: { search: debouncedSearch }
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-ink-100">GOKZ Maps</h1>
      <input
        v-model="search"
        type="search"
        placeholder="Search maps&hellip;"
        class="w-64 rounded-lg border border-ink-800 bg-ink-900 px-3 py-1.5 text-sm text-ink-100 placeholder:text-ink-600 focus:outline-none focus:border-accent/50"
      >
    </div>

    <div v-if="status === 'pending'" class="text-ink-500 text-sm">Loading&hellip;</div>
    <div v-else-if="!maps?.length" class="text-ink-500 text-sm">No maps found.</div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="map in maps"
        :key="map.id"
        :to="`/gokz/maps/${map.name}`"
        class="group rounded-lg border border-ink-800 bg-ink-900/60 overflow-hidden hover:border-accent/50 transition-colors"
      >
        <MapThumb :src="map.image" :alt="map.name" />
        <div class="px-4 py-3">
          <div class="text-ink-200 font-medium truncate group-hover:text-accent transition-colors">{{ map.name }}</div>
          <div class="text-xs text-ink-500 mt-1 flex items-center gap-2">
            <span v-if="map.inRankedPool" class="text-accent/80">Ranked</span>
            <span v-if="map.courseCount > 1">{{ map.courseCount }} courses</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
