import { getAllocationSummary, listAllocations } from '@/services/allocations'
import { getBudgetSummary } from '@/services/budgets'
import { listBuckets } from '@/services/buckets'
import { listCategories } from '@/services/categories'
import api from '@/services/api'
import { listTransactions } from '@/services/transactions'
import { listWallets } from '@/services/wallets'

const walletTypeLabels = {
  bank: 'Rekening bank',
  'e-wallet': 'Dompet digital',
  cash: 'Tunai',
  savings: 'Tabungan',
  investment: 'Investasi',
}

const walletTypeColors = {
  bank: '#0EA5E9',
  'e-wallet': '#22C55E',
  cash: '#F97316',
  savings: '#A855F7',
  investment: '#3B82F6',
}

function toNumber(value) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function normalizeWallet(wallet) {
  return {
    ...wallet,
    balance: toNumber(wallet.balance),
    typeLabel: walletTypeLabels[wallet.type] ?? wallet.type,
    color: walletTypeColors[wallet.type] ?? '#FFFFFF',
  }
}

function normalizeBucket(bucket) {
  return {
    ...bucket,
    balance: toNumber(bucket.balance),
    target: toNumber(bucket.targetAmount),
    color: bucket.color || '#3B82F6',
    icon: bucket.icon || 'PiggyBank',
  }
}

export function normalizeTransaction(transaction) {
  return {
    ...transaction,
    amount: toNumber(transaction.amount),
    date: transaction.transactionDate,
    categoryId: transaction.categoryId ?? '',
    walletId: transaction.walletId ?? transaction.fromWalletId ?? transaction.toWalletId ?? '',
    categoryName: transaction.category?.name ?? transaction.categoryName ?? null,
    walletName:
      transaction.wallet?.name ??
      transaction.walletName ??
      transaction.fromWallet?.name ??
      transaction.toWallet?.name ??
      null,
  }
}

function flattenTransactionsByDay(responseData) {
  const groups = responseData?.transactionsByDay ?? []
  return groups.flatMap((group) =>
    (group.transactions ?? []).map((transaction) => normalizeTransaction(transaction)),
  )
}

export async function getDashboardBaseData() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  const [walletsRes, categoriesRes, budgetRes, bucketsRes, allocationsRes, allocationSummaryRes] =
    await Promise.all([
      listWallets(),
      listCategories({ page: 1, limit: 100 }),
      getBudgetSummary(year, month),
      listBuckets(),
      listAllocations(),
      getAllocationSummary(),
    ])

  const budgetTotals = budgetRes.data?.totals ?? {}

  return {
    wallets: (walletsRes.data ?? []).map(normalizeWallet),
    categories: categoriesRes.data?.data ?? [],
    budget: {
      totalBudget: toNumber(budgetTotals.totalAllocated),
      totalUsed: toNumber(budgetTotals.totalActual),
    },
    buckets: (bucketsRes.data ?? []).map(normalizeBucket),
    allocations: (allocationsRes.data ?? []).map((allocation) => ({
      ...allocation,
      amount: toNumber(allocation.amount),
      date: allocation.transactionDate,
    })),
    allocationSummary: allocationSummaryRes.data,
  }
}

export async function getDashboardTransactions(range) {
  const response = await listTransactions({
    startDate: range.fromIso,
    endDate: range.toIso,
  })
  return flattenTransactionsByDay(response.data)
}

export async function getDashboardRecentTransactions(params = {}) {
  const response = await api.get('/api/dashboard/recent-transactions', {
    params: {
      ...params,
      limit: params.limit ?? 5,
    },
  })
  return (response.data ?? []).map((transaction) => normalizeTransaction(transaction))
}
