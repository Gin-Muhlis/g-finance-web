<script setup>
import { computed, ref } from 'vue'

import { Filter, ListFilter } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import RecentActivitiesFilterModal from '@/components/dashboard/RecentActivitiesFilterModal.vue'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  transactions: { type: Array, required: true },
  wallets: { type: Array, required: true },
  categories: { type: Array, required: true },
})
const emit = defineEmits(['filters-change'])

const filterModalOpen = ref(false)

const searchQuery = ref('')
const filterCategoryId = ref('')
const filterWalletId = ref('')
const filterType = ref('')

const walletById = computed(() => {
  const map = {}
  for (const w of props.wallets) map[w.id] = w
  return map
})

const categoryById = computed(() => {
  const map = {}
  for (const c of props.categories) map[c.id] = c
  return map
})

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return props.transactions
    .filter((t) => {
      if (filterCategoryId.value && t.categoryId !== filterCategoryId.value) return false
      if (
        filterWalletId.value &&
        t.walletId !== filterWalletId.value &&
        t.fromWalletId !== filterWalletId.value &&
        t.toWalletId !== filterWalletId.value
      ) {
        return false
      }
      if (filterType.value && t.type !== filterType.value) return false
      if (q) {
        const cat = categoryById.value[t.categoryId]
        const wallet = walletById.value[t.walletId]
        const haystack = [
          t.id,
          t.description ?? '',
          cat?.name ?? '',
          wallet?.name ?? '',
          t.fromWallet?.name ?? '',
          t.toWallet?.name ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    .slice(0, 5)
})

const hasActiveFilters = computed(
  () =>
    !!searchQuery.value ||
    !!filterCategoryId.value ||
    !!filterWalletId.value ||
    !!filterType.value,
)

function openFilterModal() {
  filterModalOpen.value = true
}

function closeFilterModal() {
  filterModalOpen.value = false
}

function onFilterApply({ search, walletId, categoryId, type }) {
  searchQuery.value = search ?? ''
  filterWalletId.value = walletId ?? ''
  filterCategoryId.value = categoryId ?? ''
  filterType.value = type ?? ''
  filterModalOpen.value = false
  emit('filters-change', {
    search: searchQuery.value,
    walletId: filterWalletId.value,
    categoryId: filterCategoryId.value,
    type: filterType.value,
  })
}

function onFilterReset() {
  searchQuery.value = ''
  filterCategoryId.value = ''
  filterWalletId.value = ''
  filterType.value = ''
  filterModalOpen.value = false
  emit('filters-change', {})
}

function formatDateDisplay(iso) {
  const [y, m, d] = String(iso || '').split('-')
  return `${d}/${m}/${y}`
}

function shortTxId(id) {
  const tail = String(id).slice(-6).toUpperCase()
  return `INV-${tail}`
}

function activityLabel(row) {
  if (row.description) return row.description
  if (row.type === 'transfer') return 'Transfer wallet'
  return row.type === 'income' ? 'Income' : 'Expense'
}

function walletLabel(row) {
  if (row.type === 'transfer') {
    const fromName = row.fromWallet?.name ?? walletById.value[row.fromWalletId]?.name ?? 'Wallet'
    const toName = row.toWallet?.name ?? walletById.value[row.toWalletId]?.name ?? 'Wallet'
    return `${fromName} → ${toName}`
  }
  return walletById.value[row.walletId]?.name || row.walletName || '—'
}

function amountPrefix(row) {
  if (row.type === 'income') return '+'
  if (row.type === 'expense') return '−'
  return ''
}

function amountClass(row) {
  if (row.type === 'income') return 'text-positive'
  if (row.type === 'expense') return 'text-negative'
  return 'text-cyan-400'
}
</script>

<template>
  <section
    class="flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 shadow-card-elevated backdrop-blur-md"
  >
    <header
      class="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.06] p-5 sm:p-6"
    >
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Recent Activities
        </p>
        <h3 class="mt-0.5 text-[17px] font-semibold text-text-primary">
          5 transaksi terbaru
        </h3>
      </div>

      <button
        type="button"
        class="relative inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-border-accent-orange/50 hover:bg-white/[0.08] hover:text-text-primary"
        :class="
          hasActiveFilters
            ? 'border-border-accent-orange/40 text-accent-primary'
            : ''
        "
        aria-label="Buka filter aktivitas"
        @click="openFilterModal"
      >
        <ListFilter
          :size="15"
          :stroke-width="2"
        />
        <span class="hidden sm:inline">Filter</span>
        <span
          v-if="hasActiveFilters"
          class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-primary shadow-[0_0_6px_rgba(255,80,0,0.7)]"
          aria-hidden="true"
        />
      </button>
    </header>

    <div class="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
      <table class="min-w-full text-left text-[13px]">
        <thead class="sticky top-0 z-[1] bg-ds-black-400/95 backdrop-blur-sm">
          <tr>
            <th
              class="px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary sm:px-6"
            >
              ID
            </th>
            <th class="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Activity
            </th>
            <th class="hidden px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary md:table-cell">
              Category
            </th>
            <th class="hidden px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary lg:table-cell">
              Wallet
            </th>
            <th class="px-3 py-3 text-right text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Amount
            </th>
            <th class="px-3 py-3 pr-5 text-right text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary sm:pr-6">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredRows"
            :key="row.id"
            class="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]"
          >
            <td
              class="whitespace-nowrap px-5 py-3 font-mono text-[12px] text-text-tertiary sm:px-6"
            >
              {{ shortTxId(row.id) }}
            </td>
            <td class="max-w-[140px] px-3 py-3 text-text-primary sm:max-w-[180px]">
              <p class="truncate text-[13px] font-medium">
                {{ activityLabel(row) }}
              </p>
            </td>
            <td class="hidden px-3 py-3 md:table-cell">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.06]"
                  :style="{
                    backgroundColor: `${categoryById[row.categoryId]?.color ?? '#FFFFFF'}1F`,
                  }"
                >
                  <CategoryIcon
                    :icon-name="categoryById[row.categoryId]?.icon || 'Tag'"
                    :color="categoryById[row.categoryId]?.color || '#FFFFFF'"
                    :size="14"
                  />
                </span>
                <span class="max-w-[100px] truncate text-[12.5px] text-text-secondary">
                  {{ categoryById[row.categoryId]?.name || '—' }}
                </span>
              </div>
            </td>
            <td class="hidden px-3 py-3 lg:table-cell">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.06]"
                  :style="{
                    backgroundColor: `${walletById[row.walletId]?.color ?? '#FFFFFF'}1F`,
                  }"
                >
                  <CategoryIcon
                    :icon-name="walletById[row.walletId]?.icon || 'Wallet'"
                    :color="walletById[row.walletId]?.color || '#FFFFFF'"
                    :size="14"
                  />
                </span>
                <span class="max-w-[90px] truncate text-[12.5px] text-text-secondary">
                  {{ walletLabel(row) }}
                </span>
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-right">
              <p
                class="font-mono text-[13px] font-semibold tabular-nums"
                :class="amountClass(row)"
              >
                {{ amountPrefix(row) }}{{ formatIndonesianRupiah(row.amount) }}
              </p>
            </td>
            <td class="whitespace-nowrap px-3 py-3 pr-5 text-right text-[12px] text-text-tertiary sm:pr-6">
              {{ formatDateDisplay(row.date) }}
            </td>
          </tr>
          <tr v-if="!filteredRows.length">
            <td
              :colspan="7"
              class="px-5 py-10 text-center text-[13px] text-text-tertiary sm:px-6"
            >
              <Filter
                :size="22"
                :stroke-width="1.5"
                class="mx-auto mb-2 text-text-tertiary"
              />
              Tidak ada transaksi yang cocok dengan filter.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <RecentActivitiesFilterModal
      :open="filterModalOpen"
      :wallets="wallets"
      :categories="categories"
      :applied-search="searchQuery"
      :applied-wallet-id="filterWalletId"
      :applied-category-id="filterCategoryId"
      :applied-type="filterType"
      @close="closeFilterModal"
      @apply="onFilterApply"
      @reset="onFilterReset"
    />
  </section>
</template>
