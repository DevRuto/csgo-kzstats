<script setup lang="ts">
const { data: stats } = await useFetch('/api/gokz/stats')

const mode = ref(2)
const type = ref<'pro' | 'tp'>('pro')
const modeOptions = GOKZ_MODE_TAB_OPTIONS
const typeOptions = [
  { label: 'Pro', value: 'pro' },
  { label: 'TP', value: 'tp' }
]

const { data: topPlayers, status: topPlayersStatus } = await useFetch('/api/gokz/top-players', {
  query: { mode, type }
})

const { data: recent, status: recentStatus } = await useFetch('/api/gokz/recent')
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-neutral-100 mb-6">GOKZ</h1>

    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
      <StatCard label="Maps" :value="stats.maps" />
      <StatCard label="Players" :value="stats.players" />
      <StatCard v-for="m in stats.modes" :key="m.mode" :label="`${m.name} runs`" :value="m.runs" />
    </div>

    <div class="grid gap-10 lg:grid-cols-2">
      <section>
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold text-neutral-100">Top players by world records held</h2>
        </div>
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <TabGroup v-model="mode" :options="modeOptions" />
          <TabGroup v-model="type" :options="typeOptions" />
        </div>

        <div class="rounded-lg border border-neutral-800 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-neutral-900 text-neutral-500 text-left">
              <tr>
                <th class="px-4 py-2 font-medium">Rank</th>
                <th class="px-4 py-2 font-medium">Player</th>
                <th class="px-4 py-2 font-medium text-right">WRs</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800">
              <tr v-if="topPlayersStatus === 'pending'">
                <td colspan="3" class="px-4 py-6 text-center text-neutral-500">Loading&hellip;</td>
              </tr>
              <tr v-else-if="!topPlayers?.length">
                <td colspan="3" class="px-4 py-6 text-center text-neutral-500">No records yet.</td>
              </tr>
              <tr v-for="p in topPlayers" :key="p.steamId32" class="hover:bg-neutral-900/50">
                <td class="px-4 py-2"><RankBadge :rank="p.rank" /></td>
                <td class="px-4 py-2 text-neutral-200">
                  {{ p.alias ?? 'Unknown' }}
                  <span v-if="p.country" class="text-neutral-500 text-xs ml-1">{{ p.country }}</span>
                </td>
                <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-200">{{ p.worldRecords }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-neutral-100 mb-4">Recent activity</h2>
        <div class="rounded-lg border border-neutral-800 divide-y divide-neutral-800 max-h-[30rem] overflow-y-auto">
          <div v-if="recentStatus === 'pending'" class="px-4 py-6 text-center text-neutral-500 text-sm">Loading&hellip;</div>
          <div v-else-if="!recent?.length" class="px-4 py-6 text-center text-neutral-500 text-sm">No activity yet.</div>
          <div v-for="r in recent" :key="r.id" class="px-4 py-2.5 text-sm flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-neutral-200 truncate">
                <span class="font-medium">{{ r.alias ?? 'Unknown' }}</span>
                <span class="text-neutral-500"> on </span>
                <NuxtLink :to="`/gokz/maps/${r.map}`" class="hover:text-amber-400">{{ r.map }}</NuxtLink>
              </div>
              <div class="text-neutral-500 text-xs">
                {{ r.modeName }} &middot; {{ r.isPro ? 'Pro' : `TP (${r.teleports})` }} &middot; {{ formatDurationMs(r.runTimeMs) }}
              </div>
            </div>
            <div class="text-neutral-600 text-xs whitespace-nowrap">{{ new Date(r.createdAt).toLocaleDateString() }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
