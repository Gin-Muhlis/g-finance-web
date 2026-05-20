<script setup>
import { computed } from 'vue'

import { Wallet } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  wallets: { type: Array, required: true },
  previousTotalBalance: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
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
    class="relative flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-gradient-to-br from-ds-black-300/95 to-ds-black-400/90 p-5 shadow-card-elevated backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6"
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
    </header>

    <div
      v-if="loading"
      class="relative mt-4 space-y-3"
      aria-busy="true"
    >
      <div class="h-10 w-[min(80%,26rem)] animate-pulse rounded-[10px] bg-white/[0.08]" />
      <div class="h-3 w-48 animate-pulse rounded-full bg-white/[0.06]" />
    </div>
    <div
      v-else
      class="relative mt-4"
    >
      <p
        class="font-mono text-[34px] font-bold leading-[1.05] tracking-[-0.02em] tabular-nums text-text-primary sm:text-[40px]"
      >
        {{ formatIndonesianRupiah(totalBalance) }}
      </p>
      <p class="mt-1.5 text-[12px] text-text-tertiary">
        {{ isPositive ? 'Naik' : 'Turun' }} dibanding periode sebelumnya
      </p>
    </div>

    <div class="relative mt-5 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Wallets
        </p>
        <p class="mt-0.5 text-[12px] text-text-secondary">
          Total {{ wallets.length }} sumber dana
        </p>
      </div>
    </div>

    <div
      v-if="loading"
      class="relative mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="h-[92px] animate-pulse rounded-[12px] border border-white/[0.06] bg-white/[0.05]"
      />
    </div>
    <div
      v-else-if="!wallets.length"
      class="relative mt-3 flex min-h-[112px] items-center gap-3 rounded-[14px] border border-dashed border-white/[0.1] bg-ds-black-400/45 px-4 py-4"
    >
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.04] text-text-tertiary">
        <Wallet :size="19" />
      </span>
      <div>
        <p class="text-[13px] font-semibold text-text-primary">
          Belum ada wallet
        </p>
        <p class="mt-0.5 text-[12px] text-text-tertiary">
          Total balance akan muncul setelah wallet dibuat.
        </p>
      </div>
    </div>
    <div
      v-else
      class="relative mt-3 min-w-0"
      role="region"
      aria-label="Daftar wallet"
    >
      <div
        class="flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <article
          v-for="(wallet, index) in wallets"
          :key="`${wallet.id}-${index}`"
          class="group relative w-[168px] shrink-0 snap-start overflow-hidden rounded-[12px] border border-white/[0.06] bg-ds-black-400/70 px-3 py-3 transition-colors hover:border-white/[0.14] hover:bg-ds-black-500/80 sm:w-[176px]"
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
            class="mt-2.5 truncate font-mono text-[14.5px] font-semibold tabular-nums text-text-primary"
          >
            {{ formatIndonesianRupiah(wallet.balance) }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
