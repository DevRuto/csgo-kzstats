<script setup lang="ts">
const props = defineProps<{ src?: string | null, alt: string }>()
const failed = ref(false)

watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <div class="aspect-video w-full overflow-hidden bg-ink-800">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="h-full w-full object-cover"
      @error="failed = true"
    >
    <div v-else class="flex h-full w-full items-center justify-center text-ink-600 text-xs">
      No image
    </div>
  </div>
</template>
