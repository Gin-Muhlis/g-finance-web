<script setup>
import { computed } from 'vue'

import { getCategoryIconComponent } from '@/utils/categoryIconMap'

const props = defineProps({
  iconName: { type: String, default: 'Wallet' },
  size: { type: Number, default: 16 },
  color: { type: String, default: 'rgba(255,255,255,0.45)' },
})

const Icon = computed(() => getCategoryIconComponent(props.iconName))
</script>

<template>
  <component
    :is="Icon"
    :size="size"
    :stroke-width="2"
    class="shrink-0"
    :style="{ color: color }"
  />
</template>
