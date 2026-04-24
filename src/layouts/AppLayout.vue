<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
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
    label: 'kategori',
    icon: Tags,
  },
  {
    to: '/app/wallets',
    label: 'wallet',
    icon: Wallet,
  },
  {
    to: '/app/budget',
    label: 'Budget',
    icon: PieChart,
  },
  {
    to: '/app/transactions',
    label: 'transaksi',
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
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_70%_at_10%_55%,rgba(255,69,0,0.55)_0%,transparent_52%),radial-gradient(ellipse_85%_75%_at_92%_35%,rgba(106,13,173,0.5)_0%,transparent_52%),radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(255,85,0,0.22)_0%,transparent_55%),linear-gradient(125deg,transparent_35%,rgba(59,130,246,0.12)_48%,rgba(255,80,0,0.08)_52%,transparent_65%),#070708]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -left-[28%] top-[8%] h-[min(110vw,900px)] w-[min(110vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,80,0,0.62)_0%,rgba(255,80,0,0.18)_42%,transparent_72%)] blur-[100px]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -right-[22%] top-[5%] h-[min(95vw,820px)] w-[min(95vw,820px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(138,47,201,0.55)_0%,rgba(168,85,247,0.15)_45%,transparent_72%)] blur-[100px] [animation-delay:1.2s]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -bottom-[18%] left-[15%] h-[min(100vw,780px)] w-[min(100vw,780px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.28)_0%,rgba(255,80,0,0.12)_38%,transparent_68%)] blur-[90px] [animation-delay:2.4s]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(7,7,8,0.15)_0%,rgba(10,10,10,0.35)_45%,rgba(10,10,10,0.82)_100%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] opacity-[0.4] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:56px_56px]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.03)_48%,transparent_78%)]"
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
      <div class="flex h-[52px] shrink-0 items-center gap-2 border-b border-white/[0.08] bg-ds-black-200/40 px-3 backdrop-blur-sm">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/20 bg-white/[0.04] shadow-card-default"
        >
          <Wallet :size="18" :stroke-width="2" class="text-white" />
        </span>
        <span class="truncate text-[14px] font-semibold tracking-tight text-white">
          G-Finance
        </span>
        <button
          type="button"
          class="ml-auto rounded-[10px] p-1.5 text-white/80 hover:bg-white/[0.08] hover:text-white md:hidden"
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
          class="rounded-[10px] p-2 text-white/85 hover:bg-white/[0.08] hover:text-white md:hidden"
          aria-label="Buka menu"
          @click="sidebarOpen = true"
        >
          <Menu :size="20" />
        </button>

        <h1 class="min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight tracking-[-0.01em] text-white">
          {{ pageTitle }}
        </h1>

        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-white/25 bg-white/[0.06] px-3 py-2 text-[13px] font-medium text-white shadow-card-default backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background-base"
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
