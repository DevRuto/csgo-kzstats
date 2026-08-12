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
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-ink-100">GOKZ</h1>
      <PlayerSearch system="gokz" />
    </div>

    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
      <StatCard label="Maps" :value="stats.maps" />
      <StatCard label="Players" :value="stats.players" />
      <StatCard v-for="m in stats.modes" :key="m.mode" :label="`${m.name} runs`" :value="m.runs" />
    </div>

    <div class="grid gap-10 lg:grid-cols-2">
      <section>
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold text-ink-100">Top players by server records held</h2>
        </div>
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <TabGroup v-model="mode" :options="modeOptions" />
          <TabGroup v-model="type" :options="typeOptions" />
        </div>

        <div class="rounded-lg border border-ink-800 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-ink-900 text-ink-500 text-left">
              <tr>
                <th class="px-4 py-2 font-medium">Rank</th>
                <th class="px-4 py-2 font-medium">Player</th>
                <th class="px-4 py-2 font-medium text-right">SRs</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-800">
              <tr v-if="topPlayersStatus === 'pending'">
                <td colspan="3" class="px-4 py-6 text-center text-ink-500">Loading&hellip;</td>
              </tr>
              <tr v-else-if="!topPlayers?.length">
                <td colspan="3" class="px-4 py-6 text-center text-ink-500">No records yet.</td>
              </tr>
              <tr v-for="p in topPlayers" :key="p.steamId32" class="hover:bg-ink-900/50">
                <td class="px-4 py-2"><RankBadge :rank="p.rank" /></td>
                <td class="px-4 py-2 text-ink-200">
                  <NuxtLink :to="`/players/${p.steamId32}`" class="hover:text-accent">{{ p.alias ?? 'Unknown' }}</NuxtLink>
                  <span v-if="p.country" class="text-ink-500 text-xs ml-1">{{ p.country }}</span>
                </td>
                <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-200">{{ p.serverRecords }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-ink-100 mb-4">Recent activity</h2>
        <div class="rounded-lg border border-ink-800 divide-y divide-ink-800 max-h-[30rem] overflow-y-auto">
          <div v-if="recentStatus === 'pending'" class="px-4 py-6 text-center text-ink-500 text-sm">Loading&hellip;</div>
          <div v-else-if="!recent?.length" class="px-4 py-6 text-center text-ink-500 text-sm">No activity yet.</div>
          <div v-for="r in recent" :key="r.id" class="px-4 py-2.5 text-sm flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-ink-200 truncate">
                <NuxtLink :to="`/players/${r.steamId32}`" class="font-medium hover:text-accent">{{ r.alias ?? 'Unknown' }}</NuxtLink>
                <span class="text-ink-500"> on </span>
                <NuxtLink :to="`/gokz/maps/${r.map}`" class="hover:text-accent">{{ r.map }}</NuxtLink>
              </div>
              <div class="text-ink-500 text-xs">
                {{ r.modeName }} &middot; {{ r.isPro ? 'Pro' : `TP (${r.teleports})` }} &middot; {{ formatDurationMs(r.runTimeMs) }}
              </div>
            </div>
            <div class="text-ink-600 text-xs whitespace-nowrap">{{ new Date(r.createdAt).toLocaleDateString() }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
