<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { X } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'
import RupiahInput from '@/components/ui/RupiahInput.vue'
import { parseMoneyString, toApiMoneyString } from '@/utils/moneyFormat.js'

const BUCKET_TYPES = [
  { value: '', label: '— (default)' },
  { value: 'saving', label: 'Tabungan' },
  { value: 'emergency', label: 'Dana darurat' },
  { value: 'goal', label: 'Tujuan / goal' },
]

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  bucket: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  apiError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const name = ref('')
const type = ref('')
const targetInput = ref('')
const iconName = ref('PiggyBank')
const colorHex = ref('#FF5500')
const localError = ref('')

const title = computed(() =>
  props.mode === 'create' ? 'Tambah bucket' : 'Edit bucket',
)

function reset() {
  name.value = ''
  type.value = ''
  targetInput.value = ''
  iconName.value = 'PiggyBank'
  colorHex.value = '#FF5500'
  localError.value = ''
}

function loadFromBucket() {
  reset()
  const b = props.bucket
  if (!b) return
  name.value = b.name ?? ''
  type.value = b.type ?? ''
  if (b.targetAmount != null && String(b.targetAmount) !== '') {
    targetInput.value = String(Math.round(parseFloat(String(b.targetAmount))))
  }
  iconName.value = b.icon || 'PiggyBank'
  colorHex.value = b.color || '#FF5500'
}

watch(
  () => [props.open, props.mode, props.bucket?.id],
  async () => {
    if (!props.open) {
      localError.value = ''
      return
    }
    await nextTick()
    if (props.mode === 'edit' && props.bucket?.id) loadFromBucket()
    else reset()
  }
)

function close() {
  if (props.submitting) return
  emit('close')
}

function onSubmit() {
  localError.value = ''
  const n = name.value.trim()
  if (!n) {
    localError.value = 'Nama bucket wajib diisi.'
    return
  }
  const targetRaw = targetInput.value.trim()
  const targetPayload =
    targetRaw === '' ? null : toApiMoneyString(parseMoneyString(targetRaw))

  emit('submit', {
    mode: props.mode,
    bucketId: props.bucket?.id,
    name: n,
    type: type.value || undefined,
    targetAmount: targetPayload,
    icon: iconName.value.trim() || undefined,
    color: colorHex.value.trim() || undefined,
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
      :aria-labelledby="'bucket-form-title'"
    >
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="close"
      />
      <div
        class="relative z-10 flex max-h-[min(90dvh,600px)] w-full max-w-[440px] flex-col rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
        @click.stop
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4"
        >
          <h2
            id="bucket-form-title"
            class="text-[18px] font-semibold tracking-[-0.01em] text-text-primary"
          >
            {{ title }}
          </h2>
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
          <p
            v-if="apiError"
            class="mb-3 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ apiError }}
          </p>
          <p
            v-if="localError"
            class="mb-3 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ localError }}
          </p>

          <form
            class="space-y-4"
            @submit.prevent="onSubmit"
          >
            <div>
              <label
                for="b-name"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Nama bucket
              </label>
              <input
                id="b-name"
                v-model="name"
                type="text"
                maxlength="100"
                class="w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange focus:shadow-input-focus"
                placeholder="Contoh: Dana darurat"
                required
              />
            </div>
            <div>
              <label
                for="b-type"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Tipe (opsional)
              </label>
              <select
                id="b-type"
                v-model="type"
                class="w-full appearance-none rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-border-accent-orange focus:shadow-input-focus"
              >
                <option
                  v-for="opt in BUCKET_TYPES"
                  :key="opt.value || 'empty'"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label
                for="b-target"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
              >
                Target (opsional)
              </label>
              <RupiahInput
                id="b-target"
                v-model="targetInput"
                placeholder="0"
                :disabled="submitting"
              />
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  for="b-icon"
                  class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
                >
                  Ikon (Lucide)
                </label>
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border-default bg-ds-black-200/80"
                  >
                    <CategoryIcon
                      :icon-name="iconName"
                      :color="colorHex"
                      :size="20"
                    />
                  </div>
                  <input
                    id="b-icon"
                    v-model="iconName"
                    type="text"
                    class="min-w-0 flex-1 rounded-input border border-border-default bg-ds-black-400/80 px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-border-accent-orange"
                    placeholder="PiggyBank"
                  />
                </div>
              </div>
              <div>
                <label
                  for="b-color"
                  class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary"
                >
                  Warna
                </label>
                <input
                  id="b-color"
                  v-model="colorHex"
                  type="text"
                  class="w-full rounded-input border border-border-default bg-ds-black-400/80 px-3.5 py-2.5 font-mono text-[13px] text-text-primary outline-none focus:border-border-accent-orange"
                  placeholder="#FF5500"
                />
              </div>
            </div>
          </form>
        </div>

        <div
          class="flex gap-2 border-t border-white/[0.06] px-5 py-4"
        >
          <button
            type="button"
            class="flex-1 rounded-[10px] border border-border-default bg-ds-black-400/60 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
            :disabled="submitting"
            @click="close"
          >
            Batal
          </button>
          <button
            type="button"
            class="flex-1 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:opacity-40"
            :disabled="submitting"
            @click="onSubmit"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
