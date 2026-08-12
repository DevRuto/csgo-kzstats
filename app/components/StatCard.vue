<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>

<template>
  <div class="rounded-lg border border-ink-800 bg-ink-900/60 px-5 py-4">
    <div class="text-2xl font-semibold text-ink-100 tabular-nums">{{ value }}</div>
    <div class="text-sm text-ink-500">{{ label }}</div>
  </div>
</template>
