<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { X } from 'lucide-vue-next'

import { listCategories } from '@/services/categories'
import { createTransaction } from '@/services/transactions'
import { listWallets } from '@/services/wallets'
import {
  formatIdrId,
  parseMoneyString,
  toApiMoneyString,
} from '@/utils/moneyFormat.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** YYYY-MM-DD */
  defaultDate: { type: String, default: null },
})

const emit = defineEmits(['close', 'saved'])

const wallets = ref([])
const categories = ref([])

const txType = ref('expense')
const walletId = ref('')
const categoryId = ref('')
const amountInput = ref('')
const description = ref('')
const transactionDate = ref('')

const loadingMeta = ref(false)
const submitting = ref(false)
const localError = ref('')

const title = 'Tambah transaksi'

const categoriesForType = computed(() => {
  const t = txType.value
  return categories.value.filter((c) => c.type === t)
})

const canSubmit = computed(
  () =>
    !!walletId.value &&
    !!categoryId.value &&
    parseMoneyString(amountInput.value) > 0 &&
    !!transactionDate.value,
)

function close() {
  if (submitting.value) return
  emit('close')
}

function resetForm() {
  txType.value = 'expense'
  walletId.value = ''
  categoryId.value = ''
  amountInput.value = ''
  description.value = ''
  localError.value = ''
  if (props.defaultDate) {
    transactionDate.value = props.defaultDate
  } else {
    const d = new Date()
    transactionDate.value = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
  }
}

async function loadMeta() {
  loadingMeta.value = true
  localError.value = ''
  try {
    const [wRes, cRes] = await Promise.all([
      listWallets(),
      listCategories({ page: 1, limit: 100 }),
    ])
    wallets.value = (wRes.data || []).filter((w) => w.isActive !== false)
    categories.value = cRes.data?.data || []
  } catch (e) {
    localError.value =
      e?.response?.data?.message || 'Gagal memuat dompet dan kategori.'
    wallets.value = []
    categories.value = []
  } finally {
    loadingMeta.value = false
  }
}

watch(
  () => [props.open, props.defaultDate],
  async () => {
    if (!props.open) return
    await nextTick()
    resetForm()
    await loadMeta()
    if (wallets.value.length && !walletId.value) {
      walletId.value = wallets.value[0].id
    }
    pickDefaultCategory()
  }
)

function pickDefaultCategory() {
  const list = categoriesForType.value
  if (!list.length) {
    categoryId.value = ''
    return
  }
  const first = list[0]
  if (!list.some((c) => c.id === categoryId.value)) {
    categoryId.value = first.id
  }
}

watch(txType, () => {
  pickDefaultCategory()
})

async function onSubmit() {
  localError.value = ''
  const amount = parseMoneyString(amountInput.value)
  if (amount <= 0) {
    localError.value = 'Nominal harus lebih dari 0.'
    return
  }
  if (!walletId.value || !categoryId.value || !transactionDate.value) {
    localError.value = 'Lengkapi dompet, kategori, dan tanggal.'
    return
  }

  submitting.value = true
  try {
    await createTransaction({
      walletId: walletId.value,
      categoryId: categoryId.value,
      type: txType.value,
      amount: toApiMoneyString(amount),
      description: description.value.trim() || undefined,
      transactionDate: transactionDate.value,
    })
    emit('saved')
  } catch (e) {
    localError.value =
      e?.response?.data?.message || 'Gagal menyimpan transaksi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'tx-modal-title'"
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
            id="tx-modal-title"
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

        <div
          class="min-h-0 flex-1 overflow-y-auto px-5 py-4"
        >
          <p
            v-if="localError"
            class="mb-3 rounded-md border border-negative/30 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ localError }}
          </p>

          <div
            v-if="loadingMeta"
            class="py-8 text-center text-[13px] text-text-tertiary"
          >
            Memuat…
          </div>

          <form
            v-else
            class="space-y-4"
            @submit.prevent="onSubmit"
          >
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Jenis
              </p>
              <div
                class="mt-2 inline-flex overflow-hidden rounded-[10px] border border-border-default bg-ds-black-400/50 p-0.5"
              >
                <button
                  type="button"
                  class="rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors"
                  :class="
                    txType === 'income'
                      ? 'bg-positive/20 text-positive'
                      : 'text-text-secondary hover:text-text-primary'
                  "
                  @click="txType = 'income'"
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  class="rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors"
                  :class="
                    txType === 'expense'
                      ? 'bg-negative/20 text-negative'
                      : 'text-text-secondary hover:text-text-primary'
                  "
                  @click="txType = 'expense'"
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            <div>
              <label
                for="tx-date"
                class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Tanggal
              </label>
              <input
                id="tx-date"
                v-model="transactionDate"
                type="date"
                class="mt-1.5 w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none transition-[box-shadow] focus:border-border-accent-orange focus:shadow-input-focus"
                required
              />
            </div>

            <div>
              <label
                for="tx-wallet"
                class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Dompet
              </label>
              <select
                id="tx-wallet"
                v-model="walletId"
                class="mt-1.5 w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
                required
              >
                <option
                  disabled
                  value=""
                >
                  Pilih dompet
                </option>
                <option
                  v-for="w in wallets"
                  :key="w.id"
                  :value="w.id"
                >
                  {{ w.name }} — {{ formatIdrId(parseMoneyString(w.balance)) }}
                </option>
              </select>
            </div>

            <div>
              <label
                for="tx-cat"
                class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Kategori
              </label>
              <select
                id="tx-cat"
                v-model="categoryId"
                class="mt-1.5 w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
                required
                :disabled="!categoriesForType.length"
              >
                <option
                  disabled
                  value=""
                >
                  {{
                    categoriesForType.length
                      ? 'Pilih kategori'
                      : 'Tidak ada kategori'
                  }}
                </option>
                <option
                  v-for="c in categoriesForType"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.name }}
                </option>
              </select>
            </div>

            <div>
              <label
                for="tx-amount"
                class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Nominal (IDR)
              </label>
              <input
                id="tx-amount"
                v-model="amountInput"
                type="text"
                inputmode="decimal"
                placeholder="0"
                class="mt-1.5 w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 font-mono text-[15px] tabular-nums text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
                autocomplete="off"
                required
              />
            </div>

            <div>
              <label
                for="tx-desc"
                class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Catatan (opsional)
              </label>
              <textarea
                id="tx-desc"
                v-model="description"
                rows="2"
                maxlength="500"
                class="mt-1.5 w-full resize-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
                placeholder="Mis. makan siang"
              />
            </div>
          </form>
        </div>

        <div
          class="shrink-0 border-t border-white/[0.06] p-4"
        >
          <button
            type="button"
            class="inline-flex w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canSubmit || submitting || loadingMeta"
            @click="onSubmit"
          >
            {{ submitting ? 'Menyimpan…' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
