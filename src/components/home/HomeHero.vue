<script setup>
import { ArrowRight, Sparkles, TrendingUp, Wallet } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <section
    class="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-background-base text-text-primary"
    aria-labelledby="hero-heading"
  >
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_15%_60%,#FF4500_0%,transparent_42%),radial-gradient(ellipse_at_85%_40%,#6A0DAD_0%,transparent_48%),#0A0A0A]"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -left-[20%] top-[20%] h-[min(90vw,720px)] w-[min(90vw,720px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,80,0,0.38)_0%,transparent_68%)] blur-3xl"
      aria-hidden="true"
    />
    <div
      class="animate-glow-pulse pointer-events-none absolute -right-[15%] bottom-[10%] h-[min(85vw,680px)] w-[min(85vw,680px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(138,47,201,0.42)_0%,transparent_70%)] blur-3xl [animation-delay:2s]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(10,10,10,0)_0%,rgba(10,10,10,0.5)_55%,#0A0A0A_100%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:64px_64px]"
      aria-hidden="true"
    />

    <header
      class="relative z-20 flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-ds-black-200/80 px-4 backdrop-blur-md sm:px-8"
    >
      <div class="flex items-center gap-2">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-default bg-background-overlay shadow-card-default"
        >
          <Wallet
            :size="20"
            :stroke-width="2"
            class="text-accent-primary"
            aria-hidden="true"
          />
        </span>
        <span class="text-[15px] font-semibold tracking-tight text-text-primary">
          {{ appStore.appName }}
        </span>
      </div>
      <nav
        class="flex items-center gap-2 sm:gap-3"
        aria-label="Akun"
      >
        <router-link
          to="/login"
          class="rounded-[10px] border border-white/25 px-4 py-2 text-[14px] font-medium text-text-primary transition-colors duration-180 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-base sm:px-5"
        >
          Masuk
        </router-link>
        <router-link
          to="/register"
          class="rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-4 py-2 text-[14px] font-semibold text-white shadow-button-orange transition-all duration-180 hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(255,80,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-base sm:px-5"
        >
          Daftar
        </router-link>
      </nav>
    </header>

    <div
      class="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-8 sm:px-6 lg:px-8"
    >
      <div
        class="pointer-events-none absolute left-[4%] top-[28%] hidden w-[200px] rotate-[-8deg] rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.06)] p-4 shadow-card-elevated backdrop-blur-xl xl:block"
        aria-hidden="true"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          Pemasukan
        </p>
        <p class="mt-2 font-mono text-[22px] font-bold tabular-nums tracking-tight text-text-primary">
          +12.4M
        </p>
        <div class="mt-3 flex h-12 items-end gap-1.5">
          <span
            class="w-2 rounded-sm bg-gradient-to-t from-ds-orange-200/20 to-ds-orange-200"
            style="height: 40%"
          />
          <span
            class="w-2 rounded-sm bg-gradient-to-t from-ds-orange-200/20 to-ds-orange-200"
            style="height: 65%"
          />
          <span
            class="w-2 rounded-sm bg-gradient-to-t from-ds-orange-200/20 to-ds-orange-200"
            style="height: 85%"
          />
          <span
            class="w-2 rounded-sm bg-gradient-to-t from-ds-orange-200/20 to-ds-orange-200"
            style="height: 55%"
          />
          <span
            class="w-2 rounded-sm bg-gradient-to-t from-ds-orange-200/20 to-ds-orange-200"
            style="height: 100%"
          />
        </div>
      </div>
      <div
        class="pointer-events-none absolute right-[5%] top-[32%] hidden w-[220px] rotate-[7deg] rounded-2xl border border-border-accent-purple bg-[linear-gradient(135deg,rgba(138,47,201,0.12)_0%,rgba(255,255,255,0.04)_100%)] p-4 shadow-glow-purple-ambient backdrop-blur-xl xl:block"
        aria-hidden="true"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-primary/15 text-accent-primary"
          >
            <TrendingUp :size="18" :stroke-width="2" aria-hidden="true" />
          </span>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Saldo wallet
            </p>
            <p class="font-mono text-lg font-bold tabular-nums text-text-primary">
              Rp 48.2M
            </p>
          </div>
        </div>
        <p class="mt-3 text-[13px] leading-relaxed text-text-secondary">
          3 wallet aktif
        </p>
      </div>

      <div class="relative mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-border-default bg-background-overlay px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary shadow-card-default"
        >
          <Sparkles
            :size="14"
            class="text-accent-primary"
            aria-hidden="true"
          />
          Manajemen keuangan pribadi
        </div>

        <h1
          id="hero-heading"
          class="max-w-4xl text-balance text-[2rem] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[48px]"
        >
          <span class="text-text-primary">Kendalikan </span>
          <span
            class="bg-gradient-to-r from-ds-orange-100 via-ds-orange-200 to-ds-purple-400 bg-clip-text text-transparent"
          >uangmu</span>
          <span class="text-text-primary">,</span>
          <br class="hidden sm:block" />
          <span class="text-text-primary">
            satu tempat untuk pemasukan &amp; pengeluaran.
          </span>
        </h1>

        <p
          class="mt-6 max-w-2xl text-[15px] leading-relaxed text-text-secondary sm:text-body-lg"
        >
          Lacak transaksi, kelola kategori dan wallet, dan baca laporan keuangan
          dari dashboard yang dirancang untuk cepat, tepat, dan fokus pada
          angka yang penting.
        </p>

        <div
          class="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4"
        >
          <router-link
            to="/register"
            class="group inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-7 py-3.5 text-[14px] font-semibold text-white shadow-button-orange transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-[0_6px_28px_rgba(255,80,0,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-base"
          >
            Daftar sekarang
            <ArrowRight
              :size="18"
              class="transition-transform duration-180 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </router-link>
          <router-link
            to="/login"
            class="inline-flex items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.08] px-7 py-3.5 text-[14px] font-semibold text-white/90 transition-colors duration-180 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background-base"
          >
            Masuk
          </router-link>
        </div>
      </div>
    </div>

    <div
      class="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-24 bg-gradient-to-t from-background-base to-transparent"
      aria-hidden="true"
    />
  </section>
</template>
