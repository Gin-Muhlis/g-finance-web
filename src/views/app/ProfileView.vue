<script setup>
import { computed } from 'vue'

import { Mail, User } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const displayName = computed(() => auth.user?.name?.trim() || 'Pengguna')
const email = computed(() => auth.user?.email?.trim() || '—')

const userInitials = computed(() => {
  const name = displayName.value
  const parts = name.split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${second}`.toUpperCase() || 'GF'
})
</script>

<template>
  <div
    v-motion-fade
    :duration="550"
    class="space-y-4"
  >
    <section
      class="overflow-hidden rounded-[18px] border border-white/[0.08] bg-ds-black-300/85 p-5 shadow-card-elevated backdrop-blur-md sm:p-6"
    >
      <div class="flex items-start gap-4">
        <span
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 text-[18px] font-bold text-white shadow-[0_0_0_3px_rgba(255,255,255,0.08)]"
        >
          {{ userInitials }}
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="text-[20px] font-semibold tracking-[-0.01em] text-text-primary">
            {{ displayName }}
          </h2>
          <p class="mt-1 flex items-center gap-2 text-[13px] text-text-secondary">
            <Mail
              :size="14"
              class="shrink-0 text-text-tertiary"
            />
            {{ email }}
          </p>
        </div>
      </div>
    </section>

    <section
      v-motion-fade
      :delay="100"
      :duration="550"
      class="rounded-[14px] border border-dashed border-white/[0.1] bg-ds-black-400/45 px-5 py-8"
    >
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.04] text-text-tertiary">
          <User
            :size="18"
            :stroke-width="2"
          />
        </span>
        <div>
          <p class="text-[14px] font-semibold text-text-primary">
            Pengaturan profil
          </p>
          <p class="mt-1 text-[13px] leading-relaxed text-text-secondary">
            Fitur edit profil dan preferensi akun akan tersedia di sini.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
