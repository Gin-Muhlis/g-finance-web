<script setup>
import { computed } from 'vue'

import { ArrowDownRight, ArrowUpRight, Plus } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  wallets: { type: Array, required: true },
  previousTotalBalance: { type: Number, default: 0 },
})

const totalBalance = computed(() =>
  props.wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0),
)

const balanceChangePercent = computed(() => {
  if (!props.previousTotalBalance) return 0
  return ((totalBalance.value - props.previousTotalBalance) / props.previousTotalBalance) * 100
})

const isPositive = computed(() => balanceChangePercent.value >= 0)

const formattedChange = computed(() => {
  const abs = Math.abs(balanceChangePercent.value)
  const rounded = abs < 10 ? abs.toFixed(1) : Math.round(abs).toString()
  return `${isPositive.value ? '+' : '−'}${rounded}%`
})
</script>

<template>
  <section
    class="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-gradient-to-br from-ds-black-300/95 to-ds-black-400/90 p-5 shadow-card-elevated backdrop-blur-md sm:p-6"
  >
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,80,0,0.35)_0%,transparent_70%)] blur-2xl"
      aria-hidden="true"
    />

    <header class="relative flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Total Balance
        </p>
        <p class="mt-2 text-[12px] text-text-secondary">
          Akumulasi saldo dari {{ wallets.length }} wallet
        </p>
      </div>
      <span
        class="inline-flex shrink-0 items-center gap-1 rounded-[8px] border px-2 py-1 text-[11.5px] font-semibold tabular-nums"
        :class="
          isPositive
            ? 'border-positive/30 bg-positive/12 text-positive'
            : 'border-negative/30 bg-negative/12 text-negative'
        "
      >
        <component
          :is="isPositive ? ArrowUpRight : ArrowDownRight"
          :size="13"
          :stroke-width="2.5"
        />
        {{ formattedChange }}
      </span>
    </header>

    <div class="relative mt-4">
      <p
        class="font-mono text-[34px] font-bold leading-[1.05] tracking-[-0.02em] tabular-nums text-text-primary sm:text-[40px]"
      >
        {{ formatIndonesianRupiah(totalBalance) }}
      </p>
      <p class="mt-1.5 text-[12px] text-text-tertiary">
        {{ isPositive ? 'Naik' : 'Turun' }} dibanding periode sebelumnya
      </p>
    </div>

    <div class="relative mt-5 flex items-center justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Wallets
        </p>
        <p class="mt-0.5 text-[12px] text-text-secondary">
          Total {{ wallets.length }} sumber dana
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-border-accent-orange/60 hover:bg-[rgba(255,80,0,0.08)] hover:text-text-primary"
      >
        <Plus
          :size="13"
          :stroke-width="2.5"
        />
        Add wallet
      </button>
    </div>

    <div class="relative mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="wallet in wallets"
        :key="wallet.id"
        class="group relative overflow-hidden rounded-[12px] border border-white/[0.06] bg-ds-black-400/70 px-3 py-3 transition-colors hover:border-white/[0.14] hover:bg-ds-black-500/80"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08]"
            :style="{
              backgroundColor: `${wallet.color}1F`,
              boxShadow: `0 0 0 1px ${wallet.color}33`,
            }"
          >
            <CategoryIcon
              :icon-name="wallet.icon"
              :color="wallet.color"
              :size="18"
            />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-semibold text-text-primary">
              {{ wallet.name }}
            </p>
            <p class="truncate text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary">
              {{ wallet.typeLabel }}
            </p>
          </div>
        </div>
        <p
          class="mt-2.5 font-mono text-[14.5px] font-semibold tabular-nums text-text-primary"
        >
          {{ formatIndonesianRupiah(wallet.balance) }}
        </p>
      </article>
    </div>
  </section>
</template>
