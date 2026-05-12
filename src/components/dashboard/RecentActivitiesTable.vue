<script setup>
import { computed, ref } from 'vue'

import { Filter, Search, X } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'

const props = defineProps({
  transactions: { type: Array, required: true },
  wallets: { type: Array, required: true },
  categories: { type: Array, required: true },
})

const searchQuery = ref('')
const filterCategoryId = ref('')
const filterWalletId = ref('')
const filterType = ref('')
const filterDate = ref('')

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
      if (filterWalletId.value && t.walletId !== filterWalletId.value) return false
      if (filterType.value && t.type !== filterType.value) return false
      if (filterDate.value && t.date !== filterDate.value) return false
      if (q) {
        const cat = categoryById.value[t.categoryId]
        const wallet = walletById.value[t.walletId]
        const haystack = [
          t.id,
          t.description ?? '',
          cat?.name ?? '',
          wallet?.name ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    .slice(0, 5)
})

const hasFilters = computed(
  () =>
    !!searchQuery.value ||
    !!filterCategoryId.value ||
    !!filterWalletId.value ||
    !!filterType.value ||
    !!filterDate.value,
)

function resetFilters() {
  searchQuery.value = ''
  filterCategoryId.value = ''
  filterWalletId.value = ''
  filterType.value = ''
  filterDate.value = ''
}

function formatDateDisplay(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function shortTxId(id) {
  const tail = String(id).slice(-6).toUpperCase()
  return `INV-${tail}`
}
</script>

<template>
  <section
    class="overflow-hidden rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 shadow-card-elevated backdrop-blur-md"
  >
    <header
      class="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Recent Activities
        </p>
        <h3 class="mt-0.5 text-[17px] font-semibold text-text-primary">
          5 transaksi terbaru
        </h3>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div
          class="inline-flex h-9 items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 transition-colors focus-within:border-accent-primary/60"
        >
          <Search
            :size="14"
            :stroke-width="2"
            class="text-text-tertiary"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari transaksi..."
            class="w-[160px] bg-transparent text-[12.5px] text-text-primary placeholder:text-text-tertiary focus:outline-none sm:w-[200px]"
          >
        </div>

        <select
          v-model="filterCategoryId"
          class="h-9 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-text-secondary transition-colors hover:border-white/15 focus:border-accent-primary/60 focus:outline-none"
        >
          <option value="">
            Semua kategori
          </option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>

        <select
          v-model="filterWalletId"
          class="h-9 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-text-secondary transition-colors hover:border-white/15 focus:border-accent-primary/60 focus:outline-none"
        >
          <option value="">
            Semua wallet
          </option>
          <option
            v-for="w in wallets"
            :key="w.id"
            :value="w.id"
          >
            {{ w.name }}
          </option>
        </select>

        <select
          v-model="filterType"
          class="h-9 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-text-secondary transition-colors hover:border-white/15 focus:border-accent-primary/60 focus:outline-none"
        >
          <option value="">
            Semua tipe
          </option>
          <option value="income">
            Income
          </option>
          <option value="expense">
            Expense
          </option>
        </select>

        <input
          v-model="filterDate"
          type="date"
          class="h-9 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-text-secondary transition-colors hover:border-white/15 focus:border-accent-primary/60 focus:outline-none"
        >

        <button
          v-if="hasFilters"
          type="button"
          class="inline-flex h-9 items-center gap-1 rounded-[10px] border border-negative/30 bg-negative/8 px-2.5 text-[12px] font-medium text-negative transition-colors hover:bg-negative/15"
          @click="resetFilters"
        >
          <X
            :size="12"
            :stroke-width="2.5"
          />
          Reset
        </button>
      </div>
    </header>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-[13px]">
        <thead class="bg-ds-black-400/40">
          <tr>
            <th
              class="px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary sm:px-6"
            >
              ID
            </th>
            <th class="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Activity
            </th>
            <th class="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Category
            </th>
            <th class="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Wallet
            </th>
            <th class="px-3 py-3 text-right text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Amount
            </th>
            <th class="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Status
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
            <td class="px-3 py-3 text-text-primary">
              <p class="truncate text-[13px] font-medium">
                {{ row.description }}
              </p>
            </td>
            <td class="px-3 py-3">
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
                <span class="truncate text-[12.5px] text-text-secondary">
                  {{ categoryById[row.categoryId]?.name || '—' }}
                </span>
              </div>
            </td>
            <td class="px-3 py-3">
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
                <span class="truncate text-[12.5px] text-text-secondary">
                  {{ walletById[row.walletId]?.name || '—' }}
                </span>
              </div>
            </td>
            <td class="px-3 py-3 text-right">
              <p
                class="font-mono text-[13px] font-semibold tabular-nums"
                :class="row.type === 'income' ? 'text-positive' : 'text-negative'"
              >
                {{ row.type === 'income' ? '+' : '−'
                }}{{ formatIndonesianRupiah(row.amount) }}
              </p>
            </td>
            <td class="px-3 py-3">
              <span
                class="inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold capitalize"
                :class="
                  row.status === 'completed'
                    ? 'border-positive/30 bg-positive/12 text-positive'
                    : 'border-amber-500/30 bg-amber-500/14 text-amber-400'
                "
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="row.status === 'completed' ? 'bg-positive' : 'bg-amber-400'"
                />
                {{ row.status }}
              </span>
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
  </section>
</template>
