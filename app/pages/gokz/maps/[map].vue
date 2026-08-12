<script setup lang="ts">
const route = useRoute()
const mapName = computed(() => route.params.map as string)

const { data: map, error } = await useFetch(() => `/api/gokz/maps/${mapName.value}`)
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Map not found' })
}

const mode = ref(2)
const modeOptions = GOKZ_MODE_TAB_OPTIONS
const type = ref<'pro' | 'tp'>('pro')
const typeOptions = [
  { label: 'Pro', value: 'pro' },
  { label: 'TP', value: 'tp' }
]
const course = ref(0)

const { data: records, status } = await useFetch(() => `/api/gokz/maps/${mapName.value}/records`, {
  query: { mode, type, course }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/gokz/maps" class="text-sm text-neutral-500 hover:text-neutral-300">&larr; All maps</NuxtLink>

      <div
        v-if="map?.image"
        class="relative mt-2 h-48 sm:h-64 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900"
      >
        <img :src="map.image" :alt="mapName" class="h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
        <div class="absolute inset-x-0 bottom-0 px-5 py-4">
          <h1 class="text-2xl font-bold text-neutral-100">{{ mapName }}</h1>
          <div class="text-sm text-neutral-300 mt-1 flex items-center gap-2">
            <span v-if="map.inRankedPool" class="text-amber-400">Ranked</span>
            <span v-if="map.lastPlayed">Last played {{ new Date(map.lastPlayed).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <template v-else>
        <h1 class="text-2xl font-bold text-neutral-100 mt-1">{{ mapName }}</h1>
        <div v-if="map" class="text-sm text-neutral-500 mt-1 flex items-center gap-2">
          <span v-if="map.inRankedPool" class="text-amber-400/80">Ranked</span>
          <span v-if="map.lastPlayed">Last played {{ new Date(map.lastPlayed).toLocaleDateString() }}</span>
        </div>
      </template>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <TabGroup v-model="mode" :options="modeOptions" />
      <TabGroup v-model="type" :options="typeOptions" />
      <TabGroup
        v-if="map && map.courses.length > 1"
        v-model="course"
        :options="map.courses.map(c => ({ label: c.course === 0 ? 'Main' : `Bonus ${c.course}`, value: c.course }))"
      />
    </div>

    <div class="rounded-lg border border-neutral-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-neutral-900 text-neutral-500 text-left">
          <tr>
            <th class="px-4 py-2 font-medium">Rank</th>
            <th class="px-4 py-2 font-medium">Player</th>
            <th class="px-4 py-2 font-medium text-right">Time</th>
            <th v-if="type === 'tp'" class="px-4 py-2 font-medium text-right">Teleports</th>
            <th class="px-4 py-2 font-medium text-right">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-800">
          <tr v-if="status === 'pending'">
            <td colspan="5" class="px-4 py-6 text-center text-neutral-500">Loading&hellip;</td>
          </tr>
          <tr v-else-if="!records?.length">
            <td colspan="5" class="px-4 py-6 text-center text-neutral-500">No records for this mode/course yet.</td>
          </tr>
          <tr v-for="r in records" :key="r.steamId32" class="hover:bg-neutral-900/50">
            <td class="px-4 py-2"><RankBadge :rank="r.rank" /></td>
            <td class="px-4 py-2 text-neutral-200">
              {{ r.alias ?? 'Unknown' }}
              <span v-if="r.country" class="text-neutral-500 text-xs ml-1">{{ r.country }}</span>
            </td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-200">{{ formatDurationMs(r.runTimeMs) }}</td>
            <td v-if="type === 'tp'" class="px-4 py-2 text-right font-mono tabular-nums text-neutral-400">{{ r.teleports }}</td>
            <td class="px-4 py-2 text-right text-neutral-500 text-xs">{{ new Date(r.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
