<script setup>
import { computed } from 'vue'

import { useCountUp } from '@/composables/useCountUp'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  value: { type: Number, required: true },
  format: {
    type: String,
    default: 'currency',
    validator: (value) => ['currency', 'percent', 'number'].includes(value),
  },
  signed: { type: Boolean, default: false },
  decimals: { type: Number, default: null },
  duration: { type: Number, default: 900 },
  delay: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
})

const { displayValue } = useCountUp(
  () => props.value,
  {
    duration: props.duration,
    delay: props.delay,
    enabled: () => props.enabled,
  },
)

const formatted = computed(() => {
  const current = displayValue.value

  if (props.format === 'percent') {
    const abs = Math.abs(current)
    if (!Number.isFinite(abs)) return '0%'

    const fractionDigits =
      props.decimals ?? (abs < 10 ? 1 : 0)
    const rounded =
      fractionDigits > 0
        ? Number(abs.toFixed(fractionDigits))
        : Math.min(100, Math.round(abs))

    return `${rounded}%`
  }

  if (props.format === 'number') {
    const fractionDigits = props.decimals ?? 0
    return fractionDigits > 0
      ? current.toFixed(fractionDigits)
      : String(Math.round(current))
  }

  const abs = Math.abs(current)
  const text = formatIndonesianRupiah(abs)
  if (props.signed && current < 0) return `−${text}`
  return text
})
</script>

<template>
  <span>{{ formatted }}</span>
</template>
