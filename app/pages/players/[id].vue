<script setup lang="ts">
const route = useRoute()
const { public: pub } = useRuntimeConfig()

const accountId = computed(() => Number(route.params.id))
const steam2Id = computed(() => steamId32ToSteam2(accountId.value))

const mode = ref(2)
const modeOptions = GOKZ_MODE_TAB_OPTIONS
const gokzType = ref<'pro' | 'tp'>('pro')
const kztimerType = ref<'pro' | 'tp'>('pro')
const typeOptions = [
  { label: 'Pro', value: 'pro' },
  { label: 'TP', value: 'tp' }
]

const { data: gokzProfile } = pub.gokzEnabled
  ? await useFetch(() => `/api/gokz/players/${accountId.value}`)
  : { data: ref(null) }

const { data: gokzRecords, status: gokzRecordsStatus } = pub.gokzEnabled
  ? await useFetch(() => `/api/gokz/players/${accountId.value}/records`, { query: { mode, type: gokzType } })
  : { data: ref(null), status: ref('success' as const) }

const { data: kztimerProfile } = pub.kztimerEnabled
  ? await useFetch(() => `/api/kztimer/players/${encodeURIComponent(steam2Id.value)}`)
  : { data: ref(null) }

const { data: kztimerRecords, status: kztimerRecordsStatus } = pub.kztimerEnabled
  ? await useFetch(() => `/api/kztimer/players/${encodeURIComponent(steam2Id.value)}/records`, { query: { type: kztimerType } })
  : { data: ref(null), status: ref('success' as const) }

const displayName = computed(() => gokzProfile.value?.alias ?? kztimerProfile.value?.name ?? null)
const country = computed(() => gokzProfile.value?.country ?? kztimerProfile.value?.country ?? null)
const notFound = computed(() => !gokzProfile.value && !kztimerProfile.value)

const gokzServerRecords = computed(() => gokzRecords.value?.filter(r => r.rank === 1).length ?? 0)
const kztimerServerRecords = computed(() => kztimerRecords.value?.filter(r => r.rank === 1).length ?? 0)
</script>

<template>
  <div>
    <template v-if="notFound">
      <h1 class="text-2xl font-bold text-neutral-100 mb-2">Player not found</h1>
      <p class="text-neutral-500 text-sm">No GOKZ or KZTimer records found for this player.</p>
    </template>

    <template v-else>
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-neutral-100">
          {{ displayName ?? 'Unknown' }}
          <span v-if="country" class="text-neutral-500 text-base font-normal ml-1">{{ country }}</span>
        </h1>
      </div>

      <div class="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-10">
        <StatCard v-if="gokzProfile" label="GOKZ server records" :value="gokzServerRecords" />
        <StatCard v-if="gokzProfile" label="GOKZ maps with a PB" :value="gokzRecords?.length ?? 0" />
        <StatCard v-if="kztimerProfile" label="KZTimer points" :value="kztimerProfile.points.toLocaleString()" />
        <StatCard v-if="kztimerProfile" label="KZTimer server records" :value="kztimerServerRecords" />
      </div>

      <div class="grid gap-10" :class="gokzProfile && kztimerProfile ? 'lg:grid-cols-2' : ''">
        <section v-if="gokzProfile">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-semibold text-neutral-100">GOKZ records</h2>
          </div>
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <TabGroup v-model="mode" :options="modeOptions" />
            <TabGroup v-model="gokzType" :options="typeOptions" />
          </div>

          <div class="rounded-lg border border-neutral-800 overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-neutral-900 text-neutral-500 text-left">
                <tr>
                  <th class="px-4 py-2 font-medium">Rank</th>
                  <th class="px-4 py-2 font-medium">Map</th>
                  <th class="px-4 py-2 font-medium text-right">Time</th>
                  <th v-if="gokzType === 'tp'" class="px-4 py-2 font-medium text-right">Teleports</th>
                  <th class="px-4 py-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800">
                <tr v-if="gokzRecordsStatus === 'pending'">
                  <td colspan="5" class="px-4 py-6 text-center text-neutral-500">Loading&hellip;</td>
                </tr>
                <tr v-else-if="!gokzRecords?.length">
                  <td colspan="5" class="px-4 py-6 text-center text-neutral-500">No records for this mode yet.</td>
                </tr>
                <tr v-for="r in gokzRecords" :key="`${r.map}-${r.course}`" class="hover:bg-neutral-900/50">
                  <td class="px-4 py-2"><RankBadge :rank="r.rank" /></td>
                  <td class="px-4 py-2 text-neutral-200">
                    <NuxtLink :to="`/gokz/maps/${r.map}`" class="hover:text-amber-400">{{ r.map }}</NuxtLink>
                    <span v-if="r.course > 0" class="text-neutral-500 text-xs ml-1">Bonus {{ r.course }}</span>
                  </td>
                  <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-200">{{ formatDurationMs(r.runTimeMs) }}</td>
                  <td v-if="gokzType === 'tp'" class="px-4 py-2 text-right font-mono tabular-nums text-neutral-400">{{ r.teleports }}</td>
                  <td class="px-4 py-2 text-right text-neutral-500 text-xs">{{ new Date(r.createdAt).toLocaleDateString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="kztimerProfile">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-semibold text-neutral-100">KZTimer records</h2>
          </div>
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <TabGroup v-model="kztimerType" :options="typeOptions" />
          </div>

          <div class="rounded-lg border border-neutral-800 overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-neutral-900 text-neutral-500 text-left">
                <tr>
                  <th class="px-4 py-2 font-medium">Rank</th>
                  <th class="px-4 py-2 font-medium">Map</th>
                  <th class="px-4 py-2 font-medium text-right">Time</th>
                  <th class="px-4 py-2 font-medium text-right">Teleports</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800">
                <tr v-if="kztimerRecordsStatus === 'pending'">
                  <td colspan="4" class="px-4 py-6 text-center text-neutral-500">Loading&hellip;</td>
                </tr>
                <tr v-else-if="!kztimerRecords?.length">
                  <td colspan="4" class="px-4 py-6 text-center text-neutral-500">No {{ kztimerType === 'pro' ? 'Pro' : 'TP' }} records yet.</td>
                </tr>
                <tr v-for="r in kztimerRecords" :key="r.map" class="hover:bg-neutral-900/50">
                  <td class="px-4 py-2"><RankBadge :rank="r.rank" /></td>
                  <td class="px-4 py-2 text-neutral-200">
                    <NuxtLink :to="`/kztimer/maps/${r.map}`" class="hover:text-amber-400">{{ r.map }}</NuxtLink>
                  </td>
                  <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-200">{{ formatDuration(r.runTime) }}</td>
                  <td class="px-4 py-2 text-right font-mono tabular-nums text-neutral-400">{{ r.teleports }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
