<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next'

import CategoryIcon from '@/components/categories/CategoryIcon.vue'

defineProps({
  category: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])

function categoryTypeDisplayLabel(categoryTypeValue) {
  if (categoryTypeValue === 'income') return 'Pemasukan'
  if (categoryTypeValue === 'expense') return 'Pengeluaran'
  if (categoryTypeValue === 'allocation') return 'Alokasi'
  return categoryTypeValue
}
</script>

<template>
  <article
    class="flex flex-col rounded-[14px] border border-border-default bg-background-surface p-4 shadow-card-default transition-colors hover:border-white/[0.12] hover:bg-ds-black-400 sm:items-start sm:justify-between sm:gap-4"
  >
    <div class="flex min-w-0 flex-1 gap-3">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-ds-black-200/90"
        :style="{
          boxShadow: category.color
            ? `0 0 0 1px ${category.color}40, 0 0 24px ${category.color}18`
            : undefined,
        }"
      >
        <CategoryIcon
          :icon-name="category.icon"
          :color="category.color || '#FFFFFF'"
          :size="24"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-[16px] font-semibold leading-tight text-text-primary">
          {{ category.name }}
        </h3>
        <p class="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          {{ categoryTypeDisplayLabel(category.type) }}
        </p>
      </div>
    </div>

    <div
      class="mt-4 flex gap-2 sm:mt-0 justify-end w-full"
    >
      <button
        type="button"
        class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border-default bg-ds-black-300/80 px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-accent-orange hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary sm:flex-none"
        @click="emit('edit', category)"
      >
        <Pencil :size="15" :stroke-width="2" />
        <span class="">Edit</span>
      </button>
      <button
        type="button"
        class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-negative/35 bg-negative/10 px-3 py-2 text-[13px] font-medium text-negative transition-colors hover:bg-negative/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-negative sm:flex-none"
        @click="emit('delete', category)"
      >
        <Trash2 :size="15" :stroke-width="2" />
        <span class="">Hapus</span>
      </button>
    </div>
  </article>
</template>
