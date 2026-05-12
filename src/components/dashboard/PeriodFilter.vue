<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { CalendarRange, Check, ChevronDown } from 'lucide-vue-next'

import { PERIOD_OPTIONS } from '@/data/dashboardDummyData'

const props = defineProps({
  modelValue: { type: String, default: 'today' },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

const emit = defineEmits(['update:modelValue', 'update:fromDate', 'update:toDate'])

const isOpen = ref(false)
const containerRef = ref(null)

const localFromDate = ref(props.fromDate || todayIso())
const localToDate = ref(props.toDate || todayIso())

watch(
  () => props.fromDate,
  (value) => {
    if (value) localFromDate.value = value
  },
)
watch(
  () => props.toDate,
  (value) => {
    if (value) localToDate.value = value
  },
)

const currentOption = computed(
  () => PERIOD_OPTIONS.find((o) => o.id === props.modelValue) ?? PERIOD_OPTIONS[0],
)

const isCustom = computed(() => props.modelValue === 'custom')

const triggerClasses = computed(() => {
  if (props.size === 'sm') {
    return 'h-8 px-3 text-[12px]'
  }
  return 'h-9 px-3.5 text-[13px]'
})

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function selectPeriod(periodId) {
  emit('update:modelValue', periodId)
  if (periodId !== 'custom') {
    isOpen.value = false
  }
}

function applyCustomRange() {
  emit('update:fromDate', localFromDate.value)
  emit('update:toDate', localToDate.value)
  emit('update:modelValue', 'custom')
  isOpen.value = false
}

function onDocumentClick(event) {
  if (!isOpen.value) return
  const el = containerRef.value
  if (el && !el.contains(event.target)) {
    isOpen.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

const displayLabel = computed(() => {
  if (isCustom.value && props.fromDate && props.toDate) {
    return `${props.fromDate} → ${props.toDate}`
  }
  return currentOption.value.label
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative inline-block"
  >
    <button
      type="button"
      class="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] font-medium text-text-primary transition-colors hover:border-white/15 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      :class="triggerClasses"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggleOpen"
    >
      <CalendarRange
        :size="14"
        :stroke-width="2"
        class="text-accent-primary"
      />
      <span class="truncate">{{ displayLabel }}</span>
      <ChevronDown
        :size="14"
        :stroke-width="2"
        class="text-text-tertiary transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        role="listbox"
        class="absolute right-0 top-[calc(100%+8px)] z-40 w-[260px] overflow-hidden rounded-[14px] border border-white/[0.1] bg-ds-black-300/98 shadow-card-elevated backdrop-blur-xl"
      >
        <ul class="py-1.5">
          <li
            v-for="option in PERIOD_OPTIONS"
            :key="option.id"
          >
            <button
              type="button"
              role="option"
              :aria-selected="modelValue === option.id"
              class="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.05]"
              :class="
                modelValue === option.id
                  ? 'bg-[rgba(255,80,0,0.12)] text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              "
              @click="selectPeriod(option.id)"
            >
              <span>{{ option.label }}</span>
              <Check
                v-if="modelValue === option.id"
                :size="14"
                :stroke-width="2.5"
                class="text-accent-primary"
              />
            </button>
          </li>
        </ul>

        <div
          v-if="isCustom"
          class="border-t border-white/[0.06] bg-ds-black-200/40 p-3"
        >
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
            Pilih rentang
          </p>
          <div class="grid grid-cols-2 gap-2">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] text-text-tertiary">From</span>
              <input
                v-model="localFromDate"
                type="date"
                class="rounded-[8px] border border-white/[0.08] bg-ds-black-400/80 px-2 py-1.5 text-[12px] text-text-primary focus:border-accent-primary/60 focus:outline-none"
              >
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] text-text-tertiary">To</span>
              <input
                v-model="localToDate"
                type="date"
                :min="localFromDate"
                class="rounded-[8px] border border-white/[0.08] bg-ds-black-400/80 px-2 py-1.5 text-[12px] text-text-primary focus:border-accent-primary/60 focus:outline-none"
              >
            </label>
          </div>
          <button
            type="button"
            class="mt-3 w-full rounded-[8px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-3 py-2 text-[12px] font-semibold text-white shadow-button-orange hover:opacity-95"
            @click="applyCustomRange"
          >
            Terapkan
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
