import { ref } from 'vue'
import { defineStore } from 'pinia'

const DEFAULT_DURATION_MS = 4500

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 0

  function dismiss(id) {
    toasts.value = toasts.value.filter((toastItem) => toastItem.id !== id)
  }

  function push(type, message, durationMs = DEFAULT_DURATION_MS) {
    const id = ++nextId
    toasts.value.push({ id, type, message })
    if (durationMs > 0) {
      setTimeout(() => dismiss(id), durationMs)
    }
    return id
  }

  return {
    toasts,
    dismiss,
    success: (message, durationMs) => push('success', message, durationMs),
    error: (message, durationMs) => push('error', message, durationMs),
  }
})
