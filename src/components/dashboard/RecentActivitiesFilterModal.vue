<script setup>
import { computed, ref, watch } from 'vue'

import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  wallets: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  appliedSearch: { type: String, default: '' },
  appliedWalletId: { type: String, default: '' },
  appliedCategoryId: { type: String, default: '' },
  appliedType: { type: String, default: '' },
})

const emit = defineEmits(['close', 'apply', 'reset'])

const categoryById = computed(() => {
  const map = {}
  for (const c of props.categories) {
    map[c.id] = c
  }
  return map
})

const walletOptions = computed(() =>
  [...props.wallets].sort((a, b) => String(a.name).localeCompare(b.name, 'id')),
)

const draftSearch = ref('')
const draftWalletId = ref('')
const draftCategoryId = ref('')
const draftType = ref('')

const categoryOptions = computed(() =>
  props.categories
    .filter((c) => c.type === 'income' || c.type === 'expense')
    .filter(() => draftType.value !== 'transfer')
    .filter((c) => !draftType.value || c.type === draftType.value)
    .sort((a, b) => String(a.name).localeCompare(b.name, 'id')),
)

function syncDraftFromApplied() {
  draftSearch.value = props.appliedSearch
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

watch(draftType, (type) => {
  if (type === 'transfer') {
    draftCategoryId.value = ''
    return
  }
  if (!type || !draftCategoryId.value) return
  const cat = categoryById.value[draftCategoryId.value]
  if (cat && cat.type !== type) draftCategoryId.value = ''
})

function close() {
  emit('close')
}

function onApply() {
  emit('apply', {
    search: draftSearch.value.trim(),
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
      aria-labelledby="recent-activities-filter-title"
    >
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="close"
      />
      <div
        class="relative z-10 flex max-h-[min(90dvh,560px)] w-full max-w-[440px] flex-col rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
        @click.stop
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4"
        >
          <h2
            id="recent-activities-filter-title"
            class="text-[18px] font-semibold tracking-[-0.01em] text-text-primary"
          >
            Filter aktivitas
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
            Filter pencarian, kategori, dompet, dan jenis transaksi. Tanpa filter
            tanggal — daftar menampilkan transaksi terbaru.
          </p>
          <div class="space-y-4">
            <div>
              <label
                for="recent-filter-search"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Cari
              </label>
              <div
                class="flex items-center gap-2 rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 shadow-inner focus-within:border-border-accent-orange focus-within:shadow-input-focus"
              >
                <Search
                  :size="16"
                  :stroke-width="2"
                  class="shrink-0 text-text-tertiary"
                />
                <input
                  id="recent-filter-search"
                  v-model="draftSearch"
                  type="text"
                  placeholder="ID, aktivitas, kategori, wallet..."
                  class="min-w-0 flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
                >
              </div>
            </div>

            <div>
              <label
                for="recent-filter-type"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Jenis transaksi
              </label>
              <select
                id="recent-filter-type"
                v-model="draftType"
                class="w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
              >
                <option value="">
                  Semua
                </option>
                <option value="income">
                  Income
                </option>
                <option value="expense">
                  Expense
                </option>
                <option value="transfer">
                  Transfer
                </option>
              </select>
            </div>

            <div>
              <label
                for="recent-filter-wallet"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Wallet
              </label>
              <select
                id="recent-filter-wallet"
                v-model="draftWalletId"
                class="w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
              >
                <option value="">
                  Semua wallet
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
                for="recent-filter-category"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Kategori
              </label>
              <select
                id="recent-filter-category"
                v-model="draftCategoryId"
                :disabled="draftType === 'transfer'"
                class="w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary shadow-inner outline-none focus:border-border-accent-orange focus:shadow-input-focus"
                :class="{ 'cursor-not-allowed opacity-60': draftType === 'transfer' }"
              >
                <option value="">
                  Semua kategori
                </option>
                <option
                  v-for="c in categoryOptions"
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
            @click="onReset"
          >
            Reset filter
          </button>
          <button
            type="button"
            class="order-1 inline-flex w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 sm:order-2"
            @click="onApply"
          >
            Terapkan filter
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
