<script setup>
import { Wallet } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"
  >
    <Wallet
      :size="40"
      :stroke-width="1.75"
      class="text-accent-primary"
      aria-hidden="true"
    />
    <h1 class="text-2xl font-semibold tracking-tight text-text-primary">
      {{ appStore.appName }}
    </h1>
    <p class="max-w-md text-text-secondary">
      Setup Vue
    </p>
  </div>
</template>
