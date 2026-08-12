<script setup lang="ts">
const props = defineProps<{ system: 'gokz' | 'kztimer' }>()

interface GokzResult { steamId32: number; alias: string | null; country: string | null }
interface KztimerResult { steamId: string; name: string; country: string | null }
type Result = GokzResult | KztimerResult

const search = ref('')
const debouncedSearch = ref('')
const open = ref(false)
let timer: ReturnType<typeof setTimeout>

watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debouncedSearch.value = value }, 250)
  open.value = value.trim().length > 0
})

const { data: results, status } = await useFetch<Result[]>(() => `/api/${props.system}/players`, {
  query: { search: debouncedSearch }
})

function label(p: Result): string {
  return props.system === 'gokz' ? ((p as GokzResult).alias ?? 'Unknown') : (p as KztimerResult).name
}

function key(p: Result): string | number {
  return props.system === 'gokz' ? (p as GokzResult).steamId32 : (p as KztimerResult).steamId
}

function accountId(p: Result): number | null {
  return props.system === 'gokz' ? (p as GokzResult).steamId32 : steam2ToSteamId32((p as KztimerResult).steamId)
}

function onBlur() {
  setTimeout(() => { open.value = false }, 150)
}
</script>

<template>
  <div class="relative w-64">
    <input
      v-model="search"
      type="search"
      placeholder="Search players&hellip;"
      class="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400/50"
      @focus="open = search.trim().length > 0"
      @blur="onBlur"
    >
    <div
      v-if="open && (status === 'pending' || results?.length)"
      class="absolute z-20 mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg max-h-72 overflow-y-auto"
    >
      <div v-if="status === 'pending'" class="px-3 py-2 text-xs text-neutral-500">Loading&hellip;</div>
      <template v-else>
        <NuxtLink
          v-for="p in results"
          :key="key(p)"
          :to="accountId(p) !== null ? `/players/${accountId(p)}` : ''"
          class="block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          @click="open = false"
        >
          {{ label(p) }}
          <span v-if="p.country" class="text-neutral-500 text-xs ml-1">{{ p.country }}</span>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
