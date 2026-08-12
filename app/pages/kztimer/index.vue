<script setup lang="ts">
const { data: stats } = await useFetch('/api/kztimer/stats')
const { data: recent, status: recentStatus } = await useFetch('/api/kztimer/recent')
const { data: topRanks, status: ranksStatus } = await useFetch('/api/kztimer/ranks', { query: { limit: 10 } })
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-neutral-100 mb-6">KZTimer</h1>

    <div v-if="stats" class="grid grid-cols-3 gap-3 mb-10">
      <StatCard label="Maps" :value="stats.maps" />
      <StatCard label="Ranked players" :value="stats.players" />
      <StatCard label="Personal bests" :value="stats.personalBests" />
    </div>

    <div class="grid gap-10 lg:grid-cols-2">
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-neutral-100">Top players by points</h2>
          <NuxtLink to="/kztimer/ranks" class="text-sm text-amber-400 hover:text-amber-300">View all &rarr;</NuxtLink>
        </div>
        <div class="rounded-lg border border-neutral-800 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-neutral-900 text-neutral-500 text-left">
              <tr>
                <th class="px-4 py-2 font-medium">Rank</th>
                <th class="px-4 py-2 font-medium">Player</th>
                <th class="px-4 py-2 font-medium text-right">Points</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800">
              <tr v-if="ranksStatus === 'pending'">
                <td colspan="3" class="px-4 py-6 text-center text-neutral-500">Loading&hellip;</td>
              </tr>
              <tr v-for="p in topRanks" :key="p.steamId" class="hover:bg-neutral-900/50">
                <td class="px-4 py-2"><RankBadge :rank="p.rank" /></td>
                <td class="px-4 py-2 text-neutral-200">
                  {{ p.name }}
                  <span v-if="p.country" class="text-neutral-500 text-xs ml-1">{{ p.country }}</span>
                </td>
                <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-200">{{ p.points.toLocaleString() }}</td>
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
          <div v-for="(r, i) in recent" :key="i" class="px-4 py-2.5 text-sm flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-neutral-200 truncate">
                <span class="font-medium">{{ r.name }}</span>
                <span class="text-neutral-500"> on </span>
                <NuxtLink :to="`/kztimer/maps/${r.map}`" class="hover:text-amber-400">{{ r.map }}</NuxtLink>
              </div>
              <div class="text-neutral-500 text-xs">
                {{ r.isPro ? 'Pro' : `TP (${r.teleports})` }} &middot; {{ formatDuration(r.runTime) }}
              </div>
            </div>
            <div class="text-neutral-600 text-xs whitespace-nowrap">{{ new Date(r.createdAt).toLocaleDateString() }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
