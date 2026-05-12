<script setup>
import { computed, ref, watch } from 'vue'

import { Loader2, Plus } from 'lucide-vue-next'

import WalletCard from '@/components/wallets/WalletCard.vue'
import WalletFormModal from '@/components/wallets/WalletFormModal.vue'
import WalletTransferModal from '@/components/wallets/WalletTransferModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { WALLET_TYPE_TABS } from '@/constants/walletTypes'
import { walletTransfer } from '@/services/transactions'
import {
  createWallet,
  deleteWallet,
  listWallets,
  updateWallet,
} from '@/services/wallets'
import { normalizeUserFacingApiError } from '@/utils/normalizeUserFacingApiError'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const activeWalletTypeTabId = ref(WALLET_TYPE_TABS[0].id)

const walletRecords = ref([])
const isWalletListLoading = ref(false)
const walletListErrorMessage = ref('')

const isFormModalOpen = ref(false)
const formModalMode = ref('create')
const walletBeingEdited = ref(null)
const isFormSubmitting = ref(false)
const formModalApiError = ref('')

const walletPendingDeletion = ref(null)
const isDeleteSubmitting = ref(false)

const activeTogglePendingWalletId = ref(null)

const isTransferModalOpen = ref(false)
const transferSourceWallet = ref(null)
const transferDestinationWalletRecords = ref([])
const isTransferDestinationsLoading = ref(false)
const isTransferSubmitting = ref(false)
const transferModalApiError = ref('')

const selectedWalletTypeTab = computed(() =>
  WALLET_TYPE_TABS.find((tabConfig) => tabConfig.id === activeWalletTypeTabId.value)
)

const defaultWalletTypeForModal = computed(() => {
  const apiType = selectedWalletTypeTab.value?.apiType
  if (apiType === 'bank') return 'bank'
  if (apiType === 'e-wallet') return 'e-wallet'
  return 'cash'
})

const canQueryWalletList = computed(
  () => !!selectedWalletTypeTab.value?.apiType
)

const canCreateWalletForCurrentTab = computed(
  () => !!selectedWalletTypeTab.value?.apiType
)

const deleteConfirmMessage = computed(() => {
  if (!walletPendingDeletion.value) return ''
  const walletName = walletPendingDeletion.value.name
  return `Wallet "${walletName}" akan dihapus permanen. Data ini tidak dapat dikembalikan.`
})

async function loadWalletList() {
  const tab = selectedWalletTypeTab.value
  if (!tab?.apiType) {
    walletRecords.value = []
    isWalletListLoading.value = false
    walletListErrorMessage.value = ''
    return
  }

  isWalletListLoading.value = true
  walletListErrorMessage.value = ''
  try {
    const { data } = await listWallets({
      type: tab.apiType,
    })
    const records = Array.isArray(data) ? data : (data.data ?? [])
    walletRecords.value = records.map((record) => ({
      ...record,
      isActive: Boolean(record.isActive),
    }))
  } catch (error) {
    walletListErrorMessage.value = normalizeUserFacingApiError(
      error,
      'Gagal memuat daftar wallet.'
    )
    walletRecords.value = []
  } finally {
    isWalletListLoading.value = false
  }
}

watch(activeWalletTypeTabId, loadWalletList, { immediate: true })

function openCreateWalletModal() {
  if (!canCreateWalletForCurrentTab.value) return
  formModalApiError.value = ''
  formModalMode.value = 'create'
  walletBeingEdited.value = null
  isFormModalOpen.value = true
}

function openEditWalletModal(wallet) {
  formModalApiError.value = ''
  formModalMode.value = 'edit'
  walletBeingEdited.value = { ...wallet }
  isFormModalOpen.value = true
}

function closeFormModal() {
  if (isFormSubmitting.value) return
  isFormModalOpen.value = false
  formModalApiError.value = ''
}

async function onFormModalSubmit(payload) {
  formModalApiError.value = ''
  isFormSubmitting.value = true
  try {
    if (payload.mode === 'create') {
      await createWallet(payload.body)
      toast.success('Wallet berhasil ditambahkan.')
    } else {
      await updateWallet(payload.id, payload.body)
      toast.success('Wallet berhasil diperbarui.')
    }
    isFormModalOpen.value = false
    await loadWalletList()
  } catch (error) {
    const errorMessage = normalizeUserFacingApiError(
      error,
      'Tidak dapat menyimpan wallet.'
    )
    formModalApiError.value = errorMessage
    toast.error(errorMessage)
  } finally {
    isFormSubmitting.value = false
  }
}

function requestDeleteWallet(wallet) {
  walletPendingDeletion.value = wallet
}

function closeDeleteConfirm() {
  if (isDeleteSubmitting.value) return
  walletPendingDeletion.value = null
}

async function confirmDeleteWallet() {
  if (!walletPendingDeletion.value) return
  isDeleteSubmitting.value = true
  walletListErrorMessage.value = ''
  try {
    await deleteWallet(walletPendingDeletion.value.id)
    walletPendingDeletion.value = null
    toast.success('Wallet berhasil dihapus.')
    await loadWalletList()
  } catch (error) {
    const errorMessage = normalizeUserFacingApiError(
      error,
      'Gagal menghapus wallet.'
    )
    toast.error(errorMessage)
  } finally {
    isDeleteSubmitting.value = false
  }
}

async function loadWalletsForTransferPicker() {
  isTransferDestinationsLoading.value = true
  transferModalApiError.value = ''
  try {
    const { data } = await listWallets({})
    const records = Array.isArray(data) ? data : (data.data ?? [])
    transferDestinationWalletRecords.value = records.map((record) => ({
      ...record,
      isActive: Boolean(record.isActive),
    }))
  } catch (error) {
    transferModalApiError.value = normalizeUserFacingApiError(
      error,
      'Gagal memuat daftar wallet untuk transfer.',
    )
    transferDestinationWalletRecords.value = []
  } finally {
    isTransferDestinationsLoading.value = false
  }
}

function openTransferModal(wallet) {
  transferModalApiError.value = ''
  transferSourceWallet.value = { ...wallet }
  isTransferModalOpen.value = true
  loadWalletsForTransferPicker()
}

function closeTransferModal() {
  if (isTransferSubmitting.value) return
  isTransferModalOpen.value = false
  transferSourceWallet.value = null
  transferModalApiError.value = ''
}

async function onTransferModalSubmit(payload) {
  transferModalApiError.value = ''
  isTransferSubmitting.value = true
  try {
    await walletTransfer(payload)
    toast.success('Transfer wallet berhasil.')
    isTransferModalOpen.value = false
    transferSourceWallet.value = null
    await loadWalletList()
  } catch (error) {
    const errorMessage = normalizeUserFacingApiError(
      error,
      'Transfer wallet gagal.',
    )
    transferModalApiError.value = errorMessage
    toast.error(errorMessage)
  } finally {
    isTransferSubmitting.value = false
  }
}

async function handleWalletActiveChange(wallet, requestedIsActive) {
  activeTogglePendingWalletId.value = wallet.id
  try {
    await updateWallet(wallet.id, { isActive: requestedIsActive })
    const recordIndex = walletRecords.value.findIndex(
      (record) => record.id === wallet.id
    )
    if (recordIndex !== -1) {
      walletRecords.value[recordIndex] = {
        ...walletRecords.value[recordIndex],
        isActive: requestedIsActive,
      }
    }
    toast.success(
      requestedIsActive
        ? 'Wallet berhasil diaktifkan.'
        : 'Wallet berhasil dinonaktifkan.'
    )
  } catch (error) {
    const errorMessage = normalizeUserFacingApiError(
      error,
      'Tidak dapat memperbarui status wallet.'
    )
    toast.error(errorMessage)
    await loadWalletList()
  } finally {
    activeTogglePendingWalletId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0 flex-1">
        <p class="text-[13px] text-text-secondary">
          Kelola sumber dana Anda. Filter menurut tipe wallet.
        </p>
        <div
          class="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:pb-0 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter tipe wallet"
        >
          <button
            v-for="tab in WALLET_TYPE_TABS"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeWalletTypeTabId === tab.id"
            class="shrink-0 rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-base"
            :class="
              activeWalletTypeTabId === tab.id
                ? tab.activeStyle === 'purple'
                  ? 'border-border-accent-purple bg-[rgba(138,47,201,0.12)] text-text-primary shadow-glow-purple-ambient'
                  : 'border-border-accent-orange bg-[rgba(255,80,0,0.12)] text-text-primary shadow-card-orange-active'
                : 'border-border-default bg-ds-black-400/70 text-text-secondary hover:border-white/12 hover:bg-ds-black-400 hover:text-text-primary'
            "
            @click="activeWalletTypeTabId = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        :disabled="!canCreateWalletForCurrentTab"
        @click="openCreateWalletModal"
      >
        <Plus :size="18" :stroke-width="2" />
        Tambah wallet
      </button>
    </div>

    <div
      v-if="walletListErrorMessage"
      role="alert"
      class="rounded-[14px] border border-negative/40 bg-negative/10 px-4 py-3 text-[13px] text-negative"
    >
      {{ walletListErrorMessage }}
    </div>

    <div
      v-if="isWalletListLoading && canQueryWalletList"
      class="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[14px] border border-border-default bg-background-surface/90 py-16"
    >
      <Loader2
        class="h-9 w-9 animate-spin text-accent-primary"
        :stroke-width="2"
      />
      <p class="text-[13px] text-text-tertiary">Memuat wallet…</p>
    </div>

    <div
      v-else-if="canQueryWalletList && !walletRecords.length"
      class="rounded-[14px] border border-dashed border-border-default bg-background-surface/80 px-6 py-14 text-center"
    >
      <p class="text-[15px] font-medium text-text-primary">
        Belum ada wallet
      </p>
      <p class="mt-2 text-[13px] text-text-secondary">
        Tambah wallet pertama untuk tipe ini.
      </p>
    </div>

    <div
      v-else-if="canQueryWalletList && walletRecords.length"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <WalletCard
        v-for="wallet in walletRecords"
        :key="wallet.id"
        :wallet="wallet"
        :active-toggle-pending-wallet-id="activeTogglePendingWalletId"
        @edit="openEditWalletModal"
        @transfer="openTransferModal"
        @delete="requestDeleteWallet"
        @request-active-change="handleWalletActiveChange"
      />
    </div>

    <WalletFormModal
      :open="isFormModalOpen"
      :mode="formModalMode"
      :wallet="walletBeingEdited"
      :default-wallet-type="defaultWalletTypeForModal"
      :submitting="isFormSubmitting"
      :api-error="formModalApiError"
      @close="closeFormModal"
      @submit="onFormModalSubmit"
    />

    <WalletTransferModal
      :open="isTransferModalOpen"
      :from-wallet="transferSourceWallet"
      :destination-wallets="transferDestinationWalletRecords"
      :loading-destinations="isTransferDestinationsLoading"
      :submitting="isTransferSubmitting"
      :api-error="transferModalApiError"
      @close="closeTransferModal"
      @submit="onTransferModalSubmit"
    />

    <ConfirmDialog
      :open="!!walletPendingDeletion"
      title="Hapus wallet?"
      :message="deleteConfirmMessage"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="isDeleteSubmitting"
      @close="closeDeleteConfirm"
      @confirm="confirmDeleteWallet"
    />
  </div>
</template>
