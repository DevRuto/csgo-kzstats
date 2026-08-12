<script setup lang="ts">
const route = useRoute()
const mapName = computed(() => route.params.map as string)

const { data: map } = await useFetch(() => `/api/kztimer/maps/${mapName.value}`)

const type = ref<'pro' | 'tp'>('pro')
const typeOptions = [
  { label: 'Pro', value: 'pro' },
  { label: 'TP', value: 'tp' }
]

const { data: records, status } = await useFetch(() => `/api/kztimer/maps/${mapName.value}/records`, {
  query: { type }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/kztimer/maps" class="text-sm text-neutral-500 hover:text-neutral-300">&larr; All maps</NuxtLink>

      <div
        v-if="map?.image"
        class="relative mt-2 h-48 sm:h-64 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900"
      >
        <img :src="map.image" :alt="mapName" class="h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
        <div class="absolute inset-x-0 bottom-0 px-5 py-4">
          <h1 class="text-2xl font-bold text-neutral-100">{{ mapName }}</h1>
        </div>
      </div>

      <h1 v-else class="text-2xl font-bold text-neutral-100 mt-1">{{ mapName }}</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <TabGroup v-model="type" :options="typeOptions" />
    </div>

    <div class="rounded-lg border border-neutral-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-neutral-900 text-neutral-500 text-left">
          <tr>
            <th class="px-4 py-2 font-medium">Rank</th>
            <th class="px-4 py-2 font-medium">Player</th>
            <th class="px-4 py-2 font-medium text-right">Time</th>
            <th class="px-4 py-2 font-medium text-right">Teleports</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-800">
          <tr v-if="status === 'pending'">
            <td colspan="4" class="px-4 py-6 text-center text-neutral-500">Loading&hellip;</td>
          </tr>
          <tr v-else-if="!records?.length">
            <td colspan="4" class="px-4 py-6 text-center text-neutral-500">No {{ type === 'pro' ? 'Pro' : 'TP' }} records for this map yet.</td>
          </tr>
          <tr v-for="r in records" :key="r.steamId" class="hover:bg-neutral-900/50">
            <td class="px-4 py-2"><RankBadge :rank="r.rank" /></td>
            <td class="px-4 py-2 text-neutral-200">{{ r.name }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-200">{{ formatDuration(r.runTime) }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-400">{{ r.teleports }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
