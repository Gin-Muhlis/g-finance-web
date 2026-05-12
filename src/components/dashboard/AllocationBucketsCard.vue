<script setup>
import { computed } from 'vue'

import { ArrowUpRight, Plus, Settings2 } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  buckets: { type: Array, required: true },
})

const enrichedBuckets = computed(() =>
  props.buckets.map((bucket) => {
    const balance = Number(bucket.balance || 0)
    const target = Number(bucket.target || 0)
    const ratio = target > 0 ? balance / target : 0
    const percent = ratio * 100
    const remaining = Math.max(0, target - balance)
    return {
      ...bucket,
      balance,
      target,
      percent: Number.isFinite(percent) ? percent : 0,
      percentDisplay:
        percent < 10 ? Number(percent.toFixed(1)) : Math.min(100, Math.round(percent)),
      barWidth: Math.min(100, Math.max(0, percent)),
      remaining,
      isCompleted: balance >= target && target > 0,
    }
  }),
)

function bucketTier(percent, isCompleted) {
  if (isCompleted) return 'done'
  if (percent <= 25) return 'low'
  if (percent <= 50) return 'mid'
  if (percent <= 75) return 'high'
  return 'almost'
}

const tierGradient = {
  low: 'from-cyan-500 to-teal-400',
  mid: 'from-amber-500 to-orange-400',
  high: 'from-ds-orange-100 to-ds-orange-300',
  almost: 'from-ds-orange-200 to-amber-400',
  done: 'from-emerald-500 to-emerald-400',
}
</script>

<template>
  <section
    class="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 p-5 shadow-card-elevated backdrop-blur-md sm:p-6"
  >
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Allocation
        </p>
        <h3 class="mt-0.5 text-[17px] font-semibold text-text-primary">
          Allocation Buckets
        </h3>
        <p class="mt-0.5 text-[12px] text-text-tertiary">
          Tabungan & dana tujuan kamu
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-white/15 hover:bg-white/[0.08] hover:text-text-primary"
        >
          <Settings2
            :size="13"
            :stroke-width="2"
          />
          Manage Bucket
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-3 py-1.5 text-[12px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95"
        >
          <Plus
            :size="13"
            :stroke-width="2.5"
          />
          Add Allocation
        </button>
      </div>
    </header>

    <ul class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <li
        v-for="bucket in enrichedBuckets"
        :key="bucket.id"
        class="group rounded-[14px] border border-white/[0.06] bg-ds-black-400/60 p-3.5 transition-colors hover:border-white/[0.14] hover:bg-ds-black-500/70"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08]"
            :style="{
              backgroundColor: `${bucket.color}1F`,
              boxShadow: `0 0 0 1px ${bucket.color}33`,
            }"
          >
            <CategoryIcon
              :icon-name="bucket.icon"
              :color="bucket.color"
              :size="20"
            />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="truncate text-[14px] font-semibold text-text-primary">
                {{ bucket.name }}
              </p>
              <span
                class="text-[12.5px] font-semibold tabular-nums"
                :class="bucket.isCompleted ? 'text-emerald-400' : 'text-text-primary'"
              >
                {{ bucket.percentDisplay }}%
              </span>
            </div>
            <p class="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
              Saldo saat ini
            </p>
            <p
              class="font-mono text-[15px] font-bold leading-tight tabular-nums text-text-primary"
            >
              {{ formatIndonesianRupiah(bucket.balance) }}
            </p>
            <p class="mt-0.5 text-[11.5px] text-text-tertiary">
              Target
              <span class="font-mono font-medium tabular-nums text-text-secondary">{{
                formatIndonesianRupiah(bucket.target)
              }}</span>
            </p>
          </div>
        </div>

        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            class="h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out"
            :class="tierGradient[bucketTier(bucket.percent, bucket.isCompleted)]"
            :style="{ width: `${bucket.barWidth}%` }"
          />
        </div>

        <div class="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-[11.5px]">
          <span class="text-text-tertiary">
            Sisa target
            <span class="font-mono font-medium tabular-nums text-text-secondary">{{
              formatIndonesianRupiah(bucket.remaining)
            }}</span>
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent-primary hover:underline"
          >
            Top up
            <ArrowUpRight
              :size="12"
              :stroke-width="2.5"
            />
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
