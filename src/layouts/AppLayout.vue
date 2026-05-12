<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  PiggyBank,
  Search,
  Settings,
  Tags,
  User,
  Wallet,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const sidebarOpen = ref(false)
const profileMenuOpen = ref(false)
const profileMenuRef = ref(null)

const pageTitle = computed(() => route.meta.title || 'Dashboard')

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/categories', label: 'Categories', icon: Tags },
  { to: '/app/wallets', label: 'Wallet', icon: Wallet },
  { to: '/app/budget', label: 'Budget', icon: PieChart },
  { to: '/app/allocations', label: 'Allocation', icon: PiggyBank },
  { to: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/app/profile', label: 'Profile', icon: User },
]

const userInitials = computed(() => {
  const name = auth.user?.name?.trim()
  if (!name) return 'GF'
  const parts = name.split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${second}`.toUpperCase() || 'GF'
})

function closeSidebar() {
  sidebarOpen.value = false
}

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}

function closeProfileMenu() {
  profileMenuOpen.value = false
}

function onDocumentClick(event) {
  if (!profileMenuOpen.value) return
  const el = profileMenuRef.value
  if (el && !el.contains(event.target)) {
    profileMenuOpen.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    profileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

async function handleLogout() {
  profileMenuOpen.value = false
  await auth.logout()
  await router.push({ name: 'login' })
}

function goProfile() {
  profileMenuOpen.value = false
  router.push({ name: 'app-profile' })
}
</script>

<template>
  <div
    class="relative min-h-[100dvh] overflow-hidden bg-background-base text-text-primary"
  >
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_70%_at_10%_55%,rgba(255,69,0,0.5)_0%,transparent_52%),radial-gradient(ellipse_85%_75%_at_92%_35%,rgba(106,13,173,0.45)_0%,transparent_52%),radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(255,85,0,0.2)_0%,transparent_55%),linear-gradient(125deg,transparent_35%,rgba(59,130,246,0.1)_48%,rgba(255,80,0,0.07)_52%,transparent_65%),#070708]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -left-[28%] top-[8%] h-[min(110vw,900px)] w-[min(110vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,80,0,0.6)_0%,rgba(255,80,0,0.18)_42%,transparent_72%)] blur-[100px]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -right-[22%] top-[5%] h-[min(95vw,820px)] w-[min(95vw,820px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(138,47,201,0.55)_0%,rgba(168,85,247,0.15)_45%,transparent_72%)] blur-[100px] [animation-delay:1.2s]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -bottom-[18%] left-[15%] h-[min(100vw,780px)] w-[min(100vw,780px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.26)_0%,rgba(255,80,0,0.12)_38%,transparent_68%)] blur-[90px] [animation-delay:2.4s]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(7,7,8,0.15)_0%,rgba(10,10,10,0.4)_45%,rgba(10,10,10,0.85)_100%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:56px_56px]"
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
          'fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-white/[0.08] bg-ds-black-200/85 shadow-sidebar backdrop-blur-xl transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ]"
        aria-label="Menu utama"
      >
        <div
          class="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-white/[0.08] bg-ds-black-200/40 px-4 backdrop-blur-sm"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 shadow-button-orange"
          >
            <Wallet
              :size="18"
              :stroke-width="2.25"
              class="text-white"
            />
          </span>
          <span
            class="truncate text-[15px] font-semibold tracking-tight text-white"
          >
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

        <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <p
            class="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-text-tertiary/70"
          >
            Main
          </p>
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
            active-class="!bg-[rgba(255,80,0,0.14)] !text-text-primary [&_svg]:!text-accent-primary"
            @click="closeSidebar"
          >
            <component
              :is="item.icon"
              :size="17"
              :stroke-width="2"
              class="shrink-0 text-white/55 transition-colors group-hover:text-white"
            />
            <span class="truncate">{{ item.label }}</span>
          </router-link>
        </nav>

        <div
          class="m-3 rounded-[12px] border border-[rgba(255,80,0,0.25)] bg-gradient-to-br from-[rgba(255,80,0,0.18)] to-[rgba(255,80,0,0.06)] p-3.5"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-ds-orange-300">
            Tips
          </p>
          <p class="mt-1 text-[12.5px] leading-snug text-text-secondary">
            Tetapkan budget bulanan supaya pengeluaran kamu tetap terkendali.
          </p>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col md:ml-0">
        <header
          class="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-white/[0.08] bg-ds-black-200/80 px-4 backdrop-blur-xl sm:px-6"
        >
          <button
            type="button"
            class="rounded-[10px] p-2 text-white/85 hover:bg-white/[0.08] hover:text-white md:hidden"
            aria-label="Buka menu"
            @click="sidebarOpen = true"
          >
            <Menu :size="20" />
          </button>

          <h1
            class="hidden min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight tracking-[-0.01em] text-white md:block"
          >
            {{ pageTitle }}
          </h1>
          <h1
            class="min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-white md:hidden"
          >
            {{ pageTitle }}
          </h1>

          <button
            type="button"
            class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-text-secondary transition-colors hover:border-white/15 hover:bg-white/[0.08] hover:text-text-primary sm:inline-flex"
            aria-label="Cari"
          >
            <Search
              :size="16"
              :stroke-width="2"
            />
          </button>

          <button
            type="button"
            class="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-text-secondary transition-colors hover:border-white/15 hover:bg-white/[0.08] hover:text-text-primary"
            aria-label="Notifikasi"
          >
            <Bell
              :size="16"
              :stroke-width="2"
            />
            <span
              class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(255,80,0,0.7)]"
              aria-hidden="true"
            />
          </button>

          <div
            ref="profileMenuRef"
            class="relative"
          >
            <button
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-1.5 pl-1.5 pr-2.5 text-[13px] font-medium text-text-primary transition-colors hover:border-white/15 hover:bg-white/[0.08]"
              :aria-expanded="profileMenuOpen"
              aria-haspopup="menu"
              aria-label="Profil pengguna"
              @click="toggleProfileMenu"
            >
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 text-[10px] font-bold text-white shadow-[0_0_0_2px_rgba(255,255,255,0.08)]"
              >
                {{ userInitials }}
              </span>
              <span class="hidden max-w-[100px] truncate text-[13px] lg:inline">{{
                auth.user?.name || 'Pengguna'
              }}</span>
              <ChevronDown
                :size="14"
                :stroke-width="2"
                class="hidden shrink-0 text-text-tertiary transition-transform sm:inline"
                :class="{ 'rotate-180': profileMenuOpen }"
              />
            </button>

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div
                v-if="profileMenuOpen"
                role="menu"
                class="absolute right-0 top-[calc(100%+8px)] w-[240px] overflow-hidden rounded-[14px] border border-white/[0.1] bg-ds-black-300/98 shadow-card-elevated backdrop-blur-xl"
              >
                <div class="border-b border-white/[0.06] px-4 py-3">
                  <p
                    class="truncate text-[14px] font-semibold text-text-primary"
                  >
                    {{ auth.user?.name || 'Pengguna' }}
                  </p>
                  <p class="mt-0.5 truncate text-[12px] text-text-tertiary">
                    {{ auth.user?.email || '—' }}
                  </p>
                </div>
                <div class="py-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                    @click="goProfile"
                  >
                    <User
                      :size="15"
                      :stroke-width="2"
                    />
                    <span>Profil saya</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                    @click="closeProfileMenu"
                  >
                    <Settings
                      :size="15"
                      :stroke-width="2"
                    />
                    <span>Pengaturan</span>
                  </button>
                  <div class="my-1 h-px bg-white/[0.06]" />
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-negative transition-colors hover:bg-negative/10"
                    @click="handleLogout"
                  >
                    <LogOut
                      :size="15"
                      :stroke-width="2"
                    />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </header>

        <main class="relative flex-1 p-4 sm:p-6 md:px-8 md:py-7">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>
