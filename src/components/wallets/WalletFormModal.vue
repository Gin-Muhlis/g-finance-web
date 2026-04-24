<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { ChevronDown, X } from 'lucide-vue-next'

import { WALLET_FINANCE_ICON_NAMES } from '@/constants/walletFinanceIconNames'
import { formatIndonesianRupiah } from '@/utils/formatIndonesianRupiah'
import { getCategoryIconComponent } from '@/utils/categoryIconMap'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  wallet: { type: Object, default: null },
  defaultWalletType: { type: String, default: 'cash' },
  submitting: { type: Boolean, default: false },
  apiError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const walletName = ref('')
const walletType = ref('cash')
const balanceDigitsOnly = ref('')
const walletIconName = ref('Wallet')
const validationErrorMessage = ref('')

const modalTitle = computed(() =>
  props.mode === 'create' ? 'Tambah wallet' : 'Edit wallet'
)

const formattedBalanceForDisplay = computed(() => {
  const balanceStringForApi = normalizeBalanceDigitsForApi(balanceDigitsOnly.value)
  return formatIndonesianRupiah(Number(balanceStringForApi))
})

function normalizeDefaultWalletType(defaultTypeValue) {
  if (
    defaultTypeValue === 'cash' ||
    defaultTypeValue === 'bank' ||
    defaultTypeValue === 'e-wallet'
  ) {
    return defaultTypeValue
  }
  return 'cash'
}

function walletTypeDisplayLabel(walletTypeValue) {
  if (walletTypeValue === 'cash') return 'Tunai'
  if (walletTypeValue === 'bank') return 'Rekening bank'
  if (walletTypeValue === 'e-wallet') return 'Dompet digital'
  return walletTypeValue || '—'
}

function normalizeBalanceDigitsForApi(digitsOnly) {
  const cleaned = String(digitsOnly ?? '').replace(/\D/g, '')
  if (cleaned === '') {
    return '0'
  }
  const withoutLeadingZeros = cleaned.replace(/^0+(?=\d)/, '')
  return withoutLeadingZeros === '' ? '0' : withoutLeadingZeros
}

function balanceDigitsFromServerValue(balanceValue) {
  if (balanceValue === null || balanceValue === undefined) {
    return ''
  }
  return String(balanceValue).replace(/\D/g, '')
}

function resolveStoredWalletIconName(iconFromServer) {
  if (
    typeof iconFromServer === 'string' &&
    WALLET_FINANCE_ICON_NAMES.includes(iconFromServer)
  ) {
    return iconFromServer
  }
  return 'Wallet'
}

function resetForm() {
  walletName.value = ''
  walletType.value = normalizeDefaultWalletType(props.defaultWalletType)
  balanceDigitsOnly.value = ''
  walletIconName.value = 'Wallet'
  validationErrorMessage.value = ''
}

function loadFromWallet() {
  if (!props.wallet) return
  walletName.value = props.wallet.name ?? ''
  walletType.value = normalizeDefaultWalletType(props.wallet.type)
  balanceDigitsOnly.value = balanceDigitsFromServerValue(props.wallet.balance)
  walletIconName.value = resolveStoredWalletIconName(props.wallet.icon)
  validationErrorMessage.value = ''
}

watch(
  () => [props.open, props.mode, props.wallet?.id],
  async () => {
    if (!props.open) {
      validationErrorMessage.value = ''
      return
    }
    await nextTick()
    if (props.mode === 'edit' && props.wallet?.id) {
      loadFromWallet()
    } else if (props.mode === 'create') {
      resetForm()
      walletType.value = normalizeDefaultWalletType(props.defaultWalletType)
    }
  }
)

function closeModal() {
  if (props.submitting) return
  emit('close')
}

function onBalanceAmountInput(event) {
  const digits = event.target.value.replace(/\D/g, '')
  balanceDigitsOnly.value = digits
}

function onBalanceBeforeInput(event) {
  const inputType = event.inputType ?? ''
  if (
    inputType === 'deleteContentBackward' ||
    inputType === 'deleteContentForward' ||
    inputType === 'deleteByCut' ||
    inputType === 'historyUndo' ||
    inputType === 'historyRedo'
  ) {
    return
  }
  if (inputType === 'insertFromPaste' || inputType === 'insertFromDrag') {
    return
  }
  const insertedText = event.data
  if (
    insertedText != null &&
    typeof insertedText === 'string' &&
    insertedText.length > 0 &&
    !/^\d+$/.test(insertedText)
  ) {
    event.preventDefault()
  }
}

function onBalanceKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return
  }
  const allowedNonCharacterKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (allowedNonCharacterKeys.includes(event.key)) {
    return
  }
  if (event.key.length === 1 && /\d/.test(event.key)) {
    return
  }
  event.preventDefault()
}

function iconButtonClass(isActive) {
  return [
    'flex h-10 w-10 items-center justify-center rounded-[10px] border transition-colors',
    isActive
      ? 'border-accent-primary bg-accent-primary/15 shadow-card-orange-active'
      : 'border-border-default bg-ds-black-400/50 hover:border-white/15 hover:bg-white/[0.04]',
  ]
}

function submitForm() {
  validationErrorMessage.value = ''
  const trimmedName = walletName.value.trim()
  if (!trimmedName) {
    validationErrorMessage.value = 'Nama wajib diisi.'
    return
  }

  if (!WALLET_FINANCE_ICON_NAMES.includes(walletIconName.value)) {
    validationErrorMessage.value = 'Pilih ikon dari daftar yang tersedia.'
    return
  }

  const balanceDigitString = normalizeBalanceDigitsForApi(balanceDigitsOnly.value)
  const balanceNumericForApi = Number(balanceDigitString)
  if (!Number.isFinite(balanceNumericForApi) || balanceNumericForApi < 0) {
    validationErrorMessage.value = 'Saldo tidak valid.'
    return
  }

  if (props.mode === 'create') {
    emit('submit', {
      mode: 'create',
      body: {
        name: trimmedName,
        type: walletType.value,
        balance: balanceNumericForApi,
        icon: walletIconName.value,
        isActive: true,
      },
    })
  } else {
    emit('submit', {
      mode: 'edit',
      id: props.wallet.id,
      body: {
        name: trimmedName,
        balance: balanceNumericForApi,
        icon: walletIconName.value,
      },
    })
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'wallet-modal-title'"
    >
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="closeModal"
      />
      <div
        class="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-[440px] flex-col rounded-t-[18px] border border-border-default bg-ds-black-300/98 shadow-card-elevated sm:rounded-[18px]"
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4"
        >
          <h2
            id="wallet-modal-title"
            class="text-[18px] font-semibold tracking-[-0.01em] text-text-primary"
          >
            {{ modalTitle }}
          </h2>
          <button
            type="button"
            class="rounded-[10px] p-2 text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-text-primary disabled:opacity-40"
            :disabled="submitting"
            aria-label="Tutup"
            @click="closeModal"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div
            v-if="apiError"
            role="alert"
            class="mb-4 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ apiError }}
          </div>
          <div
            v-if="validationErrorMessage"
            role="alert"
            class="mb-4 rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-[13px] text-negative"
          >
            {{ validationErrorMessage }}
          </div>

          <div class="space-y-4">
            <div>
              <label
                for="wallet-name"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Nama
              </label>
              <input
                id="wallet-name"
                v-model="walletName"
                type="text"
                maxlength="255"
                class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[14px] text-text-primary placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
                placeholder="Contoh: Rekening utama"
                :disabled="submitting"
              />
            </div>

            <div v-if="mode === 'create'">
              <label
                for="wallet-type"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Tipe wallet
              </label>
              <div class="relative">
                <select
                  id="wallet-type"
                  v-model="walletType"
                  class="w-full cursor-pointer appearance-none rounded-[8px] border border-border-default bg-ds-black-400/90 py-[10px] pl-[14px] pr-11 text-[14px] text-text-primary shadow-none accent-accent-primary [color-scheme:dark] focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="submitting"
                >
                  <option
                    class="bg-ds-black-400 text-text-primary"
                    value="cash"
                  >
                    Tunai
                  </option>
                  <option
                    class="bg-ds-black-400 text-text-primary"
                    value="bank"
                  >
                    Rekening bank
                  </option>
                  <option
                    class="bg-ds-black-400 text-text-primary"
                    value="e-wallet"
                  >
                    Dompet digital
                  </option>
                </select>
                <span
                  class="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-tertiary"
                  aria-hidden="true"
                >
                  <ChevronDown :size="18" :stroke-width="2" />
                </span>
              </div>
            </div>
            <div
              v-else
              class="rounded-[8px] border border-border-default bg-ds-black-400/70 px-[14px] py-2.5"
            >
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Tipe wallet
              </p>
              <p class="mt-1 text-[14px] text-text-primary">
                {{ walletTypeDisplayLabel(walletType) }}
              </p>
            </div>

            <div>
              <p
                class="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Ikon
              </p>
              <div
                class="grid max-h-[200px] grid-cols-5 gap-2 overflow-y-auto rounded-[10px] border border-border-default bg-ds-black-400/40 p-2 sm:grid-cols-6"
              >
                <button
                  v-for="iconName in WALLET_FINANCE_ICON_NAMES"
                  :key="iconName"
                  type="button"
                  :class="iconButtonClass(walletIconName === iconName)"
                  :disabled="submitting"
                  :title="iconName"
                  @click="walletIconName = iconName"
                >
                  <component
                    :is="getCategoryIconComponent(iconName)"
                    :size="18"
                    :stroke-width="2"
                    class="text-text-primary"
                  />
                </button>
              </div>
            </div>

            <div>
              <label
                for="wallet-balance"
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                Saldo (IDR)
              </label>
              <input
                id="wallet-balance"
                :value="formattedBalanceForDisplay"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                class="w-full rounded-[8px] border border-border-default bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] font-mono text-[14px] text-text-primary tabular-nums placeholder:text-text-disabled focus:border-[rgba(255,80,0,0.6)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,80,0,0.15)]"
                placeholder="Rp0"
                :disabled="submitting"
                @beforeinput="onBalanceBeforeInput"
                @keydown="onBalanceKeydown"
                @input="onBalanceAmountInput"
              />
            </div>
          </div>
        </div>

        <div class="flex shrink-0 gap-3 border-t border-white/[0.06] px-5 py-4">
          <button
            type="button"
            class="flex-1 rounded-[10px] border border-border-default bg-transparent py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-white/[0.06]"
            :disabled="submitting"
            @click="closeModal"
          >
            Batal
          </button>
          <button
            type="button"
            class="flex-1 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 py-2.5 text-[14px] font-semibold text-white shadow-button-orange disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="submitting"
            @click="submitForm"
          >
            {{
              submitting
                ? 'Menyimpan…'
                : mode === 'create'
                  ? 'Simpan'
                  : 'Perbarui'
            }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
select#wallet-type option {
  background-color: #1c1c1c;
  color: #ffffff;
}

select#wallet-type option:checked {
  background-color: rgba(255, 80, 0, 0.28);
  color: #ffffff;
}
</style>
