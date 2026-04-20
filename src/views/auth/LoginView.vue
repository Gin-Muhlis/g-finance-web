<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { Check, Wallet } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

const showRegisteredNotice = computed(
  () => route.query.registered === '1'
)

async function onSubmit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await auth.login({
      email: email.value.trim(),
      password: password.value,
      rememberMe: rememberMe.value,
    })
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/app/dashboard'
    await router.replace(redirect)
  } catch (err) {
    const msg = err?.response?.data?.message
    errorMessage.value =
      typeof msg === 'string' ? msg : 'Email atau kata sandi tidak valid.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div
    class="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-background-base px-4 py-12"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,80,0,0.2)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(138,47,201,0.18)_0%,transparent_50%)]"
      aria-hidden="true"
    />

    <div class="relative z-10 w-full max-w-[400px]">
      <router-link
        to="/"
        class="mb-8 flex items-center justify-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
      >
        <span
          class="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-default bg-background-overlay shadow-card-default"
        >
          <Wallet :size="22" :stroke-width="2" class="text-accent-primary" />
        </span>
        <span class="text-[15px] font-semibold tracking-tight text-text-primary">
          G-Finance
        </span>
      </router-link>

      <div
        class="rounded-[18px] border border-border-default bg-ds-black-300/90 p-8 shadow-card-elevated backdrop-blur-md"
      >
        <h1 class="text-center text-[22px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
          Masuk
        </h1>
        <p class="mt-2 text-center text-body-sm text-text-secondary">
          Belum punya akun?
          <router-link
            to="/register"
            class="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            Daftar
          </router-link>
        </p>

        <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
          <div
            v-if="showRegisteredNotice"
            role="status"
            class="rounded-md border border-positive/35 bg-positive/10 px-3 py-2 text-[13px] text-positive"
          >
            Pendaftaran berhasil. Silakan masuk dengan akun Anda.
          </div>
          <div v-if="errorMessage" role="alert" class="rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative">
            {{ errorMessage }}
          </div>

          <div>
            <label
              for="login-email"
              class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
            >
              Email
            </label>
            <input
              id="login-email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label
              for="login-password"
              class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
            >
              Kata sandi
            </label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
              placeholder="••••••••"
            />
          </div>

          <div class="flex items-center gap-3 pt-1">
            <label
              for="login-remember"
              class="flex cursor-pointer select-none items-center gap-2"
            >
              <input
                id="login-remember"
                v-model="rememberMe"
                type="checkbox"
                class="peer sr-only"
              />
              <span
                class="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[5px] border-2 border-accent-primary bg-transparent transition-[box-shadow,background-color] peer-focus-visible:shadow-[0_0_0_3px_rgba(255,80,0,0.25)] peer-focus-visible:outline-none peer-checked:bg-accent-primary/15"
                aria-hidden="true"
              >
                <Check
                  v-show="rememberMe"
                  :size="12"
                  :stroke-width="2"
                  class="text-accent-primary"
                />
              </span>
              <span class="text-[13px] text-text-secondary">
                Ingat saya
              </span>
            </label>
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="mt-2 w-full rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-all duration-180 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ds-black-300"
          >
            {{ submitting ? 'Memproses…' : 'Masuk' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
