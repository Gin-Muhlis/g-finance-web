<script setup>
import { AlertCircle, CheckCircle2, X } from 'lucide-vue-next'

import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-[200] p-4 sm:inset-x-auto sm:bottom-auto sm:left-auto sm:right-5 sm:top-5 sm:w-full sm:max-w-md"
    aria-live="polite"
    aria-relevant="additions"
  >
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex flex-col gap-2 sm:items-end"
    >
      <div
        v-for="toastItem in toast.toasts"
        :key="toastItem.id"
        class="pointer-events-auto flex items-start gap-3 rounded-[12px] border bg-ds-black-300/98 px-4 py-3 shadow-card-elevated backdrop-blur-md"
        :class="
          toastItem.type === 'success'
            ? 'border-positive/40'
            : 'border-negative/45'
        "
        role="status"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          :class="
            toastItem.type === 'success'
              ? 'bg-positive/12 text-positive'
              : 'bg-negative/12 text-negative'
          "
        >
          <CheckCircle2
            v-if="toastItem.type === 'success'"
            :size="20"
            :stroke-width="2"
          />
          <AlertCircle
            v-else
            :size="20"
            :stroke-width="2"
          />
        </span>
        <p class="min-w-0 flex-1 pt-0.5 text-[14px] leading-snug text-text-primary">
          {{ toastItem.message }}
        </p>
        <button
          type="button"
          class="shrink-0 rounded-[8px] p-1 text-text-tertiary transition-colors hover:bg-white/[0.08] hover:text-text-primary"
          aria-label="Tutup"
          @click="toast.dismiss(toastItem.id)"
        >
          <X :size="16" :stroke-width="2" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
