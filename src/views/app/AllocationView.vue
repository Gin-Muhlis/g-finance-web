<script setup>
import { computed, ref } from 'vue'

import {
  ArrowRight,
  Loader2,
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-vue-next'

import AllocationTransferModal from '@/components/allocations/AllocationTransferModal.vue'
import BucketFormModal from '@/components/allocations/BucketFormModal.vue'
import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import {
  createAllocation,
  getAllocationSummary,
  listAllocations,
} from '@/services/allocations'
import {
  createBucket,
  deleteBucket,
  listBuckets,
  updateBucket,
} from '@/services/buckets'
import { listWallets } from '@/services/wallets'
import { useToastStore } from '@/stores/toast'
import { formatIdrId, parseMoneyString } from '@/utils/moneyFormat.js'

const toast = useToastStore()

const summary = ref(null)
const buckets = ref([])
const wallets = ref([])
const historyRows = ref([])

const loading = ref(false)
const error = ref('')

const bucketModalOpen = ref(false)
const bucketModalMode = ref('create')
const bucketEditing = ref(null)
const bucketSubmitting = ref(false)
const bucketApiError = ref('')

const transferOpen = ref(false)
const transferSubmitting = ref(false)
const transferApiError = ref('')
const transferDefaults = ref({
  bucketId: '',
  fromWalletId: '',
  toWalletId: '',
})

const deleteBucketOpen = ref(false)
const deleteBucketLoading = ref(false)
const bucketPendingDelete = ref(null)

const historyFilterBucketId = ref('')
const historyDateFrom = ref('')
const historyDateTo = ref('')

const totalBalanceNum = computed(() => {
  const s = summary.value
  if (!s) return 0
  const n = s.totalBalance
  return n == null ? 0 : Number(n)
})

const totalAllocatedNum = computed(() => {
  const s = summary.value
  if (!s) return 0
  const n = s.totalAllocated
  return n == null ? 0 : Number(n)
})

const availableNum = computed(() => {
  const s = summary.value
  if (!s) return 0
  const n = s.available
  return n == null ? 0 : Number(n)
})

const availableLow = computed(() => {
  if (totalBalanceNum.value <= 0) return false
  const ratio = availableNum.value / totalBalanceNum.value
  return ratio > 0 && ratio < 0.1
})

const sortedBuckets = computed(() => {
  const list = [...buckets.value]
  list.sort((a, b) => {
    const ba = parseMoneyString(a.balance)
    const bb = parseMoneyString(b.balance)
    if (bb !== ba) return bb - ba
    const pa = bucketProgressPercent(a)
    const pb = bucketProgressPercent(b)
    return (pb ?? 0) - (pa ?? 0)
  })
  return list
})

function bucketProgressPercent(bucket) {
  const t = parseMoneyString(bucket.targetAmount)
  if (t <= 0) return null
  const bal = parseMoneyString(bucket.balance)
  return Math.min(999, Math.round((bal / t) * 1000) / 10)
}

function bucketBarWidth(bucket) {
  const p = bucketProgressPercent(bucket)
  if (p == null) return 0
  return Math.min(100, p)
}

function bucketCardClass(bucket) {
  const bal = parseMoneyString(bucket.balance)
  const p = bucketProgressPercent(bucket)
  if (bal <= 0) {
    return 'border-dashed border-border-default bg-background-overlay/40'
  }
  if (p != null && p >= 85) {
    return 'border-ds-orange-200/35 bg-[rgba(255,85,0,0.06)]'
  }
  return ''
}

function bucketBarGradient(bucket) {
  const p = bucketProgressPercent(bucket)
  if (p == null) return 'from-ds-gray-300 to-ds-gray-400'
  if (p >= 100) return 'from-negative to-[#B91C1C]'
  if (p >= 85) return 'from-orange-500 to-ds-orange-300'
  if (p >= 50) return 'from-amber-500 to-amber-600'
  return 'from-emerald-500 to-emerald-600'
}

const filteredHistory = computed(() => {
  let rows = [...historyRows.value]
  if (historyFilterBucketId.value) {
    rows = rows.filter(
      (r) => r.bucket?.id === historyFilterBucketId.value,
    )
  }
  if (historyDateFrom.value) {
    rows = rows.filter(
      (r) => String(r.transactionDate || '') >= historyDateFrom.value,
    )
  }
  if (historyDateTo.value) {
    rows = rows.filter(
      (r) => String(r.transactionDate || '') <= historyDateTo.value,
    )
  }
  return rows
})

function formatHistoryDay(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).split('T')[0].split('-').map(Number)
  if (!y) return iso
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ]
  return `${d} ${months[m - 1] ?? m}`
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [sumRes, bRes, wRes, hRes] = await Promise.all([
      getAllocationSummary(),
      listBuckets(),
      listWallets(),
      listAllocations(),
    ])
    summary.value = sumRes.data ?? null
    const bData = bRes.data
    buckets.value = Array.isArray(bData) ? bData : []
    const wData = wRes.data
    wallets.value = Array.isArray(wData) ? wData : []
    const hData = hRes.data
    historyRows.value = Array.isArray(hData) ? hData : []
  } catch (e) {
    error.value =
      e?.response?.data?.message || 'Gagal memuat data alokasi.'
    summary.value = null
    buckets.value = []
    wallets.value = []
    historyRows.value = []
  } finally {
    loading.value = false
  }
}

const deleteConfirmMessage = computed(() => {
  if (!bucketPendingDelete.value) return ''
  return `Bucket "${bucketPendingDelete.value.name}" akan dihapus.`
})

function openCreateBucket() {
  bucketApiError.value = ''
  bucketModalMode.value = 'create'
  bucketEditing.value = null
  bucketModalOpen.value = true
}

function openEditBucket(b) {
  bucketApiError.value = ''
  bucketModalMode.value = 'edit'
  bucketEditing.value = { ...b }
  bucketModalOpen.value = true
}

function closeBucketModal() {
  if (bucketSubmitting.value) return
  bucketModalOpen.value = false
}

async function onBucketModalSubmit(payload) {
  bucketApiError.value = ''
  bucketSubmitting.value = true
  try {
    const body = {
      name: payload.name,
      type: payload.type,
      targetAmount: payload.targetAmount,
      icon: payload.icon,
      color: payload.color,
    }
    if (payload.mode === 'create') {
      await createBucket(body)
      toast.success('Bucket ditambahkan.')
    } else {
      await updateBucket(payload.bucketId, body)
      toast.success('Bucket diperbarui.')
    }
    bucketModalOpen.value = false
    await loadAll()
  } catch (e) {
    bucketApiError.value =
      e?.response?.data?.message || 'Gagal menyimpan bucket.'
  } finally {
    bucketSubmitting.value = false
  }
}

function requestDeleteBucket(b) {
  bucketPendingDelete.value = b
  deleteBucketOpen.value = true
}

function closeDeleteBucket() {
  if (deleteBucketLoading.value) return
  deleteBucketOpen.value = false
}

async function confirmDeleteBucket() {
  const b = bucketPendingDelete.value
  if (!b?.id) return
  deleteBucketLoading.value = true
  try {
    await deleteBucket(b.id)
    deleteBucketOpen.value = false
    toast.success('Bucket dihapus.')
    await loadAll()
  } catch (e) {
    toast.error(
      e?.response?.data?.message || 'Gagal menghapus bucket.',
    )
  } finally {
    deleteBucketLoading.value = false
  }
}

function openTransferGlobal() {
  transferApiError.value = ''
  transferDefaults.value = { bucketId: '', fromWalletId: '', toWalletId: '' }
  transferOpen.value = true
}

function openTransferForBucket(b) {
  transferApiError.value = ''
  transferDefaults.value = {
    bucketId: b.id,
    fromWalletId: '',
    toWalletId: '',
  }
  transferOpen.value = true
}

function closeTransfer() {
  if (transferSubmitting.value) return
  transferOpen.value = false
}

async function onTransferSubmit(body) {
  transferApiError.value = ''
  transferSubmitting.value = true
  try {
    await createAllocation(body)
    toast.success('Alokasi berhasil.')
    transferOpen.value = false
    await loadAll()
  } catch (e) {
    transferApiError.value =
      e?.response?.data?.message || 'Gagal menjalankan alokasi.'
  } finally {
    transferSubmitting.value = false
  }
}

loadAll()
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Header -->
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    >
      <div class="min-w-0">
        <h1 class="text-[22px] font-semibold tracking-[-0.02em] text-text-primary sm:text-[24px]">
          Kelola Alokasi
        </h1>
        <p class="mt-1 max-w-xl text-body-sm text-text-secondary">
          Atur distribusi uang ke tujuan seperti tabungan dan dana darurat
          (bucket) lewat transfer antar dompet.
        </p>
      </div>
      <div
        class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
      >
        <button
          type="button"
          class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] border border-border-default bg-ds-black-400/80 px-4 py-2.5 text-[14px] font-medium text-text-primary transition-colors hover:border-border-accent-orange hover:bg-ds-black-400 sm:w-auto"
          :disabled="loading"
          @click="openCreateBucket"
        >
          <Plus
            :size="18"
            :stroke-width="2"
          />
          Tambah bucket
        </button>
        <button
          type="button"
          class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:opacity-40 sm:w-auto"
          :disabled="loading || !buckets.length"
          @click="openTransferGlobal"
        >
          <PiggyBank
            :size="18"
            :stroke-width="2"
          />
          Alokasikan dana
        </button>
      </div>
    </div>

    <!-- 2. Summary -->
    <div
      v-if="error"
      class="rounded-[14px] border border-negative/40 bg-negative/10 px-4 py-3 text-[13px] text-negative"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!loading && summary"
      class="grid gap-3 sm:grid-cols-3"
    >
      <div
        class="rounded-[14px] border border-border-default bg-background-surface/90 px-4 py-3 shadow-card-default"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Total saldo
        </p>
        <p class="mt-1.5 text-[20px] font-semibold tabular-nums text-text-primary">
          {{ formatIdrId(totalBalanceNum) }}
        </p>
        <p class="mt-0.5 text-[11px] text-text-tertiary">
          Semua dompet
        </p>
      </div>
      <div
        class="rounded-[14px] border border-border-default bg-background-surface/90 px-4 py-3 shadow-card-default"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Total dialokasikan
        </p>
        <p class="mt-1.5 text-[20px] font-semibold tabular-nums text-text-primary">
          {{ formatIdrId(totalAllocatedNum) }}
        </p>
        <p class="mt-0.5 text-[11px] text-text-tertiary">
          Ke bucket
        </p>
      </div>
      <div
        class="rounded-[14px] border px-4 py-3 shadow-card-default"
        :class="
          availableLow
            ? 'border-amber-500/45 bg-amber-500/[0.08]'
            : 'border-positive/25 bg-background-surface/90'
        "
      >
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.08em]"
          :class="availableLow ? 'text-amber-200/90' : 'text-text-tertiary'"
        >
          Sisa bisa dialokasikan
        </p>
        <p
          class="mt-1.5 text-[20px] font-semibold tabular-nums"
          :class="
            availableLow
              ? 'text-amber-300'
              : availableNum >= 0
                ? 'text-positive'
                : 'text-negative'
          "
        >
          {{ formatIdrId(availableNum) }}
        </p>
        <p
          class="mt-0.5 text-[11px]"
          :class="availableLow ? 'text-amber-200/70' : 'text-text-tertiary'"
        >
          {{
            availableLow
              ? 'Sisa menipis — pertimbangkan mengalokasikan lebih sedikit.'
              : 'Saldo − teralokasi'
          }}
        </p>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex min-h-[160px] items-center justify-center gap-2 rounded-[14px] border border-border-default bg-background-overlay py-12 text-text-secondary"
    >
      <Loader2
        class="h-5 w-5 animate-spin"
        :stroke-width="2"
      />
      <span class="text-[13px]">Memuat…</span>
    </div>

    <template v-else-if="!error">
      <!-- Mobile sticky CTA -->
      <div
        class="fixed bottom-0 left-0 right-0 z-30 border-t border-border-default bg-ds-black-300/95 p-3 backdrop-blur-md lg:hidden"
      >
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-4 py-3 text-[14px] font-semibold text-white shadow-button-orange disabled:opacity-40"
          :disabled="!buckets.length"
          @click="openTransferGlobal"
        >
          <PiggyBank
            :size="18"
            :stroke-width="2"
          />
          Alokasikan dana
        </button>
      </div>

      <div
        class="grid gap-6 pb-20 lg:grid-cols-2 lg:items-start lg:gap-8 lg:pb-0"
      >
        <!-- Bucket list -->
        <section>
          <h2 class="text-[16px] font-semibold text-text-primary">
            Bucket
          </h2>
          <p class="mt-0.5 text-body-sm text-text-secondary">
            Tujuan pengelompokan dana. Diurutkan saldo terbesar.
          </p>
          <ul class="mt-4 space-y-3">
            <li
              v-if="!sortedBuckets.length"
              class="rounded-[14px] border border-dashed border-border-default bg-background-overlay px-4 py-8 text-center text-body-sm text-text-tertiary"
            >
              Belum ada bucket. Tambah untuk memulai.
            </li>
            <li
              v-for="b in sortedBuckets"
              :key="b.id"
              class="rounded-[14px] border border-border-default bg-background-surface/85 p-4 shadow-card-default"
              :class="bucketCardClass(b)"
            >
              <div class="flex items-start gap-3">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-ds-black-200/90"
                >
                  <CategoryIcon
                    :icon-name="b.icon"
                    :color="b.color || '#FF5500'"
                    :size="22"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-[16px] font-semibold text-text-primary">
                    {{ b.name }}
                  </h3>
                  <p class="mt-0.5 text-body-sm text-text-secondary">
                    Saldo bucket:
                    <span class="font-mono font-medium tabular-nums text-text-primary">
                      {{ formatIdrId(parseMoneyString(b.balance)) }}
                    </span>
                  </p>
                  <p
                    v-if="b.targetAmount != null && String(b.targetAmount) !== ''"
                    class="text-[12px] text-text-tertiary"
                  >
                    Target: {{ formatIdrId(parseMoneyString(b.targetAmount)) }}
                    <span
                      v-if="bucketProgressPercent(b) != null"
                      class="ml-1 tabular-nums text-text-secondary"
                    >
                      ({{ bucketProgressPercent(b) }}%)
                    </span>
                  </p>
                  <div
                    v-if="b.targetAmount != null && String(b.targetAmount) !== ''"
                    class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]"
                  >
                    <div
                      class="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                      :class="bucketBarGradient(b)"
                      :style="{ width: `${bucketBarWidth(b)}%` }"
                    />
                  </div>
                </div>
              </div>
              <div
                class="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-3"
              >
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-[8px] border border-border-default bg-ds-black-400/50 px-3 py-1.5 text-[12px] font-medium text-text-primary transition-colors hover:border-border-accent-orange"
                  :disabled="!buckets.length"
                  @click="openTransferForBucket(b)"
                >
                  <Plus
                    :size="14"
                    :stroke-width="2"
                  />
                  Tambah alokasi
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-[8px] border border-border-default px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-text-primary"
                  @click="openEditBucket(b)"
                >
                  <Pencil
                    :size="14"
                    :stroke-width="2"
                  />
                  Edit
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-[8px] border border-negative/30 px-3 py-1.5 text-[12px] font-medium text-negative transition-colors hover:bg-negative/10"
                  @click="requestDeleteBucket(b)"
                >
                  <Trash2
                    :size="14"
                    :stroke-width="2"
                  />
                  Hapus
                </button>
              </div>
            </li>
          </ul>
        </section>

        <!-- History -->
        <section>
          <h2 class="text-[16px] font-semibold text-text-primary">
            Riwayat alokasi
          </h2>
          <p class="mt-0.5 text-body-sm text-text-secondary">
            Pergerakan terbaru. Filter opsional.
          </p>
          <div
            class="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
          >
            <select
              v-model="historyFilterBucketId"
              class="min-h-[40px] flex-1 rounded-input border border-border-default bg-ds-black-400/80 px-3 text-[13px] text-text-primary sm:max-w-[200px]"
            >
              <option value="">
                Semua bucket
              </option>
              <option
                v-for="b in buckets"
                :key="b.id"
                :value="b.id"
              >
                {{ b.name }}
              </option>
            </select>
            <input
              v-model="historyDateFrom"
              type="date"
              class="min-h-[40px] rounded-input border border-border-default bg-ds-black-400/80 px-2 text-[13px] text-text-primary [color-scheme:dark]"
            >
            <input
              v-model="historyDateTo"
              type="date"
              class="min-h-[40px] rounded-input border border-border-default bg-ds-black-400/80 px-2 text-[13px] text-text-primary [color-scheme:dark]"
            >
          </div>
          <ul class="mt-4 space-y-2">
            <li
              v-if="!filteredHistory.length"
              class="rounded-[14px] border border-dashed border-border-default px-4 py-8 text-center text-[13px] text-text-tertiary"
            >
              Belum ada riwayat.
            </li>
            <li
              v-for="row in filteredHistory"
              :key="row.id"
              class="rounded-[12px] border border-border-default bg-ds-black-300/50 px-3 py-2.5"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-[12px] font-medium text-text-tertiary">
                    {{ formatHistoryDay(row.transactionDate) }}
                    <span
                      v-if="row.isAllocationWithdraw"
                      class="ml-1 inline-block rounded bg-ds-purple-200/20 px-1.5 py-0.5 text-[10px] text-ds-purple-400"
                    >
                      Tarik
                    </span>
                    <span
                      v-else
                      class="ml-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-text-tertiary"
                    >
                      Alokasi
                    </span>
                  </p>
                  <p class="mt-0.5 flex flex-wrap items-center gap-1 text-[13px] text-text-primary">
                    <span class="truncate font-medium">
                      {{ row.fromWallet?.name || '—' }}
                    </span>
                    <ArrowRight
                      :size="14"
                      class="shrink-0 text-text-tertiary"
                    />
                    <span class="truncate font-medium">
                      {{ row.toWallet?.name || '—' }}
                    </span>
                  </p>
                  <p class="text-[12px] text-text-tertiary">
                    {{ row.bucket?.name || '—' }}
                  </p>
                </div>
                <p
                  class="shrink-0 text-right text-[15px] font-semibold tabular-nums"
                  :class="row.isAllocationWithdraw ? 'text-ds-purple-400' : 'text-positive'"
                >
                  {{ row.isAllocationWithdraw ? '−' : '+'
                  }}{{ formatIdrId(Math.abs(parseMoneyString(row.amount))) }}
                </p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <BucketFormModal
      :open="bucketModalOpen"
      :mode="bucketModalMode"
      :bucket="bucketEditing"
      :submitting="bucketSubmitting"
      :api-error="bucketApiError"
      @close="closeBucketModal"
      @submit="onBucketModalSubmit"
    />

    <AllocationTransferModal
      :open="transferOpen"
      :wallets="wallets"
      :buckets="buckets"
      :summary="summary"
      :default-bucket-id="transferDefaults.bucketId"
      :default-from-wallet-id="transferDefaults.fromWalletId"
      :default-to-wallet-id="transferDefaults.toWalletId"
      :submitting="transferSubmitting"
      :api-error="transferApiError"
      @close="closeTransfer"
      @submit="onTransferSubmit"
    />

    <ConfirmDialog
      :open="deleteBucketOpen"
      title="Hapus bucket?"
      :message="deleteConfirmMessage"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="deleteBucketLoading"
      @close="closeDeleteBucket"
      @confirm="confirmDeleteBucket"
    />
  </div>
</template>
