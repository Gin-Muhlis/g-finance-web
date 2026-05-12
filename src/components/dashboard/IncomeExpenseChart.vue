<script setup>
import { computed, ref } from 'vue'

import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'
import { formatIdrShort } from '@/utils/moneyFormat.js'

const props = defineProps({
  /** Array<{ date: 'YYYY-MM-DD', income: number, expense: number }> */
  series: { type: Array, default: () => [] },
  periodLabel: { type: String, default: '' },
})

const VIEW_W = 880
const VIEW_H = 260
const PADDING_LEFT = 50
const PADDING_RIGHT = 24
const PADDING_TOP = 26
const PADDING_BOTTOM = 36

const innerWidth = VIEW_W - PADDING_LEFT - PADDING_RIGHT
const innerHeight = VIEW_H - PADDING_TOP - PADDING_BOTTOM

const hoverIndex = ref(null)

const totals = computed(() => {
  let income = 0
  let expense = 0
  for (const p of props.series) {
    income += p.income
    expense += p.expense
  }
  return { income, expense, net: income - expense }
})

const maxValue = computed(() => {
  let m = 0
  for (const p of props.series) {
    if (p.income > m) m = p.income
    if (p.expense > m) m = p.expense
  }
  if (m === 0) m = 1
  return Math.ceil(m / 100_000) * 100_000
})

function xFor(index) {
  if (props.series.length <= 1) {
    return PADDING_LEFT + innerWidth / 2
  }
  const step = innerWidth / (props.series.length - 1)
  return PADDING_LEFT + step * index
}

function yFor(value) {
  const ratio = value / maxValue.value
  return PADDING_TOP + innerHeight - ratio * innerHeight
}

function buildSmoothPath(points) {
  if (!points.length) return ''
  if (points.length === 1) {
    const [p] = points
    return `M ${p.x} ${p.y}`
  }
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

const incomePoints = computed(() =>
  props.series.map((p, i) => ({ x: xFor(i), y: yFor(p.income), value: p.income })),
)
const expensePoints = computed(() =>
  props.series.map((p, i) => ({ x: xFor(i), y: yFor(p.expense), value: p.expense })),
)

const incomeLinePath = computed(() => buildSmoothPath(incomePoints.value))
const expenseLinePath = computed(() => buildSmoothPath(expensePoints.value))

const incomeAreaPath = computed(() => {
  if (!incomePoints.value.length) return ''
  const baseLine = PADDING_TOP + innerHeight
  const first = incomePoints.value[0]
  const last = incomePoints.value[incomePoints.value.length - 1]
  return `${incomeLinePath.value} L ${last.x} ${baseLine} L ${first.x} ${baseLine} Z`
})

const expenseAreaPath = computed(() => {
  if (!expensePoints.value.length) return ''
  const baseLine = PADDING_TOP + innerHeight
  const first = expensePoints.value[0]
  const last = expensePoints.value[expensePoints.value.length - 1]
  return `${expenseLinePath.value} L ${last.x} ${baseLine} L ${first.x} ${baseLine} Z`
})

const gridLines = computed(() => {
  const lines = []
  const steps = 4
  for (let i = 0; i <= steps; i += 1) {
    const value = (maxValue.value / steps) * i
    const y = PADDING_TOP + innerHeight - (innerHeight * i) / steps
    lines.push({ y, label: formatIdrShort(value) })
  }
  return lines
})

const xAxisLabels = computed(() => {
  const len = props.series.length
  if (!len) return []
  const labelCount = Math.min(len, 7)
  const step = (len - 1) / Math.max(1, labelCount - 1)
  const labels = []
  for (let i = 0; i < labelCount; i += 1) {
    const idx = Math.round(i * step)
    if (idx >= len) continue
    const p = props.series[idx]
    if (!p) continue
    const [, m, d] = String(p.date).split('-')
    labels.push({
      x: xFor(idx),
      label: `${d}/${m}`,
    })
  }
  return labels
})

const hoverData = computed(() => {
  if (hoverIndex.value == null) return null
  const point = props.series[hoverIndex.value]
  if (!point) return null
  return {
    point,
    x: xFor(hoverIndex.value),
    incomeY: yFor(point.income),
    expenseY: yFor(point.expense),
  }
})

function onMouseMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = VIEW_W / rect.width
  const svgX = (event.clientX - rect.left) * ratio
  const len = props.series.length
  if (!len) return
  if (len === 1) {
    hoverIndex.value = 0
    return
  }
  const step = innerWidth / (len - 1)
  const idx = Math.round((svgX - PADDING_LEFT) / step)
  hoverIndex.value = Math.max(0, Math.min(len - 1, idx))
}

function onMouseLeave() {
  hoverIndex.value = null
}

const formattedHoverDate = computed(() => {
  if (!hoverData.value) return ''
  const [y, m, d] = hoverData.value.point.date.split('-')
  return `${d}/${m}/${y}`
})

const netIsPositive = computed(() => totals.value.net >= 0)
</script>

<template>
  <section
    class="rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 p-5 shadow-card-elevated backdrop-blur-md sm:p-6"
  >
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
            {{ formatIndonesianRupiah(totals.income) }}
          </p>
        </div>
        <div class="rounded-[10px] border border-negative/25 bg-negative/8 px-3 py-2">
          <p class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Total Expense
          </p>
          <p class="mt-0.5 font-mono text-[15px] font-bold tabular-nums text-negative">
            {{ formatIndonesianRupiah(totals.expense) }}
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
            {{ netIsPositive ? '' : '−' }}{{ formatIndonesianRupiah(Math.abs(totals.net)) }}
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

    <div class="relative mt-2 w-full overflow-hidden">
      <svg
        :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
        class="block h-[260px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Income vs Expense chart"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      >
        <defs>
          <linearGradient
            id="incomeGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stop-color="#22C55E"
              stop-opacity="0.35"
            />
            <stop
              offset="100%"
              stop-color="#22C55E"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="expenseGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stop-color="#FF5500"
              stop-opacity="0.35"
            />
            <stop
              offset="100%"
              stop-color="#FF5500"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>

        <g>
          <line
            v-for="(line, idx) in gridLines"
            :key="idx"
            :x1="PADDING_LEFT"
            :x2="VIEW_W - PADDING_RIGHT"
            :y1="line.y"
            :y2="line.y"
            stroke="rgba(255,255,255,0.05)"
            stroke-width="1"
          />
          <text
            v-for="(line, idx) in gridLines"
            :key="`l-${idx}`"
            :x="PADDING_LEFT - 8"
            :y="line.y + 3"
            text-anchor="end"
            font-size="10"
            fill="rgba(255,255,255,0.35)"
          >
            {{ line.label }}
          </text>
        </g>

        <path
          v-if="series.length"
          :d="expenseAreaPath"
          fill="url(#expenseGradient)"
        />
        <path
          v-if="series.length"
          :d="incomeAreaPath"
          fill="url(#incomeGradient)"
        />

        <path
          v-if="series.length"
          :d="expenseLinePath"
          fill="none"
          stroke="#FF6600"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          v-if="series.length"
          :d="incomeLinePath"
          fill="none"
          stroke="#22C55E"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <g v-if="series.length === 1">
          <circle
            :cx="incomePoints[0].x"
            :cy="incomePoints[0].y"
            r="4"
            fill="#22C55E"
          />
          <circle
            :cx="expensePoints[0].x"
            :cy="expensePoints[0].y"
            r="4"
            fill="#FF6600"
          />
        </g>

        <g v-if="hoverData">
          <line
            :x1="hoverData.x"
            :x2="hoverData.x"
            :y1="PADDING_TOP"
            :y2="PADDING_TOP + innerHeight"
            stroke="rgba(255,255,255,0.12)"
            stroke-dasharray="3,3"
          />
          <circle
            :cx="hoverData.x"
            :cy="hoverData.incomeY"
            r="4.5"
            fill="#22C55E"
            stroke="#0A0A0A"
            stroke-width="2"
          />
          <circle
            :cx="hoverData.x"
            :cy="hoverData.expenseY"
            r="4.5"
            fill="#FF6600"
            stroke="#0A0A0A"
            stroke-width="2"
          />
        </g>

        <g>
          <text
            v-for="(label, idx) in xAxisLabels"
            :key="`x-${idx}`"
            :x="label.x"
            :y="VIEW_H - 12"
            text-anchor="middle"
            font-size="10"
            fill="rgba(255,255,255,0.35)"
          >
            {{ label.label }}
          </text>
        </g>
      </svg>

      <div
        v-if="hoverData"
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[10px] border border-white/[0.12] bg-ds-black-400/97 px-3 py-2 shadow-card-elevated backdrop-blur-md"
        :style="{
          left: `${(hoverData.x / VIEW_W) * 100}%`,
          top: '8px',
        }"
      >
        <p class="text-[11px] font-medium text-text-tertiary">
          {{ formattedHoverDate }}
        </p>
        <div class="mt-1 flex flex-col gap-0.5 text-[12px]">
          <span class="inline-flex items-center gap-1.5 text-positive">
            <span class="h-1.5 w-1.5 rounded-full bg-positive" />
            <span class="text-text-tertiary">Income</span>
            <span class="ml-auto font-mono font-semibold tabular-nums">
              {{ formatIndonesianRupiah(hoverData.point.income) }}
            </span>
          </span>
          <span class="inline-flex items-center gap-1.5 text-ds-orange-300">
            <span class="h-1.5 w-1.5 rounded-full bg-ds-orange-300" />
            <span class="text-text-tertiary">Expense</span>
            <span class="ml-auto font-mono font-semibold tabular-nums">
              {{ formatIndonesianRupiah(hoverData.point.expense) }}
            </span>
          </span>
        </div>
      </div>

      <div
        v-if="!series.length"
        class="absolute inset-0 flex items-center justify-center text-[13px] text-text-tertiary"
      >
        Tidak ada data untuk periode ini.
      </div>
    </div>
  </section>
</template>
