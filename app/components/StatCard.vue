<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>

<template>
  <div class="rounded-lg border border-neutral-800 bg-neutral-900/60 px-5 py-4">
    <div class="text-2xl font-semibold text-neutral-100 tabular-nums">{{ value }}</div>
    <div class="text-sm text-neutral-500">{{ label }}</div>
  </div>
</template>
