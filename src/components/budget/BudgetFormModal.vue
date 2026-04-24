<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'

import { X } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import {
  formatIdrId,
  parseMoneyString,
  toApiMoneyString,
} from '@/utils/moneyFormat.js'

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

const props = defineProps({
  open: { type: Boolean, default: false },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  summary: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  apiError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const totalBudgetInput = ref('')
const allocationById = reactive({})
const errorMessage = ref('')

const title = computed(() =>
  props.summary?.budget ? 'Edit budget' : 'Tambah budget',
)

const periodLabel = computed(() => {
  const m = props.month
  if (m >= 1 && m <= 12) {
    return `${MONTH_ID[m - 1]} ${props.year}`
  }
  return '—'
})

function resetState() {
  totalBudgetInput.value = ''
  errorMessage.value = ''
  for (const key of Object.keys(allocationById)) {
    delete allocationById[key]
  }
}

function loadFromSummary() {
  resetState()
  if (!props.summary) return
  const cap = props.summary.budget?.totalBudget
  if (cap != null && String(cap) !== '' && !Number.isNaN(parseFloat(cap))) {
    totalBudgetInput.value = String(
      Math.round(parseFloat(String(cap))),
    )
  }
  for (const line of props.summary.items) {
    const id = line.category.id
    if (line.hasBudget && line.allocatedAmount != null) {
      allocationById[id] = String(
        Math.round(parseFloat(String(line.allocatedAmount))),
      )
    } else {
      allocationById[id] = ''
    }
  }
}

watch(
  () => [props.open, props.summary, props.month, props.year],
  async () => {
    if (!props.open) {
      errorMessage.value = ''
      return
    }
    await nextTick()
    loadFromSummary()
  }
)

function close() {
  if (props.submitting) return
  emit('close')
}

function onSubmit() {
  errorMessage.value = ''
  if (!props.summary) {
    errorMessage.value = 'Data budget belum tersedia.'
    return
  }

  const items = []
  for (const line of props.summary.items) {
    const id = line.category.id
    const raw = allocationById[id]
    const amount = parseMoneyString(raw)
    if (amount > 0) {
      items.push({
        categoryId: id,
        allocatedAmount: toApiMoneyString(amount),
      })
    }
  }

  if (items.length === 0) {
    errorMessage.value = 'Isi alokasi minimal pada satu kategori.'
    return
  }

  const capRaw = totalBudgetInput.value.trim()
  const totalPayload =
    capRaw === '' ? null : toApiMoneyString(parseMoneyString(capRaw))

  emit('submit', {
    year: props.year,
    month: props.month,
    totalBudget: totalPayload,
    items,
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
      :aria-labelledby="'budget-modal-title'"
    >
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="close"
      />
      <div
        class="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-[480px] flex-col rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
        @click.stop
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4"
        >
          <div>
            <h2
              id="budget-modal-title"
              class="text-[18px] font-semibold tracking-[-0.01em] text-text-primary"
            >
              {{ title }}
            </h2>
            <p class="mt-0.5 text-[12px] text-text-tertiary">
              {{ periodLabel }}
            </p>
          </div>
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
          <div
            v-if="apiError"
            role="alert"
            class="mb-4 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ apiError }}
          </div>
          <div
            v-if="errorMessage"
            role="alert"
            class="mb-4 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ errorMessage }}
          </div>

          <div v-if="summary" class="space-y-5">
            <div>
              <label
                for="budget-total-cap"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Plafon total (opsional)
              </label>
              <input
                id="budget-total-cap"
                v-model="totalBudgetInput"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="Contoh: 5000000"
                class="w-full rounded-input border border-border-default bg-ds-black-200/80 px-3.5 py-2.5 text-body text-text-primary shadow-card-default outline-none transition-[border-color,box-shadow] duration-180 focus:border-border-accent-orange focus:shadow-input-focus"
              />
              <p class="mt-1.5 text-[12px] text-text-tertiary">
                Batas atas bulanan; alokasi per kategori di bawah.
              </p>
            </div>

            <div>
              <p
                class="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Alokasi per kategori
              </p>
              <ul class="max-h-[min(44vh,360px)] space-y-2.5 overflow-y-auto pr-1">
                <li
                  v-for="line in summary.items"
                  :key="line.category.id"
                  class="flex items-center gap-3 rounded-[10px] border border-border-default bg-ds-black-400/50 px-3 py-2.5"
                >
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-ds-black-200/90"
                    :style="{
                      boxShadow: line.category.color
                        ? `0 0 0 1px ${line.category.color}40`
                        : undefined,
                    }"
                  >
                    <CategoryIcon
                      :icon-name="line.category.icon"
                      :color="line.category.color || '#FFFFFF'"
                      :size="18"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate text-[13px] font-medium text-text-primary"
                    >
                      {{ line.category.name }}
                    </p>
                    <p class="text-[11px] text-text-tertiary">
                      Aktual:
                      {{ formatIdrId(parseMoneyString(line.actualAmount)) }}
                    </p>
                  </div>
                  <div class="w-[120px] shrink-0 sm:w-[140px]">
                    <input
                      v-model="allocationById[line.category.id]"
                      type="text"
                      inputmode="numeric"
                      placeholder="0"
                      class="w-full rounded-input border border-border-default bg-ds-black-200/80 px-2.5 py-1.5 text-right font-mono text-[13px] text-text-primary tabular-nums outline-none transition-[border-color,box-shadow] duration-180 focus:border-border-accent-orange focus:shadow-input-focus"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          class="shrink-0 border-t border-white/[0.06] bg-ds-black-300/95 px-5 py-4"
        >
          <button
            type="button"
            class="w-full rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="submitting"
            @click="onSubmit"
          >
            {{ submitting ? 'Menyimpan…' : 'Simpan budget' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
