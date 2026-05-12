<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { Calendar, X } from 'lucide-vue-next'

import DatePickerModal from '@/components/transactions/DatePickerModal.vue'
import RupiahInput from '@/components/ui/RupiahInput.vue'
import {
  formatIdrId,
  parseMoneyString,
  toApiMoneyString,
} from '@/utils/moneyFormat.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Wallet sumber (dari kartu) */
  fromWallet: { type: Object, default: null },
  /** Semua wallet untuk pilihan tujuan (biasanya GET tanpa filter) */
  destinationWallets: { type: Array, default: () => [] },
  /** Sedang memuat daftar wallet untuk dropdown */
  loadingDestinations: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  apiError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const toWalletId = ref('')
const amountInput = ref('')
const description = ref('')
const transactionDate = ref('')
const datePickerOpen = ref(false)
const localError = ref('')

const title = 'Transfer antar wallet'

const fromBalance = computed(() =>
  props.fromWallet ? parseMoneyString(props.fromWallet.balance) : 0,
)

const toWalletOptions = computed(() =>
  [...props.destinationWallets]
    .filter((w) => w.id !== props.fromWallet?.id)
    .sort((a, b) => String(a.name).localeCompare(b.name, 'id')),
)

const amountNum = computed(() => parseMoneyString(amountInput.value))

const overSourceBalance = computed(
  () => amountNum.value > 0 && amountNum.value > fromBalance.value,
)

const canSubmit = computed(
  () =>
    !!props.fromWallet?.id &&
    !!toWalletId.value &&
    props.fromWallet.id !== toWalletId.value &&
    amountNum.value > 0 &&
    !overSourceBalance.value &&
    !!transactionDate.value,
)

function ymdToday() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function reset() {
  toWalletId.value = ''
  amountInput.value = ''
  description.value = ''
  transactionDate.value = ymdToday()
  localError.value = ''
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      localError.value = ''
      return
    }
    await nextTick()
    reset()
    const firstTo = toWalletOptions.value[0]
    toWalletId.value = firstTo ? firstTo.id : ''
  },
)

watch(
  () => [props.fromWallet?.id, props.destinationWallets],
  () => {
    if (!props.open || !props.fromWallet?.id) return
    if (toWalletId.value === props.fromWallet.id) {
      const next = toWalletOptions.value[0]
      toWalletId.value = next ? next.id : ''
    }
  },
  { deep: true },
)

watch(
  toWalletOptions,
  (opts) => {
    if (!props.open) return
    if (!opts.length) return
    const valid =
      toWalletId.value &&
      opts.some((w) => w.id === toWalletId.value)
    if (!valid) {
      toWalletId.value = opts[0].id
    }
  },
)

function close() {
  if (props.submitting) return
  emit('close')
}

function onSubmit() {
  localError.value = ''
  if (!props.fromWallet?.id) {
    localError.value = 'Wallet sumber tidak valid.'
    return
  }
  if (overSourceBalance.value) {
    localError.value = 'Jumlah melebihi saldo dompet sumber.'
    return
  }
  if (!canSubmit.value) {
    localError.value =
      'Lengkapi form: dompet tujuan, jumlah, dan tanggal.'
    return
  }
  emit('submit', {
    fromWalletId: props.fromWallet.id,
    toWalletId: toWalletId.value,
    amount: toApiMoneyString(amountNum.value),
    transactionDate: transactionDate.value,
    description: description.value.trim() || undefined,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'wallet-transfer-title'"
    >
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="close"
      />
      <div
        class="relative z-10 flex max-h-[min(92dvh,640px)] w-full max-w-[480px] flex-col rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
        @click.stop
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4"
        >
          <h2
            id="wallet-transfer-title"
            class="text-[18px] font-semibold tracking-[-0.01em] text-text-primary"
          >
            {{ title }}
          </h2>
          <button
            type="button"
            class="rounded-[10px] p-2 text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-text-primary disabled:opacity-40"
            :disabled="submitting"
            aria-label="Tutup"
            @click="close"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p
            v-if="apiError"
            class="mb-3 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ apiError }}
          </p>
          <p
            v-if="localError"
            class="mb-3 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ localError }}
          </p>

          <div
            v-if="fromWallet"
            class="mb-3 rounded-md border border-border-default bg-ds-black-400/50 px-3 py-2 text-[12px] text-text-secondary"
          >
            <span class="text-text-tertiary">Dari: </span>
            <span class="font-medium text-text-primary">{{ fromWallet.name }}</span>
            <br >
            <span class="text-text-tertiary">Saldo: </span>
            <span class="font-mono font-medium tabular-nums text-text-primary">{{
              formatIdrId(fromBalance)
            }}</span>
          </div>

          <div
            v-if="overSourceBalance"
            class="mb-3 rounded-md border border-amber-500/45 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-100"
            role="status"
          >
            Peringatan: jumlah melebihi saldo dompet sumber.
          </div>

          <form
            class="space-y-4"
            @submit.prevent="onSubmit"
          >
            <div>
              <label
                for="wt-to"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Ke dompet
              </label>
              <div
                v-if="loadingDestinations"
                class="rounded-input border border-border-default bg-ds-black-400/50 px-3.5 py-2.5 text-[13px] text-text-tertiary"
              >
                Memuat daftar dompet…
              </div>
              <select
                v-else
                id="wt-to"
                v-model="toWalletId"
                class="w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange"
                :disabled="!toWalletOptions.length"
              >
                <option
                  disabled
                  value=""
                >
                  {{
                    toWalletOptions.length
                      ? 'Pilih dompet tujuan'
                      : 'Tidak ada dompet tujuan lain'
                  }}
                </option>
                <option
                  v-for="w in toWalletOptions"
                  :key="w.id"
                  :value="w.id"
                >
                  {{ w.name }} ({{ formatIdrId(parseMoneyString(w.balance)) }})
                </option>
              </select>
            </div>
            <div>
              <label
                for="wt-amt"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Jumlah
              </label>
              <RupiahInput
                id="wt-amt"
                v-model="amountInput"
                placeholder="0"
                :disabled="submitting"
              />
            </div>
            <div>
              <label
                for="wt-date"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Tanggal
              </label>
              <div class="flex gap-2">
                <input
                  id="wt-date"
                  v-model="transactionDate"
                  type="text"
                  readonly
                  class="min-h-[42px] min-w-0 flex-1 cursor-pointer rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 font-mono text-[14px] text-text-primary outline-none"
                  placeholder="Klik"
                  @click="datePickerOpen = true"
                />
                <button
                  type="button"
                  class="inline-flex h-[42px] w-11 shrink-0 items-center justify-center rounded-input border border-border-default bg-ds-black-400/80 text-text-secondary"
                  @click="datePickerOpen = true"
                >
                  <Calendar
                    :size="20"
                    :stroke-width="2"
                  />
                </button>
              </div>
            </div>
            <div>
              <label
                for="wt-desc"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Catatan (opsional)
              </label>
              <textarea
                id="wt-desc"
                v-model="description"
                rows="2"
                maxlength="500"
                class="w-full resize-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange"
                placeholder="Contoh: pindah dana ke tabungan"
              />
            </div>
          </form>
          <DatePickerModal
            v-model="transactionDate"
            :open="datePickerOpen"
            @close="datePickerOpen = false"
          />
        </div>

        <div class="shrink-0 border-t border-white/[0.06] p-4">
          <button
            type="button"
            class="w-full rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canSubmit || submitting || loadingDestinations"
            @click="onSubmit"
          >
            {{ submitting ? 'Memproses…' : 'Transfer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
