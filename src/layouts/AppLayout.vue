<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Tags,
  User,
  Wallet,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const sidebarOpen = ref(false)

const pageTitle = computed(() => route.meta.title || 'Dashboard')

const navItems = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/app/categories',
    label: 'Kelola kategori',
    icon: Tags,
  },
  {
    to: '/app/wallets',
    label: 'Kelola wallet',
    icon: Wallet,
  },
  {
    to: '/app/transactions',
    label: 'Kelola transaksi',
    icon: ArrowLeftRight,
  },
  {
    to: '/app/profile',
    label: 'Profil',
    icon: User,
  },
]

function closeSidebar() {
  sidebarOpen.value = false
}

async function handleLogout() {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div
    class="relative min-h-[100dvh] overflow-hidden bg-background-base text-text-primary"
  >
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_15%_60%,#FF4500_0%,transparent_42%),radial-gradient(ellipse_at_85%_40%,#6A0DAD_0%,transparent_48%),#0A0A0A]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -left-[20%] top-[15%] h-[min(90vw,720px)] w-[min(90vw,720px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,80,0,0.38)_0%,transparent_68%)] blur-3xl"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -right-[15%] bottom-[10%] h-[min(85vw,680px)] w-[min(85vw,680px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(138,47,201,0.42)_0%,transparent_70%)] blur-3xl [animation-delay:2s]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(10,10,10,0)_0%,rgba(10,10,10,0.45)_50%,rgba(10,10,10,0.75)_100%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:64px_64px]"
      aria-hidden="true"
    />

    <div class="relative z-10 flex min-h-[100dvh]">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
      aria-hidden="true"
      @click="closeSidebar"
    />

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-[200px] flex-col border-r border-white/[0.08] bg-ds-black-200/70 shadow-sidebar backdrop-blur-xl transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:static md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      aria-label="Menu utama"
    >
      <div class="flex h-[52px] shrink-0 items-center gap-2 border-b border-white/[0.06] bg-ds-black-200/40 px-3 backdrop-blur-sm">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border-default bg-background-overlay/90 shadow-card-default"
        >
          <Wallet :size="18" :stroke-width="2" class="text-accent-primary" />
        </span>
        <span class="truncate text-[14px] font-semibold tracking-tight">
          G-Finance
        </span>
        <button
          type="button"
          class="ml-auto rounded-[10px] p-1.5 text-text-tertiary hover:bg-white/[0.06] hover:text-text-primary md:hidden"
          aria-label="Tutup menu"
          @click="closeSidebar"
        >
          <X :size="18" />
        </button>
      </div>

      <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2.5 rounded-[8px] px-4 py-2.5 text-[14px] font-medium text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white/90"
          active-class="!bg-[rgba(255,80,0,0.12)] !text-text-primary"
          @click="closeSidebar"
        >
          <component
            :is="item.icon"
            :size="16"
            :stroke-width="2"
            class="shrink-0 opacity-90"
          />
          <span class="truncate">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="border-t border-white/[0.06] bg-ds-black-200/30 p-3 backdrop-blur-sm">
        <p class="truncate px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Akun
        </p>
        <p class="mt-1 truncate px-1 text-[13px] text-text-secondary">
          {{ auth.user?.name || '—' }}
        </p>
        <p class="truncate px-1 text-[11px] text-text-tertiary">
          {{ auth.user?.email }}
        </p>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col md:ml-0">
      <header
        class="sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-3 border-b border-white/[0.08] bg-ds-black-200/75 px-4 backdrop-blur-xl sm:px-6"
      >
        <button
          type="button"
          class="rounded-[10px] p-2 text-text-secondary hover:bg-white/[0.06] hover:text-text-primary md:hidden"
          aria-label="Buka menu"
          @click="sidebarOpen = true"
        >
          <Menu :size="20" />
        </button>

        <h1 class="min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight tracking-[-0.01em]">
          {{ pageTitle }}
        </h1>

        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-border-default bg-background-overlay/90 px-3 py-2 text-[13px] font-medium text-text-secondary shadow-card-default backdrop-blur-sm transition-colors hover:border-border-accent-orange hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-base"
          @click="handleLogout"
        >
          <LogOut :size="16" :stroke-width="2" />
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </header>

      <main class="relative flex-1 p-6 sm:p-7 md:px-8 md:py-7">
        <router-view />
      </main>
    </div>
    </div>
  </div>
</template>
