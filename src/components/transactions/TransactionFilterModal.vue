<script setup>
import { computed, ref, watch } from 'vue'

import { X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  /** Opsi dompet, mis. dari GET /wallets */
  wallets: { type: Array, default: () => [] },
  /** Kategori income/expense saja, minimal { id, name, type } */
  categories: { type: Array, default: () => [] },
  /** Nilai filter terpakai saat ini (disalin ke draf saat modal dibuka) */
  appliedWalletId: { type: String, default: '' },
  appliedCategoryId: { type: String, default: '' },
  /** '' | 'income' | 'expense' */
  appliedType: { type: String, default: '' },
})

const emit = defineEmits(['close', 'apply', 'reset'])

const categoryById = computed(() => {
  const m = {}
  for (const c of props.categories) {
    m[c.id] = c
  }
  return m
})

const walletOptions = computed(() =>
  [...props.wallets]
    .filter((w) => w.isActive !== false)
    .sort((a, b) => String(a.name).localeCompare(b.name, 'id')),
)

const draftWalletId = ref('')
const draftCategoryId = ref('')
const draftType = ref('')

const categoryOptionsDraft = computed(() => {
  const list = props.categories.filter(
    (c) => c.type === 'income' || c.type === 'expense',
  )
  return list
    .filter((c) => !draftType.value || c.type === draftType.value)
    .sort((a, b) => String(a.name).localeCompare(b.name, 'id'))
})

function syncDraftFromApplied() {
  draftWalletId.value = props.appliedWalletId
  draftCategoryId.value = props.appliedCategoryId
  draftType.value = props.appliedType
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) syncDraftFromApplied()
  },
)

watch(draftType, (t) => {
  if (!t || !draftCategoryId.value) return
  const cat = categoryById.value[draftCategoryId.value]
  if (cat && cat.type !== t) draftCategoryId.value = ''
})

function close() {
  emit('close')
}

function onApply() {
  emit('apply', {
    walletId: draftWalletId.value,
    categoryId: draftCategoryId.value,
    type: draftType.value,
  })
}

function onReset() {
  emit('reset')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-filter-modal-title"
    >
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="close"
      />
      <div
        class="relative z-10 flex max-h-[min(90dvh,520px)] w-full max-w-[440px] flex-col rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
        @click.stop
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4"
        >
          <h2
            id="tx-filter-modal-title"
            class="text-[18px] font-semibold tracking-[-0.01em] text-text-primary"
          >
            Filter transaksi
          </h2>
          <button
            type="button"
            class="rounded-[10px] p-2 text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
            aria-label="Tutup"
            @click="close"
          >
            <X :size="20" />
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p class="mb-4 text-[12px] text-text-tertiary">
            Rentang tanggal mengikuti bulan yang dipilih di atas. Pilih
            jenis, dompet, dan/atau kategori, lalu terapkan.
          </p>
          <div class="space-y-4">
            <div>
              <label
                for="tx-filter-modal-type"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Jenis
              </label>
              <select
                id="tx-filter-modal-type"
                v-model="draftType"
                class="w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
              >
                <option value="">
                  Semua
                </option>
                <option value="income">
                  Pemasukan
                </option>
                <option value="expense">
                  Pengeluaran
                </option>
              </select>
            </div>
            <div>
              <label
                for="tx-filter-modal-wallet"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Dompet
              </label>
              <select
                id="tx-filter-modal-wallet"
                v-model="draftWalletId"
                class="w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
              >
                <option value="">
                  Semua dompet
                </option>
                <option
                  v-for="w in walletOptions"
                  :key="w.id"
                  :value="w.id"
                >
                  {{ w.name }}
                </option>
              </select>
            </div>
            <div>
              <label
                for="tx-filter-modal-cat"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Kategori
              </label>
              <select
                id="tx-filter-modal-cat"
                v-model="draftCategoryId"
                class="w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
              >
                <option value="">
                  Semua kategori
                </option>
                <option
                  v-for="c in categoryOptionsDraft"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div
          class="grid shrink-0 grid-cols-1 gap-2 border-t border-white/[0.06] p-4 sm:grid-cols-2"
        >
          <button
            type="button"
            class="order-2 inline-flex w-full items-center justify-center rounded-[10px] border border-border-default bg-ds-black-400/60 px-5 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary sm:order-1"
            :disabled="loading"
            @click="onReset"
          >
            Reset filter
          </button>
          <button
            type="button"
            class="order-1 inline-flex w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 sm:order-2"
            :disabled="loading"
            @click="onApply"
          >
            Terapkan filter
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
