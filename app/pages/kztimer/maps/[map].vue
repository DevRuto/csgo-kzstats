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
      <NuxtLink to="/kztimer/maps" class="text-sm text-ink-500 hover:text-ink-300">&larr; All maps</NuxtLink>

      <div
        v-if="map?.image"
        class="relative mt-2 h-48 sm:h-64 rounded-xl overflow-hidden border border-ink-800 bg-ink-900"
      >
        <img :src="map.image" :alt="mapName" class="h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
        <div class="absolute inset-x-0 bottom-0 px-5 py-4">
          <h1 class="text-2xl font-bold text-ink-100">{{ mapName }}</h1>
        </div>
      </div>

      <h1 v-else class="text-2xl font-bold text-ink-100 mt-1">{{ mapName }}</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <TabGroup v-model="type" :options="typeOptions" />
    </div>

    <div class="rounded-lg border border-ink-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-ink-900 text-ink-500 text-left">
          <tr>
            <th class="px-4 py-2 font-medium">Rank</th>
            <th class="px-4 py-2 font-medium">Player</th>
            <th class="px-4 py-2 font-medium text-right">Time</th>
            <th class="px-4 py-2 font-medium text-right">Teleports</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink-800">
          <tr v-if="status === 'pending'">
            <td colspan="4" class="px-4 py-6 text-center text-ink-500">Loading&hellip;</td>
          </tr>
          <tr v-else-if="!records?.length">
            <td colspan="4" class="px-4 py-6 text-center text-ink-500">No {{ type === 'pro' ? 'Pro' : 'TP' }} records for this map yet.</td>
          </tr>
          <tr v-for="r in records" :key="r.steamId" class="hover:bg-ink-900/50">
            <td class="px-4 py-2"><RankBadge :rank="r.rank" /></td>
            <td class="px-4 py-2 text-ink-200">
              <NuxtLink :to="`/players/${steam2ToSteamId32(r.steamId)}`" class="hover:text-accent">{{ r.name }}</NuxtLink>
            </td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-200">{{ formatDuration(r.runTime) }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-400">{{ r.teleports }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
