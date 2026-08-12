<script setup lang="ts">
const mode = ref(2)
const modeOptions = GOKZ_MODE_TAB_OPTIONS

const jumpType = ref(1)
const jumpTypeOptions = Object.entries(GOKZ_JUMP_TYPES).map(([value, info]) => ({
  label: info.short,
  value: Number(value)
}))

const { data: jumps, status } = await useFetch('/api/gokz/jumpstats', {
  query: { mode, type: jumpType }
})

const jumpTypeName = computed(() => gokzJumpTypeName(jumpType.value))
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-ink-100 mb-6">GOKZ Jumpstats</h1>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <TabGroup v-model="mode" :options="modeOptions" />
      <TabGroup v-model="jumpType" :options="jumpTypeOptions" />
    </div>

    <div class="rounded-lg border border-ink-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-ink-900 text-ink-500 text-left">
          <tr>
            <th class="px-4 py-2 font-medium">Rank</th>
            <th class="px-4 py-2 font-medium">Player</th>
            <th class="px-4 py-2 font-medium text-right">{{ jumpTypeName }}</th>
            <th class="px-4 py-2 font-medium text-right">Strafes</th>
            <th class="px-4 py-2 font-medium text-right">Sync</th>
            <th class="px-4 py-2 font-medium text-right">Pre</th>
            <th class="px-4 py-2 font-medium text-right">Max</th>
            <th class="px-4 py-2 font-medium text-right">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink-800">
          <tr v-if="status === 'pending'">
            <td colspan="8" class="px-4 py-6 text-center text-ink-500">Loading&hellip;</td>
          </tr>
          <tr v-else-if="!jumps?.length">
            <td colspan="8" class="px-4 py-6 text-center text-ink-500">No jumps recorded yet.</td>
          </tr>
          <tr v-for="j in jumps" :key="j.steamId32" class="hover:bg-ink-900/50">
            <td class="px-4 py-2"><RankBadge :rank="j.rank" /></td>
            <td class="px-4 py-2 text-ink-200">
              <NuxtLink :to="`/players/${j.steamId32}`" class="hover:text-accent">{{ j.alias ?? 'Unknown' }}</NuxtLink>
              <span v-if="j.country" class="text-ink-500 text-xs ml-1">{{ j.country }}</span>
            </td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-200">{{ j.distance.toFixed(3) }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-400">{{ j.strafes }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-400">{{ j.sync.toFixed(1) }}%</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-400">{{ j.pre.toFixed(1) }}</td>
            <td class="px-4 py-2 text-right font-mono tabular-nums text-ink-400">{{ j.max.toFixed(1) }}</td>
            <td class="px-4 py-2 text-right text-ink-500 text-xs">{{ new Date(j.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
