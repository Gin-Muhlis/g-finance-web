<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { X } from 'lucide-vue-next'

import { CATEGORY_COLOR_PRESETS } from '@/constants/categoryColors'
import { CATEGORY_ICON_NAMES, getCategoryIconComponent } from '@/utils/categoryIconMap'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  category: { type: Object, default: null },
  defaultType: { type: String, default: 'expense' },
  submitting: { type: Boolean, default: false },
  apiError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const name = ref('')
const type = ref('expense')
const icon = ref('Tag')
const color = ref(CATEGORY_COLOR_PRESETS[0].value)
const errorMessage = ref('')

const title = computed(() =>
  props.mode === 'create' ? 'Tambah kategori' : 'Edit kategori'
)

function normalizeDefaultCategoryType(defaultTypeValue) {
  if (defaultTypeValue === 'income' || defaultTypeValue === 'expense') {
    return defaultTypeValue
  }
  return 'expense'
}

function categoryTypeDisplayLabel(categoryTypeValue) {
  if (categoryTypeValue === 'income') return 'Pemasukan'
  if (categoryTypeValue === 'expense') return 'Pengeluaran'
  return '—'
}

function resetForm() {
  name.value = ''
  type.value = normalizeDefaultCategoryType(props.defaultType)
  icon.value = 'Tag'
  color.value = CATEGORY_COLOR_PRESETS[0].value
  errorMessage.value = ''
}

function loadFromCategory() {
  if (!props.category) return
  name.value = props.category.name ?? ''
  type.value = props.category.type ?? 'expense'
  icon.value =
    props.category.icon && CATEGORY_ICON_NAMES.includes(props.category.icon)
      ? props.category.icon
      : 'Tag'
  color.value =
    props.category.color &&
    CATEGORY_COLOR_PRESETS.some(
      (colorPreset) => colorPreset.value === props.category.color
    )
      ? props.category.color
      : CATEGORY_COLOR_PRESETS[0].value
  errorMessage.value = ''
}

watch(
  () => [props.open, props.mode, props.category?.id],
  async () => {
    if (!props.open) {
      errorMessage.value = ''
      return
    }
    await nextTick()
    if (props.mode === 'edit' && props.category?.id) {
      loadFromCategory()
    } else if (props.mode === 'create') {
      resetForm()
      type.value = normalizeDefaultCategoryType(props.defaultType)
    }
  }
)

function close() {
  if (props.submitting) return
  emit('close')
}

function submitForm() {
  errorMessage.value = ''
  const trimmed = name.value.trim()
  if (!trimmed) {
    errorMessage.value = 'Nama wajib diisi.'
    return
  }
  if (props.mode === 'create') {
    emit('submit', {
      mode: 'create',
      body: {
        name: trimmed,
        type: type.value,
        icon: icon.value,
        color: color.value,
      },
    })
  } else {
    emit('submit', {
      mode: 'edit',
      id: props.category.id,
      body: {
        name: trimmed,
        icon: icon.value,
        color: color.value,
      },
    })
  }
}

function iconButtonClass(isActive) {
  return [
    'flex h-10 w-10 items-center justify-center rounded-[10px] border transition-colors',
    isActive
      ? 'border-accent-primary bg-accent-primary/15 shadow-card-orange-active'
      : 'border-border-default bg-ds-black-400/50 hover:border-white/15 hover:bg-white/[0.04]',
  ]
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'category-modal-title'"
    >
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="close"
      />
      <div
        class="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-[440px] flex-col rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4"
        >
          <h2
            id="category-modal-title"
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

          <div class="space-y-4">
            <div>
              <label
                for="cat-name"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Nama
              </label>
              <input
                id="cat-name"
                v-model="name"
                type="text"
                maxlength="255"
                class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
                placeholder="Contoh: Makanan"
                :disabled="submitting"
              />
            </div>

            <div v-if="mode === 'create'">
              <label
                for="cat-type"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Tipe
              </label>
              <select
                id="cat-type"
                v-model="type"
                class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
                :disabled="submitting"
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <div v-else class="rounded-[8px] border border-border-default bg-ds-black-400/70 px-[14px] py-2.5">
              <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                Tipe
              </p>
              <p class="mt-1 text-[14px] text-text-primary">
                {{ categoryTypeDisplayLabel(type) }}
              </p>
            </div>

            <div>
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                Ikon
              </p>
              <div
                class="grid max-h-[200px] grid-cols-5 gap-2 overflow-y-auto rounded-[10px] border border-border-default bg-ds-black-400/40 p-2 sm:grid-cols-6"
              >
                <button
                  v-for="iconName in CATEGORY_ICON_NAMES"
                  :key="iconName"
                  type="button"
                  :class="iconButtonClass(icon === iconName)"
                  :disabled="submitting"
                  :title="iconName"
                  @click="icon = iconName"
                >
                  <component
                    :is="getCategoryIconComponent(iconName)"
                    :size="18"
                    :stroke-width="2"
                    class="text-text-primary"
                  />
                </button>
              </div>
              <p class="mt-1.5 text-[11px] text-text-tertiary">
                Tersimpan sebagai: <span class="font-mono text-text-secondary">{{ icon }}</span>
              </p>
            </div>

            <div>
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                Warna
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in CATEGORY_COLOR_PRESETS"
                  :key="preset.value"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ds-black-300"
                  :class="
                    color === preset.value
                      ? 'border-text-primary ring-2 ring-white/20'
                      : 'border-transparent'
                  "
                  :style="{ backgroundColor: preset.value }"
                  :title="preset.label"
                  :disabled="submitting"
                  @click="color = preset.value"
                >
                  <span class="sr-only">{{ preset.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex shrink-0 gap-3 border-t border-white/[0.06] px-5 py-4"
        >
          <button
            type="button"
            class="flex-1 rounded-[10px] border border-border-default bg-transparent py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-white/[0.06]"
            :disabled="submitting"
            @click="close"
          >
            Batal
          </button>
          <button
            type="button"
            class="flex-1 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 py-2.5 text-[14px] font-semibold text-white shadow-button-orange disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="submitting"
            @click="submitForm"
          >
            {{ submitting ? 'Menyimpan…' : mode === 'create' ? 'Simpan' : 'Perbarui' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
