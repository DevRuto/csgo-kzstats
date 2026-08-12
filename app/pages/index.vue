<script setup lang="ts">
const { public: pub } = useRuntimeConfig()
</script>

<template>
  <div>
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-ink-100">{{ pub.serverName }} Leaderboards</h1>
      <p class="mt-2 max-w-2xl text-ink-400">
        Records pulled straight from the two local Kreedz Climbing databases. GOKZ and KZTimer are
        separate plugins with separate data &mdash; nothing here is merged or reconciled between them.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2">
      <NuxtLink
        v-if="pub.gokzEnabled"
        to="/gokz"
        class="group rounded-xl border border-ink-800 bg-ink-900/60 p-6 transition-colors hover:border-accent/50"
      >
        <h2 class="text-xl font-semibold text-ink-100 group-hover:text-accent transition-colors">GOKZ</h2>
        <p class="mt-2 text-sm text-ink-400">
          Modern GOKZ plugin data across three movement modes &mdash; Vanilla, SimpleKZ, and KZTimer.
          Records, Pro/TP splits, and jumpstats.
        </p>
      </NuxtLink>

      <NuxtLink
        v-if="pub.kztimerEnabled"
        to="/kztimer"
        class="group rounded-xl border border-ink-800 bg-ink-900/60 p-6 transition-colors hover:border-accent/50"
      >
        <h2 class="text-xl font-semibold text-ink-100 group-hover:text-accent transition-colors">KZTimer</h2>
        <p class="mt-2 text-sm text-ink-400">
          The original, single-mode KZTimer plugin database. Map records, overall player ranks, and
          jumpstats.
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
