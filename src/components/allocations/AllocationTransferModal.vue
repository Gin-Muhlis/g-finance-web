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
  wallets: { type: Array, default: () => [] },
  buckets: { type: Array, default: () => [] },
  /** Dari GET /allocations/summary */
  summary: { type: Object, default: null },
  defaultBucketId: { type: String, default: '' },
  defaultFromWalletId: { type: String, default: '' },
  defaultToWalletId: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  apiError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const fromWalletId = ref('')
const toWalletId = ref('')
const bucketId = ref('')
const amountInput = ref('')
const description = ref('')
const transactionDate = ref('')
const datePickerOpen = ref(false)
const localError = ref('')

const title = 'Alokasikan dana'

const walletOptions = computed(() =>
  [...props.wallets]
    .filter((w) => w.isActive !== false)
    .sort((a, b) => String(a.name).localeCompare(b.name, 'id')),
)

const fromWallet = computed(() =>
  walletOptions.value.find((w) => w.id === fromWalletId.value),
)

const fromBalance = computed(() =>
  fromWallet.value ? parseMoneyString(fromWallet.value.balance) : 0,
)

const availableToAllocate = computed(() => {
  if (!props.summary) return 0
  const n = props.summary.available
  if (n == null) return 0
  return Number(n)
})

const amountNum = computed(() => parseMoneyString(amountInput.value))

const overSourceBalance = computed(
  () => amountNum.value > 0 && amountNum.value > fromBalance.value,
)

const overAvailable = computed(() => {
  if (amountNum.value <= 0) return false
  const avail = availableToAllocate.value
  if (avail < 0) return false
  return amountNum.value > avail
})

const canSubmit = computed(
  () =>
    !!fromWalletId.value &&
    !!toWalletId.value &&
    fromWalletId.value !== toWalletId.value &&
    !!bucketId.value &&
    amountNum.value > 0 &&
    !overSourceBalance.value &&
    !overAvailable.value &&
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
  fromWalletId.value = ''
  toWalletId.value = ''
  bucketId.value = props.defaultBucketId || ''
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
    if (props.defaultFromWalletId) {
      fromWalletId.value = props.defaultFromWalletId
    } else if (walletOptions.value.length) {
      fromWalletId.value = walletOptions.value[0].id
    }
    if (props.defaultToWalletId) {
      toWalletId.value = props.defaultToWalletId
    } else {
      const second = walletOptions.value.find(
        (w) => w.id !== fromWalletId.value,
      )
      toWalletId.value = second ? second.id : ''
    }
    if (props.defaultBucketId) {
      bucketId.value = props.defaultBucketId
    } else if (props.buckets.length) {
      bucketId.value = props.buckets[0].id
    }
  }
)

function close() {
  if (props.submitting) return
  emit('close')
}

function onSubmit() {
  localError.value = ''
  if (!canSubmit.value) {
    if (overSourceBalance.value) {
      localError.value = 'Jumlah melebihi saldo dompet sumber.'
      return
    }
    if (overAvailable.value) {
      localError.value =
        'Jumlah melebihi sisa dana yang bisa dialokasikan (tersedia sistem).'
      return
    }
    localError.value = 'Lengkapi form: dompet, bucket, jumlah, dan tanggal.'
    return
  }
  emit('submit', {
    fromWalletId: fromWalletId.value,
    toWalletId: toWalletId.value,
    bucketId: bucketId.value,
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
      :aria-labelledby="'alloc-transfer-title'"
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
            id="alloc-transfer-title"
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

          <p class="mb-3 rounded-md border border-border-default bg-ds-black-400/50 px-3 py-2 text-[12px] text-text-secondary">
            <span class="text-text-tertiary">Saldo sumber: </span>
            <span class="font-mono font-medium tabular-nums text-text-primary">{{
              fromWallet
                ? formatIdrId(fromBalance)
                : '—'
            }}</span>
            <br >
            <span class="text-text-tertiary">Sisa bisa dialokasikan: </span>
            <span class="font-mono font-medium tabular-nums text-positive">{{
              formatIdrId(availableToAllocate)
            }}</span>
          </p>

          <div
            v-if="overSourceBalance"
            class="mb-3 rounded-md border border-amber-500/45 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-100"
            role="status"
          >
            Peringatan: jumlah melebihi saldo dompet sumber.
          </div>
          <div
            v-if="overAvailable"
            class="mb-3 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[12px] text-negative"
            role="alert"
          >
            Melebihi sisa dana yang bisa dialokasikan.
          </div>

          <form
            class="space-y-4"
            @submit.prevent="onSubmit"
          >
            <div>
              <label
                for="a-from"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Dari dompet
              </label>
              <select
                id="a-from"
                v-model="fromWalletId"
                class="w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange"
              >
                <option
                  disabled
                  value=""
                >
                  Pilih
                </option>
                <option
                  v-for="w in walletOptions"
                  :key="w.id"
                  :value="w.id"
                >
                  {{ w.name }} ({{ formatIdrId(parseMoneyString(w.balance)) }})
                </option>
              </select>
            </div>
            <div>
              <label
                for="a-to"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Ke dompet
              </label>
              <select
                id="a-to"
                v-model="toWalletId"
                class="w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange"
              >
                <option
                  disabled
                  value=""
                >
                  Pilih
                </option>
                <option
                  v-for="w in walletOptions"
                  :key="w.id"
                  :value="w.id"
                >
                  {{ w.name }} ({{ formatIdrId(parseMoneyString(w.balance)) }})
                </option>
              </select>
            </div>
            <div>
              <label
                for="a-bucket"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Bucket
              </label>
              <select
                id="a-bucket"
                v-model="bucketId"
                class="w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange"
                :disabled="!buckets.length"
              >
                <option
                  disabled
                  value=""
                >
                  {{ buckets.length ? 'Pilih bucket' : 'Tidak ada bucket' }}
                </option>
                <option
                  v-for="b in buckets"
                  :key="b.id"
                  :value="b.id"
                >
                  {{ b.name }}
                </option>
              </select>
            </div>
            <div>
              <label
                for="a-amt"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Jumlah
              </label>
              <RupiahInput
                id="a-amt"
                v-model="amountInput"
                placeholder="0"
                :disabled="submitting"
              />
            </div>
            <div>
              <label
                for="a-date"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Tanggal
              </label>
              <div class="flex gap-2">
                <input
                  id="a-date"
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
                for="a-desc"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Catatan (opsional)
              </label>
              <textarea
                id="a-desc"
                v-model="description"
                rows="2"
                maxlength="500"
                class="w-full resize-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange"
                placeholder="Contoh: top-up dana darurat"
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
            :disabled="!canSubmit || submitting"
            @click="onSubmit"
          >
            {{ submitting ? 'Memproses…' : 'Lanjut alokasi' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
