<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { Wallet } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const passwordMismatch = computed(
  () =>
    passwordConfirm.value.length > 0 &&
    password.value !== passwordConfirm.value
)

async function onSubmit() {
  errorMessage.value = ''
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = 'Kata sandi minimal 8 karakter.'
    return
  }

  submitting.value = true
  try {
    await auth.register({
      email: email.value.trim(),
      name: name.value.trim(),
      password: password.value,
    })
    await router.push({ name: 'login', query: { registered: '1' } })
  } catch (err) {
    const msg = err?.response?.data?.message
    const code = err?.response?.data?.error
    if (code === 'CONFLICT') {
      errorMessage.value = 'Email sudah terdaftar.'
    } else if (typeof msg === 'string') {
      errorMessage.value = msg
    } else {
      errorMessage.value = 'Pendaftaran gagal. Periksa data Anda.'
    }
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
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(138,47,201,0.22)_0%,transparent_50%),radial-gradient(ellipse_at_15%_85%,rgba(255,80,0,0.18)_0%,transparent_50%)]"
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
          Daftar akun
        </h1>
        <p class="mt-2 text-center text-body-sm text-text-secondary">
          Sudah punya akun?
          <router-link
            to="/login"
            class="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            Masuk
          </router-link>
        </p>

        <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
          <div v-if="errorMessage" role="alert" class="rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative">
            {{ errorMessage }}
          </div>

          <div>
            <label
              for="reg-name"
              class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
            >
              Nama
            </label>
            <input
              id="reg-name"
              v-model="name"
              type="text"
              autocomplete="name"
              required
              maxlength="255"
              class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
              placeholder="Nama tampilan"
            />
          </div>

          <div>
            <label
              for="reg-email"
              class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
            >
              Email
            </label>
            <input
              id="reg-email"
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
              for="reg-password"
              class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
            >
              Kata sandi
            </label>
            <input
              id="reg-password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              maxlength="128"
              class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div>
            <label
              for="reg-password-confirm"
              class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
            >
              Konfirmasi kata sandi
            </label>
            <input
              id="reg-password-confirm"
              v-model="passwordConfirm"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
              placeholder="Ulangi kata sandi"
            />
            <p v-if="passwordMismatch" class="mt-1 text-[12px] text-negative">
              Kata sandi tidak sama.
            </p>
          </div>

          <button
            type="submit"
            :disabled="submitting || passwordMismatch"
            class="mt-2 w-full rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-all duration-180 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ds-black-300"
          >
            {{ submitting ? 'Mendaftar…' : 'Daftar' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
