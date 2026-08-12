<script setup lang="ts">
defineProps<{ rank: number }>()

const medalClass: Record<number, string> = {
  1: 'text-amber-400',
  2: 'text-neutral-300',
  3: 'text-amber-700'
}
</script>

<template>
  <span class="font-mono tabular-nums" :class="medalClass[rank] ?? 'text-neutral-500'">
    #{{ rank }}
  </span>
</template>
