<script setup>
import { computed, ref, watch } from 'vue'

import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** YYYY-MM-DD */
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'close'])

const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())

const nativeInputRef = ref(null)

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

const DAY_H = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function parseYmd(s) {
  if (!s || typeof s !== 'string') return null
  const p = s.trim().split('-').map((x) => parseInt(x, 10))
  if (p.length !== 3) return null
  const [y, m, d] = p
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null
  const dt = new Date(y, m - 1, d)
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null
  }
  return { y, m: m - 1, d }
}

function toYmd(y, m0, d) {
  return `${y}-${String(m0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const titleLabel = computed(
  () => `${MONTH_ID[viewMonth.value]} ${viewYear.value}`,
)

/** 6 baris × 7 hari; sel kosong = null, hari = { d, m0, y, inMonth } */
const calendarWeeks = computed(() => {
  const y = viewYear.value
  const m0 = viewMonth.value
  const first = new Date(y, m0, 1)
  const firstWeekday = first.getDay() // 0=Min
  const daysInMonth = new Date(y, m0 + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, m0, y, inMonth: true })
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  while (cells.length < 42) {
    cells.push(null)
  }
  const weeks = []
  for (let w = 0; w < 6; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7))
  }
  return weeks
})

function syncViewFromValue() {
  const p = parseYmd(props.modelValue)
  if (p) {
    viewYear.value = p.y
    viewMonth.value = p.m
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) syncViewFromValue()
  },
)

function close() {
  emit('close')
}

function selectDay(cell) {
  if (!cell || !cell.inMonth) return
  emit('update:modelValue', toYmd(cell.y, cell.m0, cell.d))
  emit('close')
}

function shiftMonth(delta) {
  let m0 = viewMonth.value + delta
  let y = viewYear.value
  while (m0 < 0) {
    m0 += 12
    y -= 1
  }
  while (m0 > 11) {
    m0 -= 12
    y += 1
  }
  viewMonth.value = m0
  viewYear.value = y
}

function setToday() {
  const t = new Date()
  const y = t.getFullYear()
  const m0 = t.getMonth()
  const d = t.getDate()
  emit('update:modelValue', toYmd(y, m0, d))
  viewYear.value = y
  viewMonth.value = m0
  emit('close')
}

function openNativePicker() {
  nativeInputRef.value?.showPicker?.()
}

const selectedKey = computed(() => props.modelValue)

function isSelectedCell(cell) {
  if (!cell) return false
  return selectedKey.value === toYmd(cell.y, cell.m0, cell.d)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-picker-title"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="close"
      />
      <div
        class="relative z-10 w-full max-w-[360px] flex-col overflow-hidden rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
        @click.stop
      >
        <div
          class="flex items-center justify-between border-b border-white/[0.06] px-4 py-3"
        >
          <h2
            id="date-picker-title"
            class="text-[16px] font-semibold text-text-primary"
          >
            Pilih tanggal
          </h2>
          <button
            type="button"
            class="rounded-[10px] p-2 text-text-tertiary hover:bg-white/[0.06] hover:text-text-primary"
            aria-label="Tutup"
            @click="close"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="px-4 py-3">
          <div class="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              class="rounded-[10px] p-1.5 text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
              aria-label="Bulan sebelumnya"
              @click="shiftMonth(-1)"
            >
              <ChevronLeft
                :size="20"
                :stroke-width="2"
              />
            </button>
            <span
              class="min-w-0 text-center text-[15px] font-medium tabular-nums text-text-primary"
            >
              {{ titleLabel }}
            </span>
            <button
              type="button"
              class="rounded-[10px] p-1.5 text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
              aria-label="Bulan berikutnya"
              @click="shiftMonth(1)"
            >
              <ChevronRight
                :size="20"
                :stroke-width="2"
              />
            </button>
          </div>

          <div
            class="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-text-tertiary"
          >
            <span
              v-for="h in DAY_H"
              :key="h"
            >
              {{ h }}
            </span>
          </div>
          <div
            v-for="(row, ri) in calendarWeeks"
            :key="ri"
            class="grid grid-cols-7 gap-0.5"
          >
            <button
              v-for="(cell, ci) in row"
              :key="ci"
              type="button"
              class="min-h-9 rounded-[8px] text-[14px] tabular-nums transition-colors"
              :class="
                cell
                  ? isSelectedCell(cell)
                    ? 'bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 font-semibold text-white'
                    : 'text-text-primary hover:bg-white/[0.08]'
                  : 'cursor-default'
              "
              :disabled="!cell"
              @click="cell && selectDay(cell)"
            >
              {{ cell ? cell.d : '' }}
            </button>
          </div>

          <div
            class="mt-4 space-y-3 border-t border-border-subtle pt-4"
          >
            <div class="flex flex-wrap items-center gap-2">
              <input
                ref="nativeInputRef"
                :value="modelValue"
                type="date"
                class="min-h-10 min-w-0 flex-1 rounded-input border border-border-default bg-ds-black-400/80 px-3 py-2 text-[14px] text-text-primary [color-scheme:dark] focus:border-border-accent-orange focus:outline-none focus:ring-0"
                @change="$emit('update:modelValue', $event.target.value)"
              />
              <button
                type="button"
                class="shrink-0 rounded-[10px] border border-border-default px-3 py-2 text-[12px] font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
                @click="openNativePicker"
              >
                Buka pemilih
              </button>
            </div>
          </div>

          <div class="mt-3">
            <button
              type="button"
              class="w-full rounded-[10px] border border-border-default bg-ds-black-400/50 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
              @click="setToday"
            >
              Pilih hari ini
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
