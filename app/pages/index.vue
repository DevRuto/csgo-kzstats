<template>
  <div>
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-neutral-100">Local KZ Leaderboards</h1>
      <p class="mt-2 max-w-2xl text-neutral-400">
        Records pulled straight from the two local Kreedz Climbing databases. GOKZ and KZTimer are
        separate plugins with separate data &mdash; nothing here is merged or reconciled between them.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2">
      <NuxtLink
        to="/gokz"
        class="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 transition-colors hover:border-amber-400/50"
      >
        <h2 class="text-xl font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors">GOKZ</h2>
        <p class="mt-2 text-sm text-neutral-400">
          Modern GOKZ plugin data across three movement modes &mdash; Vanilla, SimpleKZ, and KZTimer.
          Records, Pro/TP splits, and jumpstats.
        </p>
      </NuxtLink>

      <NuxtLink
        to="/kztimer"
        class="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 transition-colors hover:border-amber-400/50"
      >
        <h2 class="text-xl font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors">KZTimer</h2>
        <p class="mt-2 text-sm text-neutral-400">
          The original, single-mode KZTimer plugin database. Map records, overall player ranks, and
          jumpstats.
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
