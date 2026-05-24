<script setup>
defineProps({
  variant: {
    type: String,
    default: 'card',
    validator: (value) =>
      ['wallet', 'category', 'stat', 'list', 'hero', 'table'].includes(value),
  },
})
</script>

<template>
  <article
    v-if="variant === 'wallet'"
    class="animate-pulse rounded-[14px] border border-border-default bg-background-surface p-4"
    aria-hidden="true"
  >
    <div class="flex gap-3">
      <div class="h-12 w-12 shrink-0 rounded-[12px] bg-white/[0.08]" />
      <div class="flex-1 space-y-2 pt-1">
        <div class="h-4 w-2/3 rounded-[6px] bg-white/[0.08]" />
        <div class="h-3 w-1/3 rounded-[4px] bg-white/[0.06]" />
      </div>
    </div>
    <div class="mt-4 space-y-2">
      <div class="h-3 w-12 rounded-[4px] bg-white/[0.06]" />
      <div class="h-6 w-3/4 rounded-[8px] bg-white/[0.08]" />
    </div>
    <div class="mt-4 h-16 rounded-[10px] bg-white/[0.05]" />
    <div class="mt-4 flex gap-2">
      <div
        v-for="i in 3"
        :key="i"
        class="h-9 flex-1 rounded-[10px] bg-white/[0.06]"
      />
    </div>
  </article>

  <article
    v-else-if="variant === 'category'"
    class="animate-pulse rounded-[14px] border border-border-default bg-background-surface p-4"
    aria-hidden="true"
  >
    <div class="flex gap-3">
      <div class="h-11 w-11 shrink-0 rounded-[12px] bg-white/[0.08]" />
      <div class="flex-1 space-y-2 pt-1">
        <div class="h-4 w-2/3 rounded-[6px] bg-white/[0.08]" />
        <div class="h-3 w-1/4 rounded-[4px] bg-white/[0.06]" />
      </div>
    </div>
    <div class="mt-4 flex gap-2">
      <div class="h-9 w-20 rounded-[10px] bg-white/[0.06]" />
      <div class="h-9 w-20 rounded-[10px] bg-white/[0.06]" />
    </div>
  </article>

  <div
    v-else-if="variant === 'stat'"
    class="animate-pulse rounded-[14px] border border-border-default bg-background-surface/90 px-4 py-3"
    aria-hidden="true"
  >
    <div class="h-3 w-24 rounded-[4px] bg-white/[0.06]" />
    <div class="mt-3 h-7 w-32 rounded-[8px] bg-white/[0.08]" />
  </div>

  <div
    v-else-if="variant === 'list'"
    class="animate-pulse overflow-hidden rounded-[14px] border border-border-default bg-background-overlay"
    aria-hidden="true"
  >
    <div class="border-b border-white/[0.06] px-4 py-3">
      <div class="h-4 w-40 rounded-[6px] bg-white/[0.08]" />
      <div class="mt-2 h-3 w-56 rounded-[4px] bg-white/[0.06]" />
    </div>
    <div
      v-for="i in 4"
      :key="i"
      class="flex gap-3 border-b border-white/[0.04] px-4 py-3.5 last:border-b-0"
    >
      <div class="h-10 w-10 shrink-0 rounded-[10px] bg-white/[0.07]" />
      <div class="flex-1 space-y-2 pt-1">
        <div class="h-3.5 w-1/2 rounded-[4px] bg-white/[0.08]" />
        <div class="h-3 w-1/3 rounded-[4px] bg-white/[0.06]" />
      </div>
      <div class="h-5 w-20 rounded-[6px] bg-white/[0.08]" />
    </div>
  </div>

  <div
    v-else-if="variant === 'hero'"
    class="animate-pulse rounded-[14px] border border-border-default bg-ds-black-300/60 p-5 sm:p-6"
    aria-hidden="true"
  >
    <div class="h-3 w-36 rounded-[4px] bg-white/[0.06]" />
    <div class="mt-3 h-7 w-48 rounded-[8px] bg-white/[0.08]" />
    <div class="mt-6 flex items-end justify-between gap-4">
      <div class="h-10 w-20 rounded-[8px] bg-white/[0.08]" />
      <div class="h-8 w-32 rounded-[8px] bg-white/[0.06]" />
    </div>
    <div class="mt-4 h-2.5 w-full rounded-full bg-white/[0.08]" />
  </div>

  <div
    v-else-if="variant === 'table'"
    class="animate-pulse rounded-[14px] border border-border-default bg-background-overlay p-4"
    aria-hidden="true"
  >
    <div class="mb-4 flex items-center justify-between">
      <div class="h-5 w-40 rounded-[6px] bg-white/[0.08]" />
      <div class="h-8 w-20 rounded-[8px] bg-white/[0.06]" />
    </div>
    <div
      v-for="i in 5"
      :key="i"
      class="flex gap-3 border-t border-white/[0.04] py-3"
    >
      <div class="h-4 flex-1 rounded-[4px] bg-white/[0.06]" />
      <div class="h-4 w-24 rounded-[4px] bg-white/[0.08]" />
    </div>
  </div>

  <div
    v-else
    class="animate-pulse rounded-[14px] border border-border-default bg-background-surface p-4"
    aria-hidden="true"
  >
    <div class="h-4 w-1/2 rounded-[6px] bg-white/[0.08]" />
    <div class="mt-3 h-3 w-full rounded-[4px] bg-white/[0.06]" />
    <div class="mt-2 h-3 w-4/5 rounded-[4px] bg-white/[0.06]" />
  </div>
</template>
