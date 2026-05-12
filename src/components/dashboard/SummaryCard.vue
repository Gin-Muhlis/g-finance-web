<script setup>
import { computed } from 'vue'

import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'

import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  variant: {
    type: String,
    default: 'income',
    validator: (value) =>
      ['income', 'spending', 'cashflow', 'saving'].includes(value),
  },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  previousAmount: { type: Number, default: 0 },
  periodLabel: { type: String, default: '' },
  /** Untuk net cashflow: tanda nilai bisa negatif → tampilkan tanda. */
  signedDisplay: { type: Boolean, default: false },
})

const variantConfig = {
  income: {
    icon: TrendingUp,
    accentColor: '#22C55E',
    softBg: 'rgba(34,197,94,0.08)',
    glowBg: 'rgba(34,197,94,0.35)',
    chipPositiveIsGood: true,
  },
  spending: {
    icon: TrendingDown,
    accentColor: '#FF6600',
    softBg: 'rgba(255,80,0,0.1)',
    glowBg: 'rgba(255,80,0,0.45)',
    chipPositiveIsGood: false,
  },
  cashflow: {
    icon: Scale,
    accentColor: '#3B82F6',
    softBg: 'rgba(59,130,246,0.08)',
    glowBg: 'rgba(59,130,246,0.35)',
    chipPositiveIsGood: true,
  },
  saving: {
    icon: PiggyBank,
    accentColor: '#A855F7',
    softBg: 'rgba(168,85,247,0.1)',
    glowBg: 'rgba(168,85,247,0.4)',
    chipPositiveIsGood: true,
  },
}

const config = computed(() => variantConfig[props.variant] ?? variantConfig.income)

const changePercent = computed(() => {
  if (!props.previousAmount || props.previousAmount === 0) {
    return props.amount === 0 ? 0 : 100
  }
  return ((props.amount - props.previousAmount) / Math.abs(props.previousAmount)) * 100
})

const isUp = computed(() => changePercent.value >= 0)

const formattedChange = computed(() => {
  const abs = Math.abs(changePercent.value)
  if (!Number.isFinite(abs)) return '0%'
  const rounded = abs < 10 ? abs.toFixed(1) : Math.round(abs).toString()
  return `${isUp.value ? '+' : '−'}${rounded}%`
})

/** Apakah perubahan tergolong "baik"? */
const isGoodChange = computed(() => {
  if (config.value.chipPositiveIsGood) return isUp.value
  return !isUp.value
})

const formattedAmount = computed(() => {
  if (props.signedDisplay && props.amount < 0) {
    return `−${formatIndonesianRupiah(Math.abs(props.amount))}`
  }
  return formatIndonesianRupiah(props.amount)
})
</script>

<template>
  <article
    class="relative flex h-full flex-col overflow-hidden rounded-[14px] border border-white/[0.08] bg-ds-black-300/85 p-4 shadow-card-default backdrop-blur-sm transition-colors hover:border-white/[0.14] hover:bg-ds-black-300"
  >
    <div
      class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-60 blur-2xl"
      :style="{ background: `radial-gradient(circle, ${config.glowBg} 0%, transparent 70%)` }"
      aria-hidden="true"
    />

    <header class="relative flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          {{ title }}
        </p>
      </div>
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border"
        :style="{
          backgroundColor: config.softBg,
          borderColor: `${config.accentColor}33`,
          color: config.accentColor,
        }"
      >
        <component
          :is="config.icon"
          :size="17"
          :stroke-width="2.25"
        />
      </span>
    </header>

    <p
      class="relative mt-3 font-mono text-[22px] font-bold leading-tight tracking-[-0.01em] tabular-nums text-text-primary sm:text-[24px]"
    >
      {{ formattedAmount }}
    </p>

    <div class="relative mt-2 flex items-center justify-between gap-2">
      <span
        class="inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums"
        :class="
          isGoodChange ? 'bg-positive/12 text-positive' : 'bg-negative/12 text-negative'
        "
      >
        <component
          :is="isUp ? ArrowUpRight : ArrowDownRight"
          :size="12"
          :stroke-width="2.5"
        />
        {{ formattedChange }}
      </span>
      <p class="truncate text-[11px] text-text-tertiary">
        {{ periodLabel }}
      </p>
    </div>
  </article>
</template>
