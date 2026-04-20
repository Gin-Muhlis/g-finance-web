<script setup>
import { AlertTriangle, X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: 'Kategori akan dihapus' },
  confirmText: { type: String, default: 'Hapus' },
  cancelText: { type: String, default: 'Batal' },
  loading: { type: Boolean, default: false },
  variant: { type: String, default: 'danger' },
})
console.log(props.message)
const emit = defineEmits(['close', 'confirm'])

function onBackdropClick() {
  if (props.loading) return
  emit('close')
}

function onConfirm() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="'confirm-dialog-title'"
      :aria-describedby="message ? 'confirm-dialog-desc' : undefined"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="onBackdropClick"
      />
      <div
        class="relative z-10 w-full max-w-[400px] rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
        @click.stop
      >
        <div class="flex items-start gap-3 border-b border-white/[0.06] px-5 py-4">
          <span
            v-if="variant === 'danger'"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-negative/35 bg-negative/10"
          >
            <AlertTriangle
              :size="20"
              :stroke-width="2"
              class="text-negative"
            />
          </span>
          <div class="min-w-0 flex-1 pt-0.5">
            <h2
              id="confirm-dialog-title"
              class="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-text-primary"
            >
              {{ title }}
            </h2>
            <p
              v-if="message"
              id="confirm-dialog-desc"
              class="mt-2 text-[14px] leading-relaxed text-text-secondary"
            >
              {{ message }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-[10px] p-2 text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-text-primary disabled:opacity-40"
            :disabled="loading"
            aria-label="Tutup"
            @click="emit('close')"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="flex gap-3 px-5 py-4">
          <button
            type="button"
            class="flex-1 rounded-[10px] border border-border-default bg-ds-black-400/80 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:border-white/15 hover:bg-ds-black-400 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="emit('close')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-[10px] border border-negative/40 bg-negative/15 py-2.5 text-[14px] font-semibold text-negative transition-colors hover:bg-negative/25 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="onConfirm"
          >
            {{ loading ? 'Memproses…' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
