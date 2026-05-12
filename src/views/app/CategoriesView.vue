<script setup>
import { computed, ref, watch } from 'vue'

import { Loader2, Plus } from 'lucide-vue-next'

import CategoryCard from '@/components/categories/CategoryCard.vue'
import CategoryFormModal from '@/components/categories/CategoryFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { CATEGORY_TYPE_TABS } from '@/constants/categoryTypes'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/services/categories'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const activeTab = ref('income')
const page = ref(1)

const items = ref([])
const meta = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
})
const loading = ref(false)
const listError = ref('')

const modalOpen = ref(false)
const modalMode = ref('create')
const editingCategory = ref(null)
const modalSubmitting = ref(false)
const formApiError = ref('')

const categoryToDelete = ref(null)
const deleteSubmitting = ref(false)

const currentTab = computed(() =>
  CATEGORY_TYPE_TABS.find((tabConfig) => tabConfig.id === activeTab.value)
)

const defaultTypeForModal = computed(() => {
  const currentApiType = currentTab.value?.apiType
  if (currentApiType === 'income') return 'income'
  return 'expense'
})

const canUseApi = computed(() => !!currentTab.value?.apiType)

const canCreate = computed(() => !!currentTab.value?.apiType)

const deleteConfirmMessage = computed(() => {
  if (!categoryToDelete.value) return ''
  const categoryName = categoryToDelete.value.name
  return `Kategori "${categoryName}" akan dihapus permanen. Data ini tidak dapat dikembalikan.`
})

watch(activeTab, () => {
  page.value = 1
})

async function loadCategories() {
  const tab = currentTab.value
  if (!tab?.apiType) {
    items.value = []
    meta.value = { page: 1, limit: 12, total: 0, totalPages: 0 }
    loading.value = false
    listError.value = ''
    return
  }

  loading.value = true
  listError.value = ''
  try {
    const { data } = await listCategories({
      page: page.value,
      limit: 12,
      type: tab.apiType,
    })
    items.value = data.data ?? []
    meta.value = data.meta ?? {
      page: page.value,
      limit: 12,
      total: 0,
      totalPages: 0,
    }
  } catch (error) {
    listError.value =
      error?.response?.data?.message || 'Gagal memuat daftar kategori.'
    items.value = []
  } finally {
    loading.value = false
  }
}

watch([page, activeTab], loadCategories, { immediate: true })

function openCreate() {
  if (!canCreate.value) return
  formApiError.value = ''
  modalMode.value = 'create'
  editingCategory.value = null
  modalOpen.value = true
}

function openEdit(category) {
  formApiError.value = ''
  modalMode.value = 'edit'
  editingCategory.value = { ...category }
  modalOpen.value = true
}

function closeModal() {
  if (modalSubmitting.value) return
  modalOpen.value = false
  formApiError.value = ''
}

async function onModalSubmit(payload) {
  formApiError.value = ''
  modalSubmitting.value = true
  try {
    if (payload.mode === 'create') {
      await createCategory(payload.body)
      toast.success('Kategori berhasil ditambahkan.')
    } else {
      await updateCategory(payload.id, payload.body)
      toast.success('Kategori berhasil diperbarui.')
    }
    modalOpen.value = false
    await loadCategories()
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || 'Tidak dapat menyimpan kategori.'
    formApiError.value = errorMessage
    toast.error(errorMessage)
  } finally {
    modalSubmitting.value = false
  }
}

function requestDelete(category) {
  categoryToDelete.value = category
}

function closeDeleteConfirm() {
  if (deleteSubmitting.value) return
  categoryToDelete.value = null
}

async function confirmDelete() {
  if (!categoryToDelete.value) return
  deleteSubmitting.value = true
  listError.value = ''
  try {
    await deleteCategory(categoryToDelete.value.id)
    categoryToDelete.value = null
    toast.success('Kategori berhasil dihapus.')
    await loadCategories()
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || 'Gagal menghapus kategori.'
    toast.error(errorMessage)
  } finally {
    deleteSubmitting.value = false
  }
}

function goPrev() {
  if (page.value > 1) page.value -= 1
}

function goNext() {
  if (page.value < meta.value.totalPages) page.value += 1
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0 flex-1">
        <p class="text-[13px] text-text-secondary">
          Kelompokkan transaksi dengan kategori. Filter menurut tipe.
        </p>
        <div
          class="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:pb-0 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter tipe kategori"
        >
          <button
            v-for="tab in CATEGORY_TYPE_TABS"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            class="shrink-0 rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-base"
            :class="
              activeTab === tab.id
                ? 'border-border-accent-orange bg-[rgba(255,80,0,0.12)] text-text-primary shadow-card-orange-active'
                : 'border-border-default bg-ds-black-400/70 text-text-secondary hover:border-white/12 hover:bg-ds-black-400 hover:text-text-primary'
            "
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-ds-orange-100 to-ds-orange-300 px-5 py-2.5 text-[14px] font-semibold text-white shadow-button-orange transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        :disabled="!canCreate"
        @click="openCreate"
      >
        <Plus :size="18" :stroke-width="2" />
        Tambah kategori
      </button>
    </div>

    <div
      v-if="listError"
      role="alert"
      class="rounded-[14px] border border-negative/40 bg-negative/10 px-4 py-3 text-[13px] text-negative"
    >
      {{ listError }}
    </div>

    <div
      v-if="loading && canUseApi"
      class="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[14px] border border-border-default bg-background-surface/90 py-16"
    >
      <Loader2
        class="h-9 w-9 animate-spin text-accent-primary"
        :stroke-width="2"
      />
      <p class="text-[13px] text-text-tertiary">Memuat kategori…</p>
    </div>

    <div
      v-else-if="canUseApi && !items.length"
      class="rounded-[14px] border border-dashed border-border-default bg-background-surface/80 px-6 py-14 text-center"
    >
      <p class="text-[15px] font-medium text-text-primary">
        Belum ada kategori
      </p>
      <p class="mt-2 text-[13px] text-text-secondary">
        Tambah kategori pertama untuk tipe ini.
      </p>
    </div>

    <div
      v-else-if="canUseApi && items.length"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <CategoryCard
        v-for="category in items"
        :key="category.id"
        :category="category"
        @edit="openEdit"
        @delete="requestDelete"
      />
    </div>

    <div
      v-if="canUseApi && meta.totalPages > 0"
      class="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row"
    >
      <p class="text-[13px] text-text-tertiary">
        Menampilkan
        <span class="font-mono tabular-nums text-text-secondary">{{
          items.length ? (meta.page - 1) * meta.limit + 1 : 0
        }}</span>
        –
        <span class="font-mono tabular-nums text-text-secondary">{{
          Math.min(meta.page * meta.limit, meta.total)
        }}</span>
        dari
        <span class="font-mono tabular-nums text-text-secondary">{{
          meta.total
        }}</span>
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-[10px] border border-border-default bg-ds-black-400/80 px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-white/15 hover:bg-ds-black-400 disabled:cursor-not-allowed disabled:opacity-35"
          :disabled="page <= 1 || loading"
          @click="goPrev"
        >
          Sebelumnya
        </button>
        <span class="min-w-[5rem] text-center font-mono text-[13px] tabular-nums text-text-secondary">
          {{ meta.page }} / {{ meta.totalPages }}
        </span>
        <button
          type="button"
          class="rounded-[10px] border border-border-default bg-ds-black-400/80 px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-white/15 hover:bg-ds-black-400 disabled:cursor-not-allowed disabled:opacity-35"
          :disabled="page >= meta.totalPages || loading"
          @click="goNext"
        >
          Berikutnya
        </button>
      </div>
    </div>

    <CategoryFormModal
      :open="modalOpen"
      :mode="modalMode"
      :category="editingCategory"
      :default-type="defaultTypeForModal"
      :submitting="modalSubmitting"
      :api-error="formApiError"
      @close="closeModal"
      @submit="onModalSubmit"
    />

    <ConfirmDialog
      :open="!!categoryToDelete"
      title="Hapus kategori?"
      :message="deleteConfirmMessage"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="deleteSubmitting"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>
