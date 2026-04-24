<script setup>
import { computed, ref, watch } from 'vue'

import {
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  PenLine,
  Plus,
} from 'lucide-vue-next'

import BudgetFormModal from '@/components/budget/BudgetFormModal.vue'
import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { deleteBudget, getBudgetSummary, putBudget } from '@/services/budgets'
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

const modalOpen = ref(false)
const modalSubmitting = ref(false)
const modalError = ref('')

const deleteOpen = ref(false)
const deleteLoading = ref(false)

const monthLabel = computed(() => {
  const m = month.value
  if (m < 1 || m > 12) return '—'
  return `${MONTH_ID[m - 1]} ${year.value}`
})

const hasBudgetRecord = computed(() => summary.value && summary.value.budget)

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

const mainCardSemantic = computed(() => {
  const p = overallRatio.value * 100
  if (p >= 100) return 'danger'
  if (p >= 70) return 'warning'
  return 'normal'
})

const mainBarClass = computed(() => {
  if (mainCardSemantic.value === 'danger') return 'from-negative to-[#B91C1C]'
  if (mainCardSemantic.value === 'warning') {
    return 'from-amber-500 to-amber-600'
  }
  return 'from-accent-primary to-ds-orange-300'
})

function lineRowSemantic(progressPercent) {
  if (progressPercent == null) return 'muted'
  if (progressPercent >= 100) return 'danger'
  if (progressPercent >= 70) return 'warning'
  return 'normal'
}

function lineBarClass(semantic) {
  if (semantic === 'danger') return 'from-negative to-[#B91C1C]'
  if (semantic === 'warning') return 'from-amber-500 to-amber-600'
  if (semantic === 'muted') return 'from-ds-gray-300 to-ds-gray-400'
  return 'from-accent-primary to-ds-orange-300'
}

function lineBarWidth(line) {
  if (!line.hasBudget) return 0
  const p = line.progressPercent
  if (p == null) return 0
  return Math.min(100, p)
}

const insights = computed(() => {
  if (!summary.value) return []
  const lines = summary.value.items || []
  const out = []
  const totalA = totalActual.value
  const totalAll = totalAllocated.value
  const rem = totalRemaining.value

  for (const line of lines) {
    if (line.isOverBudget && line.hasBudget) {
      const a = parseMoneyString(line.actualAmount)
      const b = parseMoneyString(line.allocatedAmount)
      const over = a - b
      if (over > 0) {
        out.push({
          key: `over-${line.category.id}`,
          text: `Kamu over budget di ${line.category.name} (lebih ${formatIdrId(over)} dari rencana)`,
        })
      }
    }
  }

  if (lines.length && totalA > 0) {
    let maxA = -1
    let maxLine = null
    for (const line of lines) {
      const a = parseMoneyString(line.actualAmount)
      if (a > maxA) {
        maxA = a
        maxLine = line
      }
    }
    if (maxLine) {
      const pct = Math.round((maxA / totalA) * 100)
      out.push({
        key: 'largest',
        text: `Pengeluaran terbesar: ${maxLine.category.name} (${pct}%)`,
      })
    }
  }

  if (isViewingCurrentMonth() && rem > 0 && totalA > 0 && totalAll > 0) {
    const d = new Date()
    const dayOfMonth = d.getDate()
    const daily = totalA / dayOfMonth
    if (daily > 0) {
      const est = Math.floor(rem / daily)
      if (est > 0 && est < 500) {
        out.push({
          key: 'days',
          text: `Sisa budget cukup untuk sekitar ${est} hari (perkiraan dari laju pengeluaran bulan ini)`,
        })
      }
    }
  }

  if (!out.length) {
    out.push({
      key: 'empty',
      text:
        'Tambah alokasi per kategori untuk mendapat saran keuangan yang lebih jelas.',
    })
  }

  return out
})

function isViewingCurrentMonth() {
  const d = new Date()
  return d.getFullYear() === year.value && d.getMonth() + 1 === month.value
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

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await getBudgetSummary(year.value, month.value)
    summary.value = data
  } catch (e) {
    error.value =
      e?.response?.data?.message || 'Gagal memuat data budget.'
    summary.value = null
  } finally {
    loading.value = false
  }
}

watch([year, month], load, { immediate: true })

function openModal() {
  modalError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (modalSubmitting.value) return
  modalOpen.value = false
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

function requestDelete() {
  if (!summary.value?.budget?.id) return
  deleteOpen.value = true
}

function closeDelete() {
  if (deleteLoading.value) return
  deleteOpen.value = false
}

async function confirmDelete() {
  const id = summary.value?.budget?.id
  if (!id) return
  deleteLoading.value = true
  try {
    await deleteBudget(id)
    deleteOpen.value = false
    toast.success('Budget bulan ini dihapus.')
    await load()
  } catch (e) {
    const msg =
      e?.response?.data?.message || 'Gagal menghapus budget.'
    toast.error(msg)
  } finally {
    deleteLoading.value = false
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
              :class="
                mainCardSemantic === 'danger'
                  ? 'text-negative'
                  : 'text-text-primary'
              "
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
        <p class="mt-0.5 text-body-sm text-text-secondary">
          Bandingkan anggaran dengan pengeluaran aktual. Over budget
          diberi tanda.
        </p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="line in summary.items"
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
                  :icon-name="line.category.icon"
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
                      :class="
                        line.isOverBudget
                          ? 'text-negative'
                          : 'text-text-primary'
                      "
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
                </div>
                <div
                  v-if="line.hasBudget"
                  class="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]"
                >
                  <div
                    class="h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out"
                    :class="
                      lineBarClass(
                        lineRowSemantic(line.progressPercent),
                      )
                    "
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
      </div>

      <!-- SECTION 4: Insights -->
      <div
        class="rounded-[14px] border border-border-default bg-ds-black-300/40 p-4 shadow-card-default sm:p-5"
      >
        <div class="mb-3 flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border-accent-purple/40 bg-[rgba(138,47,201,0.1)]"
          >
            <Lightbulb
              :size="18"
              :stroke-width="2"
              class="text-ds-purple-400"
            />
          </div>
          <h2 class="text-[16px] font-semibold text-text-primary">
            Insight
          </h2>
        </div>
        <ul class="space-y-2.5 text-body-sm text-text-secondary">
          <li
            v-for="row in insights"
            :key="row.key"
            class="flex gap-2 border-l-2 pl-3"
            :class="
              row.key.startsWith('over')
                ? 'border-amber-500/70'
                : 'border-ds-gray-200/30'
            "
          >
            <span class="text-text-tertiary" aria-hidden="true">•</span>
            <span class="min-w-0 flex-1 leading-relaxed">{{
              row.text
            }}</span>
          </li>
        </ul>
      </div>

      <!-- SECTION 5: Action area -->
      <div
        class="flex flex-col gap-3 rounded-[14px] border border-white/[0.08] bg-background-overlay/50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-[15px] font-medium text-text-primary">
            Aksi budget
          </p>
          <p class="mt-0.5 text-body-sm text-text-secondary">
            Atur alokasi bulanan atau batalkan budget.
          </p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border-default bg-ds-black-400/80 px-4 py-2.5 text-[13px] font-medium text-text-primary transition-colors hover:border-border-accent-orange hover:bg-ds-black-400"
            @click="openModal"
          >
            <PenLine
              :size="16"
              :stroke-width="2"
            />
            {{ hasBudgetRecord ? 'Edit' : 'Tambah' }} budget
          </button>
          <button
            v-if="hasBudgetRecord"
            type="button"
            class="inline-flex items-center justify-center rounded-[10px] border border-negative/30 bg-negative/10 px-4 py-2.5 text-[13px] font-medium text-negative transition-colors hover:bg-negative/20"
            @click="requestDelete"
          >
            Hapus budget
          </button>
        </div>
      </div>
    </template>

    <BudgetFormModal
      :open="modalOpen"
      :year="year"
      :month="month"
      :summary="summary"
      :submitting="modalSubmitting"
      :api-error="modalError"
      @close="closeModal"
      @submit="onModalSubmit"
    />

    <ConfirmDialog
      :open="deleteOpen"
      title="Hapus budget bulan ini?"
      message="Alokasi untuk bulan yang dipilih akan dihapus. Data transaksi tidak berubah."
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="deleteLoading"
      @close="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
