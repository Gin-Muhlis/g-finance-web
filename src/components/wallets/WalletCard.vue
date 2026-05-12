<script setup>
import { computed } from 'vue'

import {
  ArrowLeftRight,
  Landmark,
  Loader2,
  Pencil,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-vue-next'

import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'
import { getCategoryIconComponent } from '@/utils/categoryIconMap'

const props = defineProps({
  wallet: {
    type: Object,
    required: true,
  },
  activeTogglePendingWalletId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['edit', 'transfer', 'delete', 'requestActiveChange'])

function walletTypeDisplayLabel(walletTypeValue) {
  if (walletTypeValue === 'cash') return 'Tunai'
  if (walletTypeValue === 'bank') return 'Rekening bank'
  if (walletTypeValue === 'e-wallet') return 'Dompet digital'
  return walletTypeValue
}

function iconComponentForWalletType(walletTypeValue) {
  if (walletTypeValue === 'bank') return Landmark
  if (walletTypeValue === 'e-wallet') return Smartphone
  return Wallet
}

const headerIconComponent = computed(() => {
  const iconNameFromWallet = props.wallet.icon
  if (typeof iconNameFromWallet === 'string' && iconNameFromWallet.trim()) {
    return getCategoryIconComponent(iconNameFromWallet)
  }
  return iconComponentForWalletType(props.wallet.type)
})

const isActiveToggleBusy = () =>
  props.activeTogglePendingWalletId === props.wallet.id

function onToggleClick() {
  if (isActiveToggleBusy()) return
  const requestedIsActive = !props.wallet.isActive
  emit('requestActiveChange', props.wallet, requestedIsActive)
}
</script>

<template>
  <article
    class="flex flex-col rounded-[14px] border border-border-default bg-background-surface p-4 shadow-card-default transition-colors hover:border-white/[0.12] hover:bg-ds-black-400 sm:gap-4"
  >
    <div class="flex min-w-0 flex-1 gap-3">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-ds-black-200/90"
      >
        <component
          :is="headerIconComponent"
          :size="24"
          :stroke-width="2"
          class="text-text-primary"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3
          class="truncate text-[16px] font-semibold leading-tight text-text-primary"
        >
          {{ wallet.name }}
        </h3>
        <p
          class="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
        >
          {{ walletTypeDisplayLabel(wallet.type) }}
        </p>
      </div>
    </div>

    <div class="mt-4 space-y-3 sm:mt-0">
      <div>
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
        >
          Saldo
        </p>
        <p
          class="mt-1 font-mono text-[18px] font-semibold tabular-nums tracking-tight text-text-primary"
        >
          {{ formatIndonesianRupiah(wallet.balance) }}
        </p>
      </div>

      <div
        class="flex flex-col gap-3 rounded-[10px] border border-border-default bg-ds-black-400/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Status
          </p>
          <p
            class="mt-0.5 text-[13px] font-medium"
            :class="wallet.isActive ? 'text-positive' : 'text-text-secondary'"
          >
            {{ wallet.isActive ? 'Aktif' : 'Nonaktif' }}
          </p>
        </div>
        <div class="flex items-center justify-between gap-3 sm:justify-end">
          <span class="text-[12px] text-text-tertiary sm:hidden">Aktifkan</span>
          <button
            type="button"
            role="switch"
            :aria-checked="wallet.isActive"
            :aria-label="
              wallet.isActive ? 'Nonaktifkan wallet' : 'Aktifkan wallet'
            "
            :aria-busy="isActiveToggleBusy()"
            :disabled="isActiveToggleBusy()"
            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-base disabled:cursor-not-allowed disabled:opacity-50"
            :class="
              wallet.isActive
                ? 'bg-accent-primary/90 shadow-card-orange-active'
                : 'bg-ds-black-500/80'
            "
            @click="onToggleClick"
          >
            <span
              class="pointer-events-none absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-card-default transition-transform duration-200 ease-out"
              :class="wallet.isActive ? 'translate-x-5' : 'translate-x-0'"
            >
              <Loader2
                v-if="isActiveToggleBusy()"
                class="h-3.5 w-3.5 animate-spin text-ds-orange-200"
                :stroke-width="2"
              />
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 flex w-full flex-wrap gap-2 justify-end">
      <button
        type="button"
        class="inline-flex min-w-0 flex-1 basis-[calc(33.333%-0.33rem)] items-center justify-center gap-1.5 rounded-[10px] border border-border-default bg-ds-black-300/80 px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-accent-orange hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary sm:flex-initial"
        :disabled="isActiveToggleBusy()"
        @click="emit('edit', wallet)"
      >
        <Pencil :size="15" :stroke-width="2" />
        <span>Edit</span>
      </button>
      <button
        type="button"
        class="inline-flex min-w-0 flex-1 basis-[calc(33.333%-0.33rem)] items-center justify-center gap-1.5 rounded-[10px] border border-border-default bg-ds-black-300/80 px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-accent-orange hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary sm:flex-initial"
        :disabled="isActiveToggleBusy()"
        @click="emit('transfer', wallet)"
      >
        <ArrowLeftRight :size="15" :stroke-width="2" />
        <span>Transfer</span>
      </button>
      <button
        type="button"
        class="inline-flex min-w-0 flex-1 basis-[calc(33.333%-0.33rem)] items-center justify-center gap-1.5 rounded-[10px] border border-negative/35 bg-negative/10 px-3 py-2 text-[13px] font-medium text-negative transition-colors hover:bg-negative/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-negative sm:flex-initial"
        :disabled="isActiveToggleBusy()"
        @click="emit('delete', wallet)"
      >
        <Trash2 :size="15" :stroke-width="2" />
        <span>Hapus</span>
      </button>
    </div>
  </article>
</template>
