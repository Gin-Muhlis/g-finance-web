<script setup>
import { computed, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'
import { formatIdrShort } from '@/utils/moneyFormat.js'

const props = defineProps({
  series: { type: Array, default: () => [] },
  periodLabel: { type: String, default: '' },
  embedded: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const rootClass = computed(() =>
  props.embedded
    ? 'flex h-full min-w-0 flex-col'
    : 'rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 p-5 shadow-card-elevated backdrop-blur-md sm:p-6',
)

const totals = computed(() => {
  let income = 0
  let expense = 0
  for (const p of props.series) {
    income += p.income
    expense += p.expense
  }
  return { income, expense, net: income - expense }
})

const netIsPositive = computed(() => totals.value.net >= 0)
const hasActivity = computed(() =>
  props.series.some((point) => Number(point.income || 0) > 0 || Number(point.expense || 0) > 0),
)

const chartKey = ref(0)

const chartSeries = computed(() => [
  {
    name: 'Income',
    data: props.series.map((item) => item.income),
  },
  {
    name: 'Expense',
    data: props.series.map((item) => item.expense),
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 260,
    toolbar: { show: false },
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: { enabled: true, delay: 150 },
      dynamicAnimation: { enabled: true, speed: 350 },
    },
    zoom: { enabled: false },
  },
  theme: { mode: 'dark' },
  colors: ['#22C55E', '#FF5500'],
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 2.5,
    lineCap: 'round',
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  grid: {
    show: true,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    strokeDashArray: 0,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 10, bottom: 0, left: 0 },
  },
  xaxis: {
    type: 'category',
    categories: props.series.map((item) => {
      const [, m, d] = item.date.split('-')
      return `${d}/${m}`
    }),
    labels: {
      show: true,
      style: {
        colors: 'rgba(255, 255, 255, 0.4)',
        fontSize: '10px',
        fontFamily: 'Inter, sans-serif',
      },
      rotate: 0,
      trim: true,
      hideOverlappingLabels: true,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      show: true,
      style: {
        colors: 'rgba(255, 255, 255, 0.35)',
        fontSize: '10px',
        fontFamily: 'Inter, sans-serif',
      },
      formatter: (value) => formatIdrShort(value),
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  tooltip: {
    enabled: true,
    theme: 'dark',
    x: {
      show: true,
      formatter: (val, opts) => {
        const index = opts.dataPointIndex
        if (props.series[index]) {
          const [y, m, d] = props.series[index].date.split('-')
          return `${d}/${m}/${y}`
        }
        return val
      },
    },
    y: {
      formatter: (value) => formatIndonesianRupiah(value),
      title: {
        formatter: (seriesName) => seriesName,
      },
    },
    style: {
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
    },
    custom: undefined,
  },
  legend: { show: false },
  markers: {
    size: 0,
    strokeWidth: 2,
    strokeColors: '#0A0A0A',
    hover: {
      size: 5,
      sizeOffset: 3,
    },
  },
}))

watch(
  () => props.series,
  () => {
    chartKey.value += 1
  },
  { deep: true },
)
</script>

<template>
  <section :class="rootClass">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Income vs Expense
        </p>
        <h3 class="mt-1 text-[16px] font-semibold text-text-primary sm:text-[18px]">
          Cashflow Overview
        </h3>
        <p class="mt-0.5 text-[12px] text-text-tertiary">
          {{ periodLabel }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2.5 sm:gap-4">
        <div class="rounded-[10px] border border-positive/25 bg-positive/8 px-3 py-2">
          <p class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Total Income
          </p>
          <p class="mt-0.5 font-mono text-[15px] font-bold tabular-nums text-positive">
            <AnimatedNumber
              :value="totals.income"
              :duration="900"
            />
          </p>
        </div>
        <div class="rounded-[10px] border border-negative/25 bg-negative/8 px-3 py-2">
          <p class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Total Expense
          </p>
          <p class="mt-0.5 font-mono text-[15px] font-bold tabular-nums text-negative">
            <AnimatedNumber
              :value="totals.expense"
              :duration="900"
              :delay="60"
            />
          </p>
        </div>
        <div
          class="rounded-[10px] border px-3 py-2"
          :class="
            netIsPositive
              ? 'border-positive/25 bg-positive/8'
              : 'border-negative/25 bg-negative/8'
          "
        >
          <p class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Net Result
          </p>
          <p
            class="mt-0.5 font-mono text-[15px] font-bold tabular-nums"
            :class="netIsPositive ? 'text-positive' : 'text-negative'"
          >
            <AnimatedNumber
              :value="totals.net"
              signed
              :duration="900"
              :delay="120"
            />
          </p>
        </div>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-3 sm:gap-5">
      <div class="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
        <span class="h-2 w-2 rounded-full bg-positive shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
        Income
      </div>
      <div class="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
        <span
          class="h-2 w-2 rounded-full bg-ds-orange-200 shadow-[0_0_6px_rgba(255,85,0,0.6)]"
        />
        Expense
      </div>
    </div>

    <div
      v-if="loading"
      class="relative mt-2 flex h-[260px] w-full animate-pulse items-end gap-2 overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.03] px-4 py-5"
      aria-busy="true"
    >
      <div
        v-for="i in 18"
        :key="i"
        class="flex-1 rounded-t-[8px] bg-white/[0.07]"
        :style="{ height: `${28 + ((i * 19) % 58)}%` }"
      />
    </div>
    <div
      v-else
      class="relative mt-2 w-full overflow-hidden"
    >
      <div
        v-if="!hasActivity"
        class="flex h-[260px] items-center justify-center rounded-[14px] border border-dashed border-white/[0.08] bg-ds-black-400/25 px-4 text-center text-[13px] text-text-tertiary"
      >
        Tidak ada data untuk periode ini.
      </div>
      <VueApexCharts
        v-else
        :key="chartKey"
        type="area"
        height="260"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>
  </section>
</template>
