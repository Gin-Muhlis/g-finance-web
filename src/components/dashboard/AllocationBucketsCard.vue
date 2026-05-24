<script setup>
import { computed } from 'vue'

import { PiggyBank } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'

const props = defineProps({
  buckets: { type: Array, required: true },
  loading: { type: Boolean, default: false },
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
    class="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 p-5 shadow-card-elevated backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6"
  >
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Allocation
        </p>
        <h3 class="mt-0.5 text-[17px] font-semibold text-text-primary">
          Alokasi Tabungan
        </h3>
      </div>
    </header>

    <div
      v-if="loading"
      class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2"
      aria-busy="true"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="min-h-[9.875rem] animate-pulse rounded-[14px] border border-white/[0.06] bg-white/[0.05]"
      />
    </div>
    <div
      v-else-if="!buckets.length"
      class="mt-4 flex min-h-[220px] items-center gap-3 rounded-[14px] border border-dashed border-white/[0.1] bg-ds-black-400/45 px-4 py-5"
    >
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.04] text-text-tertiary">
        <PiggyBank :size="21" />
      </span>
      <div>
        <p class="text-[13px] font-semibold text-text-primary">
          Belum ada bucket alokasi
        </p>
        <p class="mt-1 text-[12px] leading-snug text-text-tertiary">
          Progress tabungan akan tampil setelah bucket dibuat.
        </p>
      </div>
    </div>
    <div
      v-else
      class="mt-4 min-h-0 overflow-y-auto overscroll-y-contain pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] max-h-[calc(4*(9.875rem+1.25rem)-1.25rem)] sm:max-h-[calc(2*(9.875rem+1.25rem)-1.25rem)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
    >
      <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <li
          v-for="bucket in enrichedBuckets"
          :key="bucket.id"
          class="group min-h-[9.875rem] rounded-[14px] border border-white/[0.06] bg-ds-black-400/60 p-3.5 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-ds-black-500/70"
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
                <AnimatedNumber
                  :value="bucket.percent"
                  format="percent"
                  :duration="800"
                />
              </span>
            </div>
            <p
              class="font-mono text-[15px] font-bold leading-tight tabular-nums text-text-primary"
            >
              <AnimatedNumber
                :value="bucket.balance"
                :duration="850"
              />
            </p>
            <p class="mt-0.5 text-[11.5px] text-text-tertiary">
              Target
              <span class="font-mono font-medium tabular-nums text-text-secondary">
                <AnimatedNumber
                  :value="bucket.target"
                  :duration="850"
                  :delay="60"
                />
              </span>
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
            <span class="font-mono font-medium tabular-nums text-text-secondary">
              <AnimatedNumber
                :value="bucket.remaining"
                :duration="850"
                :delay="100"
              />
            </span>
          </span>
        </div>
        </li>
      </ul>
    </div>
  </section>
</template>
