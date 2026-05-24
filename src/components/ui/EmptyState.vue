<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div
    v-motion-fade
    :duration="500"
    class="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-white/[0.1] bg-ds-black-400/45 text-center"
    :class="compact ? 'px-5 py-10' : 'px-6 py-14'"
  >
    <span
      v-if="icon"
      class="mb-3 flex h-12 w-12 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.04] text-text-tertiary"
    >
      <component
        :is="icon"
        :size="22"
        :stroke-width="2"
      />
    </span>
    <p class="text-[15px] font-semibold text-text-primary">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="mt-2 max-w-sm text-[13px] leading-relaxed text-text-secondary"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-5"
    >
      <slot />
    </div>
  </div>
</template>
