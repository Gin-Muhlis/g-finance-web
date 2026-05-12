<script setup>
import { computed, ref, watch } from 'vue'

import {
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from 'lucide-vue-next'

import BudgetFormModal from '@/components/budget/BudgetFormModal.vue'
import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import { getBudgetItems, getBudgetSummary, putBudget } from '@/services/budgets'
import { useToastStore } from '@/stores/toast'
import {
  formatIdrId,
  formatIdrShort,
  parseMoneyString,
} from '@/utils/moneyFormat.js'

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

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)

const summary = ref(null)
const loading = ref(false)
const error = ref('')

const ITEMS_PAGE_SIZE = 10

const budgetItems = ref([])
const itemsPagination = ref({
  page: 1,
  limit: ITEMS_PAGE_SIZE,
  total: 0,
  totalPages: 0,
})
const itemsPage = ref(1)
const itemsError = ref('')
const itemsRefetching = ref(false)

const modalBudgetLines = ref([])
const modalLinesLoading = ref(false)

const modalOpen = ref(false)
const modalSubmitting = ref(false)
const modalError = ref('')

const monthLabel = computed(() => {
  const m = month.value
  if (m < 1 || m > 12) return '—'
  return `${MONTH_ID[m - 1]} ${year.value}`
})

const hasBudgetRecord = computed(() => summary.value && summary.value.budget)

const itemsRangeLabel = computed(() => {
  const p = itemsPagination.value
  if (!p?.total) return ''
  const start = (p.page - 1) * p.limit + 1
  const end = Math.min(p.page * p.limit, p.total)
  return `${start}–${end} dari ${p.total}`
})

const totalAllocated = computed(() =>
  summary.value
    ? parseMoneyString(summary.value.totals?.totalAllocated)
    : 0,
)

const totalActual = computed(() =>
  summary.value
    ? parseMoneyString(summary.value.totals?.totalActual)
    : 0,
)

const totalRemaining = computed(
  () => totalAllocated.value - totalActual.value,
)

const overallRatio = computed(() => {
  if (totalAllocated.value <= 0) return 0
  return totalActual.value / totalAllocated.value
})

/** Persentase tampil (boleh di atas 100% jika over budget agregat) */
const overallDisplayPercent = computed(() =>
  totalAllocated.value <= 0
    ? 0
    : Math.round(overallRatio.value * 1000) / 10,
)

const overallBarWidth = computed(() =>
  Math.min(100, overallRatio.value * 100),
)

/**
 * Warna progres per rentang ~25%: 0–24, 25–49, 50–74, 75–99, 100% penuh, over (>100 / melewati)
 */
function progressBucket(percent, isOver) {
  if (percent == null || Number.isNaN(percent)) return 'muted'
  if (isOver || percent > 100) return 'over'
  if (percent >= 100) return 'p100'
  if (percent >= 75) return 'p75'
  if (percent >= 50) return 'p50'
  if (percent >= 25) return 'p25'
  return 'p0'
}

const mainOverBudget = computed(
  () =>
    totalAllocated.value > 0 && totalActual.value > totalAllocated.value,
)

const mainCardSemantic = computed(() =>
  progressBucket(overallDisplayPercent.value, mainOverBudget.value),
)

const mainBarClass = computed(() => barGradientForBucket(mainCardSemantic.value))

const mainPercentTextClass = computed(() => {
  const b = mainCardSemantic.value
  if (b === 'over') return 'text-negative'
  if (b === 'p100') return 'text-ds-orange-200'
  if (b === 'p75') return 'text-ds-orange-300'
  if (b === 'p50') return 'text-amber-400'
  if (b === 'p25') return 'text-cyan-400'
  if (b === 'p0') return 'text-emerald-400'
  if (b === 'muted') return 'text-text-tertiary'
  return 'text-text-primary'
})

function barGradientForBucket(bucket) {
  switch (bucket) {
    case 'over':
      return 'from-negative to-[#B91C1C]'
    case 'p100':
      return 'from-amber-600 to-ds-orange-200'
    case 'p75':
      return 'from-orange-500 to-ds-orange-300'
    case 'p50':
      return 'from-amber-500 to-amber-600'
    case 'p25':
      return 'from-cyan-500 to-teal-600'
    case 'p0':
      return 'from-emerald-500 to-emerald-600'
    case 'muted':
      return 'from-ds-gray-300 to-ds-gray-400'
    default:
      return 'from-ds-gray-300 to-ds-gray-400'
  }
}

function lineBarClassForLine(line) {
  if (!line.hasBudget) return barGradientForBucket('muted')
  return barGradientForBucket(
    progressBucket(line.progressPercent, line.isOverBudget),
  )
}

function lineProgressPercentTextClass(line) {
  if (!line.hasBudget || line.progressPercent == null) return 'text-text-tertiary'
  if (line.isOverBudget) return 'text-negative'
  return percentLabelClass(
    progressBucket(line.progressPercent, line.isOverBudget),
  )
}

function percentLabelClass(bucket) {
  switch (bucket) {
    case 'p100':
      return 'text-ds-orange-200'
    case 'p75':
      return 'text-ds-orange-300'
    case 'p50':
      return 'text-amber-400'
    case 'p25':
      return 'text-cyan-400/95'
    case 'p0':
      return 'text-emerald-400/95'
    default:
      return 'text-text-primary'
  }
}

/** Sisa budget per kategori (API: remaining = allocated − actual) */
function lineRemainingIdr(line) {
  if (!line.hasBudget) return null
  if (line.remaining != null && line.remaining !== '') {
    return parseMoneyString(line.remaining)
  }
  return (
    parseMoneyString(line.allocatedAmount) - parseMoneyString(line.actualAmount)
  )
}

function remainingAmountClass(line) {
  const r = lineRemainingIdr(line)
  if (r == null) return 'text-text-primary'
  if (r < 0) return 'text-negative'
  if (r === 0) return 'text-text-tertiary'
  return 'text-positive'
}

function lineBarWidth(line) {
  if (!line.hasBudget) return 0
  const p = line.progressPercent
  if (p == null) return 0
  return Math.min(100, p)
}

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

async function loadBudgetItemsPage(page) {
  const { data } = await getBudgetItems(year.value, month.value, {
    page,
    limit: ITEMS_PAGE_SIZE,
  })
  budgetItems.value = data.items ?? []
  const pg = data.pagination ?? {}
  itemsPagination.value = {
    page: pg.page ?? page,
    limit: pg.limit ?? ITEMS_PAGE_SIZE,
    total: pg.total ?? 0,
    totalPages: pg.totalPages ?? 0,
  }
  itemsPage.value = itemsPagination.value.page
}

async function fetchAllBudgetLinesForModal() {
  const limit = 100
  let page = 1
  let totalPages = 1
  const all = []
  while (page <= totalPages) {
    const { data } = await getBudgetItems(year.value, month.value, {
      page,
      limit,
    })
    const batch = data.items ?? []
    all.push(...batch)
    totalPages = data.pagination?.totalPages ?? 1
    page += 1
  }
  return all
}

async function load() {
  loading.value = true
  error.value = ''
  itemsError.value = ''
  itemsPage.value = 1
  summary.value = null
  budgetItems.value = []
  itemsPagination.value = {
    page: 1,
    limit: ITEMS_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }

  try {
    const { data } = await getBudgetSummary(year.value, month.value)
    summary.value = data
  } catch (e) {
    error.value =
      e?.response?.data?.message || 'Gagal memuat data budget.'
    summary.value = null
    return
  }

  try {
    await loadBudgetItemsPage(1)
  } catch (e) {
    itemsError.value =
      e?.response?.data?.message || 'Gagal memuat daftar per kategori.'
    budgetItems.value = []
  } finally {
    loading.value = false
  }
}

async function goBudgetItemsPage(p) {
  const max = itemsPagination.value.totalPages || 1
  if (p < 1 || p > max) return
  itemsRefetching.value = true
  itemsError.value = ''
  try {
    await loadBudgetItemsPage(p)
  } catch (e) {
    itemsError.value =
      e?.response?.data?.message || 'Gagal memuat daftar per kategori.'
    budgetItems.value = []
  } finally {
    itemsRefetching.value = false
  }
}

watch([year, month], load, { immediate: true })

function openModal() {
  modalError.value = ''
  modalLinesLoading.value = true
  modalOpen.value = true
  modalBudgetLines.value = []
  fetchAllBudgetLinesForModal()
    .then((lines) => {
      modalBudgetLines.value = lines
    })
    .catch((e) => {
      const msg =
        e?.response?.data?.message ||
        'Gagal memuat kategori untuk form budget.'
      modalError.value = msg
      toast.error(msg)
    })
    .finally(() => {
      modalLinesLoading.value = false
    })
}

function closeModal() {
  if (modalSubmitting.value) return
  modalOpen.value = false
  modalBudgetLines.value = []
}

async function onModalSubmit(body) {
  modalError.value = ''
  modalSubmitting.value = true
  try {
    await putBudget(body)
    toast.success('Budget berhasil disimpan.')
    modalOpen.value = false
    await load()
  } catch (e) {
    const msg =
      e?.response?.data?.message || 'Gagal menyimpan budget.'
    modalError.value = msg
    toast.error(msg)
  } finally {
    modalSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- SECTION 1: Header + summary -->
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div
          class="inline-flex h-9 items-stretch overflow-hidden rounded-[10px] border border-border-default bg-ds-black-400/70 shadow-card-default"
        >
          <button
            type="button"
            class="px-2.5 text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
            :disabled="loading"
            aria-label="Bulan sebelumnya"
            @click="shiftMonth(-1)"
          >
            <ChevronLeft :size="18" :stroke-width="2" />
          </button>
          <div
            class="flex min-w-0 items-center justify-center gap-1.5 border-x border-border-default bg-ds-black-200/40 px-3"
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
            <ChevronRight :size="18" :stroke-width="2" />
          </button>
        </div>
      </div>

      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"
      >
        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          :disabled="loading || !summary"
          @click="openModal"
        >
          <Plus :size="18" :stroke-width="2" />
          {{ hasBudgetRecord ? 'Edit budget' : 'Tambah budget' }}
        </button>
      </div>
    </div>

    <div
      v-if="summary && !loading"
      class="grid gap-3 sm:grid-cols-3"
    >
      <div
        class="rounded-[14px] border border-border-default bg-background-surface/90 px-4 py-3 shadow-card-default"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Total dianggarkan
        </p>
        <p class="mt-1.5 text-[20px] font-semibold tabular-nums text-text-primary">
          {{ formatIdrId(totalAllocated) }}
        </p>
      </div>
      <div
        class="rounded-[14px] border border-border-default bg-background-surface/90 px-4 py-3 shadow-card-default"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Terpakai
        </p>
        <p class="mt-1.5 text-[20px] font-semibold tabular-nums text-text-primary">
          {{ formatIdrId(totalActual) }}
        </p>
      </div>
      <div
        class="rounded-[14px] border border-border-default bg-background-surface/90 px-4 py-3 shadow-card-default"
        :class="
          totalRemaining < 0
            ? 'border-negative/30 bg-negative/5'
            : ''
        "
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Sisa
        </p>
        <p
          class="mt-1.5 text-[20px] font-semibold tabular-nums"
          :class="totalRemaining < 0 ? 'text-negative' : 'text-text-primary'"
        >
          {{ formatIdrId(totalRemaining) }}
        </p>
      </div>
    </div>

    <div
      v-if="error"
      role="alert"
      class="flex flex-col gap-2 rounded-[14px] border border-negative/40 bg-negative/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-[13px] text-negative">
        {{ error }}
      </p>
      <button
        type="button"
        class="shrink-0 self-start rounded-[10px] border border-negative/40 bg-negative/15 px-3 py-1.5 text-[12px] font-medium text-negative hover:bg-negative/25 sm:self-auto"
        @click="load"
      >
        Coba lagi
      </button>
    </div>

    <div
      v-if="loading"
      class="flex min-h-[220px] items-center justify-center rounded-[14px] border border-border-default bg-ds-black-300/50 py-20"
    >
      <p class="text-[13px] text-text-tertiary">Memuat budget…</p>
    </div>

    <template v-else-if="summary && !error">
      <!-- SECTION 2: Hero card -->
      <div
        class="rounded-[14px] border border-border-default bg-ds-black-300/60 p-5 shadow-card-elevated sm:p-6"
      >
        <p class="text-[12px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
          Budget usage (bulan ini)
        </p>
        <p class="mt-1 text-[22px] font-semibold text-text-primary">
          {{ monthLabel }}
        </p>
        <div
          v-if="totalAllocated > 0"
          class="mt-4"
        >
          <div class="mb-2 flex items-end justify-between gap-2">
            <p
              class="text-[28px] font-bold tabular-nums leading-none sm:text-[32px]"
              :class="mainPercentTextClass"
            >
              {{ overallDisplayPercent }}%
            </p>
            <p class="text-right text-body-sm text-text-secondary">
              <span class="font-mono font-semibold text-text-primary">{{
                formatIdrShort(totalActual)
              }}</span>
              <span class="text-text-tertiary"> / </span>
              <span class="font-mono font-semibold text-text-primary">{{
                formatIdrShort(totalAllocated)
              }}</span>
              <span class="block text-[11px] text-text-tertiary"
                >terpakai / dianggarkan</span
              >
            </p>
          </div>
          <div
            class="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
          >
            <div
              class="h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out"
              :class="mainBarClass"
              :style="{ width: `${overallBarWidth}%` }"
            />
          </div>
        </div>
        <div
          v-else
          class="mt-4 rounded-[10px] border border-dashed border-border-default bg-background-overlay/60 px-4 py-5 text-center"
        >
          <p class="text-body-sm text-text-secondary">
            Belum ada alokasi untuk bulan ini. Klik
            <span class="font-medium text-text-primary">Tambah budget</span>
            untuk memulai.
          </p>
        </div>
      </div>

      <!-- SECTION 3: per category -->
      <div>
        <h2 class="text-[16px] font-semibold text-text-primary">
          Per kategori
        </h2>
        <p
          v-if="itemsRangeLabel"
          class="mt-1 text-[12px] text-text-tertiary"
        >
          {{ itemsRangeLabel }}
        </p>
        <div
          v-if="itemsError"
          role="alert"
          class="mt-3 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
        >
          {{ itemsError }}
        </div>
        <div
          class="relative mt-4"
          :class="itemsRefetching ? 'opacity-60' : ''"
        >
          <div
            v-if="itemsRefetching"
            class="pointer-events-none absolute inset-0 z-[1] flex items-start justify-center pt-12"
          >
            <Loader2
              class="h-8 w-8 animate-spin text-accent-primary"
              :stroke-width="2"
            />
          </div>
          <ul
            v-if="budgetItems.length"
            class="space-y-3"
          >
            <li
              v-for="line in budgetItems"
              :key="line.category.id"
              class="rounded-[14px] border border-border-default bg-background-surface/85 p-4 shadow-card-default"
              :class="
                line.isOverBudget
                  ? 'border-negative/25 bg-negative/[0.04]'
                  : ''
              "
            >
            <div class="flex items-start gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-ds-black-200/90"
                :style="{
                  boxShadow: line.category.color
                    ? `0 0 0 1px ${line.category.color}40, 0 0 24px ${line.category.color}15`
                    : undefined,
                }"
              >
                <CategoryIcon
                  :icon-name="line.category.icon || 'Tag'"
                  :color="line.category.color || '#FFFFFF'"
                  :size="22"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <h3
                    class="text-[16px] font-semibold text-text-primary"
                  >
                    {{ line.category.name }}
                  </h3>
                  <div
                    v-if="!line.hasBudget"
                    class="shrink-0 text-[12px] font-medium text-text-tertiary"
                  >
                    Belum dianggarkan
                  </div>
                  <div
                    v-else
                    class="shrink-0 text-right"
                  >
                    <span
                      class="text-[15px] font-semibold tabular-nums"
                      :class="lineProgressPercentTextClass(line)"
                    >
                      {{ line.progressPercent != null
                        ? `${line.progressPercent}%`
                        : '—' }}
                    </span>
                    <span
                      v-if="line.isOverBudget"
                      class="ml-1.5 inline-flex items-center text-negative"
                      title="Melewati anggaran"
                    >
                      <AlertTriangle
                        :size="16"
                        :stroke-width="2"
                        class="inline"
                      />
                    </span>
                  </div>
                </div>
                <div
                  class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-body-sm"
                >
                  <span class="text-text-secondary">
                    Alokasi:
                    <span class="font-mono text-text-primary tabular-nums">
                      {{ line.hasBudget
                        ? formatIdrId(parseMoneyString(line.allocatedAmount))
                        : '—' }}
                    </span>
                  </span>
                  <span class="text-text-secondary">
                    Aktual:
                    <span class="font-mono text-text-primary tabular-nums">
                      {{ formatIdrId(parseMoneyString(line.actualAmount)) }}
                    </span>
                  </span>
                  <span
                    v-if="line.hasBudget"
                    class="text-text-secondary"
                  >
                    Sisa:
                    <span
                      class="font-mono font-medium tabular-nums"
                      :class="remainingAmountClass(line)"
                    >
                      {{ formatIdrId(lineRemainingIdr(line) ?? 0) }}
                    </span>
                  </span>
                </div>
                <div
                  v-if="line.hasBudget"
                  class="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]"
                >
                  <div
                    class="h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out"
                    :class="lineBarClassForLine(line)"
                    :style="{
                      width: `${lineBarWidth(line)}%`,
                    }"
                  />
                </div>
                <p
                  v-else
                  class="mt-2 text-[12px] text-text-tertiary"
                >
                  Alokasikan dana di
                  <button
                    type="button"
                    class="font-medium text-accent-primary hover:underline"
                    @click="openModal"
                  >
                    form budget
                  </button>
                </p>
              </div>
            </div>
          </li>
          </ul>
          <p
            v-else-if="!itemsError"
            class="rounded-[14px] border border-dashed border-border-default px-4 py-8 text-center text-[13px] text-text-tertiary"
          >
            Tidak ada baris untuk ditampilkan.
          </p>
        </div>
        <div
          v-if="itemsPagination.totalPages > 1"
          class="mt-4 flex flex-col items-stretch gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-center text-[12px] text-text-tertiary sm:text-left">
            Halaman
            <span class="font-mono tabular-nums text-text-secondary">{{
              itemsPage
            }}</span>
            /
            <span class="font-mono tabular-nums text-text-secondary">{{
              itemsPagination.totalPages
            }}</span>
          </p>
          <div class="flex items-center justify-center gap-2">
            <button
              type="button"
              class="rounded-[10px] border border-border-default bg-ds-black-400/80 px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-white/15 hover:bg-ds-black-400 disabled:cursor-not-allowed disabled:opacity-35"
              :disabled="itemsPage <= 1 || itemsRefetching"
              @click="goBudgetItemsPage(itemsPage - 1)"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              class="rounded-[10px] border border-border-default bg-ds-black-400/80 px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-white/15 hover:bg-ds-black-400 disabled:cursor-not-allowed disabled:opacity-35"
              :disabled="
                itemsPage >= itemsPagination.totalPages || itemsRefetching
              "
              @click="goBudgetItemsPage(itemsPage + 1)"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

    </template>

    <BudgetFormModal
      :open="modalOpen"
      :year="year"
      :month="month"
      :summary="summary"
      :item-lines="modalBudgetLines"
      :lines-loading="modalLinesLoading"
      :submitting="modalSubmitting"
      :api-error="modalError"
      @close="closeModal"
      @submit="onModalSubmit"
    />
  </div>
</template>
