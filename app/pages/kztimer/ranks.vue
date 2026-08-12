<script setup lang="ts">
const { data: ranks, status } = await useFetch('/api/kztimer/ranks', { query: { limit: 100 } })
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-neutral-100 mb-6">KZTimer Ranks</h1>

    <div class="rounded-lg border border-neutral-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-neutral-900 text-neutral-500 text-left">
          <tr>
            <th class="px-4 py-2 font-medium">Rank</th>
            <th class="px-4 py-2 font-medium">Player</th>
            <th class="px-4 py-2 font-medium text-right">Points</th>
            <th class="px-4 py-2 font-medium text-right">Maps finished</th>
            <th class="px-4 py-2 font-medium text-right">Pro</th>
            <th class="px-4 py-2 font-medium text-right">TP</th>
            <th class="px-4 py-2 font-medium text-right">Last seen</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-800">
          <tr v-if="status === 'pending'">
            <td colspan="7" class="px-4 py-6 text-center text-neutral-500">Loading&hellip;</td>
          </tr>
          <tr v-else-if="!ranks?.length">
            <td colspan="7" class="px-4 py-6 text-center text-neutral-500">No ranked players yet.</td>
          </tr>
          <tr v-for="p in ranks" :key="p.steamId" class="hover:bg-neutral-900/50">
            <td class="px-4 py-2"><RankBadge :rank="p.rank" /></td>
            <td class="px-4 py-2 text-neutral-200">
              {{ p.name }}
              <span v-if="p.country" class="text-neutral-500 text-xs ml-1">{{ p.country }}</span>
            </td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-200">{{ p.points.toLocaleString() }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-400">{{ p.finishedMaps }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-400">{{ p.finishedMapsPro }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-400">{{ p.finishedMapsTp }}</td>
            <td class="px-4 py-2 text-right text-neutral-500 text-xs">{{ p.lastSeen }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
