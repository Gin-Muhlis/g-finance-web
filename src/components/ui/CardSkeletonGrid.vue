<script setup>
import CardSkeleton from '@/components/ui/CardSkeleton.vue'

defineProps({
  variant: {
    type: String,
    default: 'card',
  },
  count: { type: Number, default: 6 },
  gridClass: {
    type: String,
    default: 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3',
  },
})
</script>

<template>
  <div
    :class="gridClass"
    aria-busy="true"
    aria-label="Memuat konten"
  >
    <CardSkeleton
      v-for="i in count"
      :key="i"
      :variant="variant"
    />
  </div>
</template>
