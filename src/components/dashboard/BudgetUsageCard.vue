<script setup>
import { computed } from 'vue'

import { AlertTriangle, PieChart } from 'lucide-vue-next'

import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  totalBudget: { type: Number, required: true },
  totalUsed: { type: Number, required: true },
  monthLabel: { type: String, default: '' },
})

const usagePercent = computed(() => {
  if (!props.totalBudget) return 0
  return (props.totalUsed / props.totalBudget) * 100
})

const usagePercentDisplay = computed(() => {
  const v = usagePercent.value
  if (!Number.isFinite(v)) return 0
  return v < 10 ? Number(v.toFixed(1)) : Math.round(v)
})

const remaining = computed(() => props.totalBudget - props.totalUsed)
const isOver = computed(() => props.totalUsed > props.totalBudget)
const barWidth = computed(() => Math.min(100, Math.max(0, usagePercent.value)))

const tier = computed(() => {
  const p = usagePercent.value
  if (isOver.value) return 'over'
  if (p <= 25) return 't1'
  if (p <= 50) return 't2'
  if (p <= 75) return 't3'
  return 't4'
})

const tierConfig = {
  t1: {
    label: 'On track',
    description: 'Penggunaan masih sangat sehat.',
    barGradient: 'from-emerald-500 to-emerald-400',
    chip: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30',
    glow: 'rgba(16,185,129,0.35)',
  },
  t2: {
    label: 'Moderate',
    description: 'Masih aman, pantau pengeluaran kategori utama.',
    barGradient: 'from-cyan-500 to-teal-400',
    chip: 'bg-cyan-500/12 text-cyan-400 border-cyan-500/30',
    glow: 'rgba(6,182,212,0.4)',
  },
  t3: {
    label: 'Warning',
    description: 'Mulai mendekati batas budget.',
    barGradient: 'from-amber-500 to-orange-400',
    chip: 'bg-amber-500/14 text-amber-400 border-amber-500/30',
    glow: 'rgba(245,158,11,0.4)',
  },
  t4: {
    label: 'Critical',
    description: 'Hampir mencapai batas, atur ulang pengeluaran.',
    barGradient: 'from-orange-500 to-ds-orange-300',
    chip: 'bg-ds-orange-200/15 text-ds-orange-300 border-ds-orange-200/40',
    glow: 'rgba(255,80,0,0.45)',
  },
  over: {
    label: 'Over budget',
    description: 'Pengeluaran melebihi plafon bulan ini.',
    barGradient: 'from-rose-500 to-red-400',
    chip: 'bg-negative/15 text-negative border-negative/35',
    glow: 'rgba(239,68,68,0.4)',
  },
}

const config = computed(() => tierConfig[tier.value])
</script>

<template>
  <section
    class="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 p-5 shadow-card-elevated backdrop-blur-md sm:p-6"
  >
    <div
      class="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full opacity-60 blur-2xl"
      :style="{ background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)` }"
      aria-hidden="true"
    />

    <header class="relative flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-[rgba(255,80,0,0.1)] text-ds-orange-300"
        >
          <PieChart
            :size="20"
            :stroke-width="2"
          />
        </span>
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
            Budget Usage
          </p>
          <h3 class="mt-0.5 text-[17px] font-semibold text-text-primary">
            Monthly Spending Limit
          </h3>
          <p class="mt-0.5 text-[12px] text-text-tertiary">
            {{ monthLabel }}
          </p>
        </div>
      </div>
      <span
        class="inline-flex shrink-0 items-center gap-1 rounded-[8px] border px-2.5 py-1 text-[11.5px] font-semibold"
        :class="config.chip"
      >
        <AlertTriangle
          v-if="tier === 'over' || tier === 't4'"
          :size="12"
          :stroke-width="2.5"
        />
        {{ config.label }}
      </span>
    </header>

    <div class="relative mt-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          Total terpakai
        </p>
        <p
          class="mt-1 font-mono text-[26px] font-bold leading-none tracking-[-0.015em] tabular-nums text-text-primary sm:text-[30px]"
          :class="{ 'text-negative': isOver }"
        >
          {{ formatIndonesianRupiah(totalUsed) }}
        </p>
        <p class="mt-1 text-[12px] text-text-tertiary">
          dari
          <span class="font-mono font-semibold tabular-nums text-text-secondary">{{
            formatIndonesianRupiah(totalBudget)
          }}</span>
        </p>
      </div>
      <p
        class="text-right font-mono text-[28px] font-bold tabular-nums leading-none"
        :class="
          isOver
            ? 'text-negative'
            : tier === 't4'
              ? 'text-ds-orange-300'
              : tier === 't3'
                ? 'text-amber-400'
                : tier === 't2'
                  ? 'text-cyan-400'
                  : 'text-emerald-400'
        "
      >
        {{ usagePercentDisplay }}%
      </p>
    </div>

    <div class="relative mt-4">
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          class="relative h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out"
          :class="config.barGradient"
          :style="{ width: `${barWidth}%` }"
        >
          <span
            class="absolute inset-0 rounded-full opacity-40 blur-sm"
            :style="{ background: `linear-gradient(90deg, transparent, ${config.glow})` }"
            aria-hidden="true"
          />
        </div>
      </div>
      <div class="mt-2 flex justify-between text-[10.5px] uppercase tracking-[0.08em] text-text-tertiary">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>

    <div class="relative mt-5 grid grid-cols-2 gap-3">
      <div class="rounded-[12px] border border-white/[0.06] bg-ds-black-400/60 px-3 py-2.5">
        <p class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          Total Budget
        </p>
        <p class="mt-1 font-mono text-[14px] font-semibold tabular-nums text-text-primary">
          {{ formatIndonesianRupiah(totalBudget) }}
        </p>
      </div>
      <div
        class="rounded-[12px] border px-3 py-2.5"
        :class="
          remaining < 0
            ? 'border-negative/30 bg-negative/8'
            : 'border-white/[0.06] bg-ds-black-400/60'
        "
      >
        <p class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          Sisa Budget
        </p>
        <p
          class="mt-1 font-mono text-[14px] font-semibold tabular-nums"
          :class="remaining < 0 ? 'text-negative' : 'text-text-primary'"
        >
          {{ remaining < 0 ? '−' : '' }}{{ formatIndonesianRupiah(Math.abs(remaining)) }}
        </p>
      </div>
    </div>

    <p class="relative mt-4 text-[12px] leading-snug text-text-secondary">
      {{ config.description }}
    </p>
  </section>
</template>
