<script setup lang="ts">
defineProps<{ rank: number }>()

const medalClass: Record<number, string> = {
  1: 'text-accent',
  2: 'text-ink-300',
  3: 'text-amber-700'
}
</script>

<template>
  <span class="font-mono tabular-nums" :class="medalClass[rank] ?? 'text-ink-500'">
    #{{ rank }}
  </span>
</template>
