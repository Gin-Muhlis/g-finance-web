<script setup>
import { computed } from 'vue'

import { getCategoryIconComponent } from '@/utils/categoryIconMap'

const props = defineProps({
  iconName: { type: String, default: null },
  color: { type: String, default: '#FFFFFF' },
  size: { type: Number, default: 22 },
})

const resolvedIconComponent = computed(() =>
  getCategoryIconComponent(props.iconName)
)
</script>

<template>
  <component
    :is="resolvedIconComponent"
    :size="size"
    :stroke-width="2"
    class="shrink-0"
    :style="{ color: color || '#FFFFFF' }"
  />
</template>
