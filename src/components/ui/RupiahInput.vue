<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { formatIdrGroupedInteger } from '@/utils/moneyFormat.js'

const MAX_DIGITS = 15

const props = defineProps({
  /** Hanya digit (string), contoh `"150000"` — cocok dengan `parseMoneyString` */
  modelValue: { type: [String, Number], default: '' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '0' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  /** Class tambahan pada wrapper */
  wrapperClass: { type: String, default: '' },
  /** Ukuran lebih kecil untuk sel tabel / baris rapat */
  compact: { type: Boolean, default: false },
  /** Set atribut `required` pada input (validasi form HTML) */
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const digits = ref('')

function normalizeIncoming(v) {
  if (v === '' || v == null) return ''
  return String(v).replace(/\D/g, '').slice(0, MAX_DIGITS)
}

watch(
  () => props.modelValue,
  (v) => {
    const next = normalizeIncoming(v)
    if (next !== digits.value) {
      digits.value = next
    }
  },
  { immediate: true }
)

const display = computed(() => {
  if (!digits.value) return ''
  const n = parseInt(digits.value, 10)
  if (!Number.isFinite(n)) return ''
  return formatIdrGroupedInteger(n)
})

function caretIndexAfterFormat(formatted, digitsBeforeCursor) {
  if (!formatted) return 0
  if (digitsBeforeCursor <= 0) return 0
  let seen = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++
      if (seen === digitsBeforeCursor) {
        return i + 1
      }
    }
  }
  return formatted.length
}

function onInput(e) {
  const el = e.target
  const cursor = el.selectionStart ?? 0
  const digitsBefore = el.value.slice(0, cursor).replace(/\D/g, '').length

  const nextDigits = el.value.replace(/\D/g, '').slice(0, MAX_DIGITS)
  digits.value = nextDigits
  emit('update:modelValue', nextDigits)

  nextTick(() => {
    const formatted = display.value
    const pos = caretIndexAfterFormat(formatted, digitsBefore)
    el.setSelectionRange(pos, pos)
  })
}

function onFocus(e) {
  emit('focus', e)
}

function onBlur(e) {
  emit('blur', e)
}
</script>

<template>
  <div
    class="flex w-full items-stretch overflow-hidden rounded-input border border-border-default bg-ds-black-400/80 shadow-inner transition-[border-color,box-shadow] duration-180 focus-within:border-border-accent-orange focus-within:shadow-input-focus"
    :class="[
      compact ? 'min-h-[2.125rem]' : 'min-h-[2.75rem]',
      disabled ? 'cursor-not-allowed opacity-50' : '',
      wrapperClass,
    ]"
  >
    <span
      class="flex shrink-0 items-center border-r border-white/[0.08] bg-ds-black-400/60 font-medium tabular-nums text-text-secondary"
      :class="compact ? 'px-2 text-[11px]' : 'px-3.5 text-[14px]'"
      aria-hidden="true"
    >
      Rp.
    </span>
    <input
      :id="id"
      :name="name"
      type="text"
      inputmode="numeric"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :required="required"
      :value="display"
      :placeholder="placeholder"
      class="min-w-0 flex-1 border-0 bg-transparent text-right font-mono tabular-nums text-text-primary outline-none placeholder:text-text-disabled"
      :class="compact ? 'px-2 py-1.5 text-[13px]' : 'px-3.5 py-2.5 text-[15px]'"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
  </div>
</template>
