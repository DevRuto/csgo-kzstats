<script setup lang="ts">
defineProps<{
  options: { label: string; value: string | number }[]
  modelValue: string | number
}>()
defineEmits<{ 'update:modelValue': [value: string | number] }>()
</script>

<template>
  <div class="inline-flex rounded-lg border border-ink-800 bg-ink-900/60 p-1 text-sm">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="rounded-md px-3 py-1.5 transition-colors"
      :class="modelValue === option.value
        ? 'bg-accent text-neutral-950 font-medium'
        : 'text-ink-400 hover:text-ink-100'"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
