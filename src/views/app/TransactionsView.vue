<script setup>
import { computed, ref, watch } from 'vue'

import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import TransactionFormModal from '@/components/transactions/TransactionFormModal.vue'
import WalletIcon from '@/components/transactions/WalletIcon.vue'
import { listCategories } from '@/services/categories'
import { listTransactions } from '@/services/transactions'
import { listWallets } from '@/services/wallets'
import { useToastStore } from '@/stores/toast'
import { formatIdrId, parseMoneyString } from '@/utils/moneyFormat.js'

const toast = useToastStore()

const MONTH_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const DAY_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)

const loading = ref(false)
const error = ref('')
const transactionsByDay = ref([])
const totalIncome = ref('0')
const totalExpense = ref('0')

const walletsById = ref({})
const categoryById = ref({})

const modalOpen = ref(false)

const monthLabel = computed(() => {
  const m = month.value
  if (m < 1 || m > 12) return '—'
  return `${MONTH_ID[m - 1]} ${year.value}`
})

const monthRange = computed(() => {
  const y = year.value
  const mo = month.value
  const start = new Date(y, mo - 1, 1)
  const end = new Date(y, mo, 0)
  const fmt = (d) => {
    const yy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  }
  return { startDate: fmt(start), endDate: fmt(end) }
})

const totalIncomeNum = computed(() => parseMoneyString(totalIncome.value))
const totalExpenseNum = computed(() => parseMoneyString(totalExpense.value))

const daysWithStats = computed(() =>
  transactionsByDay.value.map((d) => ({
    ...d,
    stats: dayStats(d.transactions || []),
  })),
)

function shiftMonth(delta) {
  let y = year.value
  let m = month.value + delta
  while (m < 1) {
    m += 12
    y -= 1
  }
  while (m > 12) {
    m -= 12
    y += 1
  }
  if (y < 1970 || y > 2100) return
  year.value = y
  month.value = m
}

function formatDayHeader(isoDate) {
  const [ys, ms, ds] = isoDate.split('-').map(Number)
  const d = new Date(ys, ms - 1, ds)
  const w = DAY_ID[d.getDay()]
  return `${w}, ${ds} ${MONTH_ID[ms - 1]} ${ys}`
}

function dayStats(transactions) {
  let inc = 0
  let exp = 0
  for (const t of transactions) {
    const a = parseMoneyString(t.amount)
    if (t.type === 'income') inc += a
    else exp += a
  }
  return {
    count: transactions.length,
    income: inc,
    expense: exp,
  }
}

function categoryMeta(t) {
  const nested = t.category
  const fromMap = categoryById.value[t.categoryId]
  const icon = nested?.icon ?? fromMap?.icon ?? null
  const color = nested?.color ?? fromMap?.color ?? '#FFFFFF'
  const name = t.categoryName || nested?.name || fromMap?.name || '—'
  return { icon, color, name }
}

function walletMeta(t) {
  const w = walletsById.value[t.walletId]
  return {
    name: t.walletName || w?.name || '—',
    balance: w ? parseMoneyString(w.balance) : null,
    icon: w?.icon || 'Wallet',
  }
}

async function loadMetaMaps() {
  try {
    const [wRes, cRes] = await Promise.all([
      listWallets(),
      listCategories({ page: 1, limit: 100 }),
    ])
    const wm = {}
    for (const w of wRes.data || []) {
      wm[w.id] = w
    }
    walletsById.value = wm
    const cm = {}
    for (const c of cRes.data?.data || []) {
      cm[c.id] = c
    }
    categoryById.value = cm
  } catch {
    /* optional enrichment */
  }
}

async function load() {
  loading.value = true
  error.value = ''
  const { startDate, endDate } = monthRange.value
  try {
    const { data } = await listTransactions({ startDate, endDate })
    transactionsByDay.value = data?.transactionsByDay || []
    totalIncome.value = data?.totalIncome ?? '0'
    totalExpense.value = data?.totalExpense ?? '0'
    await loadMetaMaps()
  } catch (e) {
    error.value =
      e?.response?.data?.message || 'Gagal memuat transaksi.'
    transactionsByDay.value = []
  } finally {
    loading.value = false
  }
}

watch([year, month], load, { immediate: true })

function openModal() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function onSaved() {
  toast.success('Transaksi tersimpan.')
  closeModal()
  await load()
}

const defaultDateForModal = computed(() => {
  const t = new Date()
  if (t.getFullYear() === year.value && t.getMonth() + 1 === month.value) {
    return [
      t.getFullYear(),
      String(t.getMonth() + 1).padStart(2, '0'),
      String(t.getDate()).padStart(2, '0'),
    ].join('-')
  }
  return `${year.value}-${String(month.value).padStart(2, '0')}-01`
})
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div
        class="inline-flex h-9 w-full max-w-[min(100%,320px)] items-stretch overflow-hidden rounded-[10px] border border-border-default bg-ds-black-400/70 shadow-card-default"
      >
        <button
          type="button"
          class="px-2.5 text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
          :disabled="loading"
          aria-label="Bulan sebelumnya"
          @click="shiftMonth(-1)"
        >
          <ChevronLeft
            :size="18"
            :stroke-width="2"
          />
        </button>
        <div
          class="flex min-w-0 flex-1 items-center justify-center gap-1.5 border-x border-border-default bg-ds-black-200/40 px-3"
        >
          <CalendarRange
            :size="16"
            :stroke-width="2"
            class="shrink-0 text-accent-primary"
          />
          <span
            class="truncate text-center text-[13px] font-medium tabular-nums text-text-primary"
          >
            {{ monthLabel }}
          </span>
        </div>
        <button
          type="button"
          class="px-2.5 text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
          :disabled="loading"
          aria-label="Bulan berikutnya"
          @click="shiftMonth(1)"
        >
          <ChevronRight
            :size="18"
            :stroke-width="2"
          />
        </button>
      </div>

      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 sm:w-auto"
        :disabled="loading"
        @click="openModal"
      >
        <Plus
          :size="18"
          :stroke-width="2"
        />
        Tambah transaksi
      </button>
    </div>

    <div
      v-if="error"
      class="rounded-[14px] border border-negative/30 bg-negative/5 px-4 py-3 text-[13px] text-negative"
    >
      {{ error }}
    </div>

    <div
      v-if="!loading && !error"
      class="grid gap-3 sm:grid-cols-2"
    >
      <div
        class="rounded-[14px] border border-positive/25 bg-background-surface/90 px-4 py-3 shadow-card-default"
      >
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
        >
          Total pemasukan
        </p>
        <p
          class="mt-1.5 text-[22px] font-semibold tabular-nums text-positive"
        >
          {{ formatIdrId(totalIncomeNum) }}
        </p>
      </div>
      <div
        class="rounded-[14px] border border-negative/25 bg-background-surface/90 px-4 py-3 shadow-card-default"
      >
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
        >
          Total pengeluaran
        </p>
        <p
          class="mt-1.5 text-[22px] font-semibold tabular-nums text-negative"
        >
          {{ formatIdrId(totalExpenseNum) }}
        </p>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 rounded-[14px] border border-border-default bg-background-overlay py-16 text-text-secondary"
    >
      <Loader2
        class="h-5 w-5 shrink-0 animate-spin"
        :stroke-width="2"
      />
      <span class="text-[13px]">Memuat transaksi…</span>
    </div>

    <div
      v-else-if="!error"
      class="space-y-5"
    >
      <div
        v-if="!transactionsByDay.length"
        class="rounded-[14px] border border-dashed border-border-default bg-background-overlay px-4 py-12 text-center"
      >
        <p class="text-[14px] text-text-secondary">
          Belum ada transaksi di bulan ini.
        </p>
        <p class="mt-1 text-[13px] text-text-tertiary">
          Tambah pemasukan atau pengeluaran dengan tombol di atas.
        </p>
      </div>

      <template v-else>
        <section
          v-for="day in daysWithStats"
          :key="day.transactionDate"
          class="overflow-hidden rounded-[14px] border border-border-default bg-background-overlay shadow-card-default"
        >
        <div
          class="flex flex-col gap-1 border-b border-border-subtle bg-ds-black-300/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="text-[15px] font-semibold text-text-primary">
              {{ formatDayHeader(day.transactionDate) }}
            </h3>
            <p class="text-[12px] text-text-tertiary">
              {{ day.stats.count }} transaksi
              <span
                v-if="day.stats.income > 0"
                class="text-positive"
              >
                · +{{ formatIdrId(day.stats.income) }}
              </span>
              <span
                v-if="day.stats.expense > 0"
                class="text-negative"
              >
                · −{{ formatIdrId(day.stats.expense) }}
              </span>
            </p>
          </div>
        </div>

        <ul class="divide-y divide-border-subtle">
          <li
            v-for="t in day.transactions"
            :key="t.id"
            class="flex gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border-default bg-ds-black-400/60"
            >
              <CategoryIcon
                :icon-name="categoryMeta(t).icon"
                :color="categoryMeta(t).color"
                :size="22"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[14px] font-medium text-text-primary">
                {{ categoryMeta(t).name }}
              </p>
              <p class="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-text-tertiary">
                <span class="inline-flex items-center gap-1">
                  <WalletIcon
                    :icon-name="walletMeta(t).icon"
                    :size="14"
                    class="shrink-0"
                  />
                  {{ walletMeta(t).name }}
                </span>
                <span
                  v-if="walletMeta(t).balance != null"
                  class="text-text-tertiary"
                >
                  · saldo
                  <span class="font-mono tabular-nums text-text-secondary">
                    {{ formatIdrId(walletMeta(t).balance) }}
                  </span>
                </span>
              </p>
              <p
                v-if="t.description"
                class="mt-1 line-clamp-2 text-[12px] text-text-tertiary"
              >
                {{ t.description }}
              </p>
            </div>
            <div
              class="shrink-0 self-center text-right"
            >
              <p
                class="text-[15px] font-semibold tabular-nums"
                :class="t.type === 'income' ? 'text-positive' : 'text-negative'"
              >
                {{ t.type === 'income' ? '+' : '−'
                }}{{ formatIdrId(parseMoneyString(t.amount)) }}
              </p>
            </div>
          </li>
        </ul>
        </section>
      </template>
    </div>

    <TransactionFormModal
      :open="modalOpen"
      :default-date="defaultDateForModal"
      @close="closeModal"
      @saved="onSaved"
    />
  </div>
</template>
