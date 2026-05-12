<script setup>
import { computed, ref } from 'vue'

import AllocationBucketsCard from '@/components/dashboard/AllocationBucketsCard.vue'
import BudgetUsageCard from '@/components/dashboard/BudgetUsageCard.vue'
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart.vue'
import PeriodFilter from '@/components/dashboard/PeriodFilter.vue'
import RecentActivitiesTable from '@/components/dashboard/RecentActivitiesTable.vue'
import SummaryCard from '@/components/dashboard/SummaryCard.vue'
import TotalBalanceCard from '@/components/dashboard/TotalBalanceCard.vue'
import {
  DASHBOARD_BUCKETS,
  DASHBOARD_BUDGET,
  DASHBOARD_CATEGORIES,
  DASHBOARD_SAVING_CONTRIBUTIONS,
  DASHBOARD_TRANSACTIONS,
  DASHBOARD_USER,
  DASHBOARD_WALLETS,
  buildDailySeries,
  filterSavingByRange,
  filterTransactionsByRange,
  resolvePeriodRange,
  resolvePreviousPeriodRange,
  sumIncomeExpense,
} from '@/data/dashboardDummyData'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const periodId = ref('today')
const customFromDate = ref('')
const customToDate = ref('')

const currentRange = computed(() =>
  resolvePeriodRange(periodId.value, {
    fromDate: customFromDate.value,
    toDate: customToDate.value,
  }),
)

const previousRange = computed(() => resolvePreviousPeriodRange(currentRange.value))

const currentTransactions = computed(() =>
  filterTransactionsByRange(DASHBOARD_TRANSACTIONS, currentRange.value),
)
const previousTransactions = computed(() =>
  filterTransactionsByRange(DASHBOARD_TRANSACTIONS, previousRange.value),
)

const currentTotals = computed(() => sumIncomeExpense(currentTransactions.value))
const previousTotals = computed(() => sumIncomeExpense(previousTransactions.value))

const currentSavingTotal = computed(() =>
  filterSavingByRange(DASHBOARD_SAVING_CONTRIBUTIONS, currentRange.value).reduce(
    (acc, item) => acc + item.amount,
    0,
  ),
)
const previousSavingTotal = computed(() =>
  filterSavingByRange(DASHBOARD_SAVING_CONTRIBUTIONS, previousRange.value).reduce(
    (acc, item) => acc + item.amount,
    0,
  ),
)

const chartSeries = computed(() =>
  buildDailySeries(currentTransactions.value, currentRange.value),
)

const greetingHour = new Date().getHours()
const greetingLabel = computed(() => {
  if (greetingHour < 11) return 'Good morning'
  if (greetingHour < 15) return 'Good afternoon'
  if (greetingHour < 19) return 'Good evening'
  return 'Good night'
})

const displayName = computed(() => {
  const fromAuth = auth.user?.name?.split(/\s+/)[0]
  return fromAuth || DASHBOARD_USER.name.split(/\s+/)[0]
})

const monthLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const previousTotalBalance = computed(() => {
  const totalNow = DASHBOARD_WALLETS.reduce(
    (acc, w) => acc + Number(w.balance || 0),
    0,
  )
  return totalNow - (currentTotals.value.net - previousTotals.value.net)
})
</script>

<template>
  <div class="space-y-6">
    <section
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0">
        <h2
          class="text-[24px] font-bold leading-tight tracking-[-0.015em] text-text-primary sm:text-[28px]"
        >
          {{ greetingLabel }}, {{ displayName }} 👋
        </h2>
        <p class="mt-1.5 text-[13px] text-text-secondary sm:text-[14px]">
          {{ DASHBOARD_USER.greetingSubtitle }}
        </p>
      </div>
      <PeriodFilter
        v-model="periodId"
        v-model:from-date="customFromDate"
        v-model:to-date="customToDate"
      />
    </section>

    <section class="grid gap-4 lg:grid-cols-12">
      <div class="lg:col-span-7 xl:col-span-7">
        <TotalBalanceCard
          :wallets="DASHBOARD_WALLETS"
          :previous-total-balance="previousTotalBalance"
        />
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:col-span-5 xl:col-span-5">
        <SummaryCard
          variant="income"
          title="Income"
          :amount="currentTotals.income"
          :previous-amount="previousTotals.income"
          :period-label="currentRange.label"
        />
        <SummaryCard
          variant="spending"
          title="Spending"
          :amount="currentTotals.expense"
          :previous-amount="previousTotals.expense"
          :period-label="currentRange.label"
        />
        <SummaryCard
          variant="cashflow"
          title="Net Cashflow"
          :amount="currentTotals.net"
          :previous-amount="previousTotals.net"
          :period-label="currentRange.label"
          signed-display
        />
        <SummaryCard
          variant="saving"
          title="Saving Contribution"
          :amount="currentSavingTotal"
          :previous-amount="previousSavingTotal"
          :period-label="currentRange.label"
        />
      </div>
    </section>

    <section>
      <IncomeExpenseChart
        :series="chartSeries"
        :period-label="currentRange.label"
      />
    </section>

    <section class="grid gap-4 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <BudgetUsageCard
          :total-budget="DASHBOARD_BUDGET.totalBudget"
          :total-used="DASHBOARD_BUDGET.totalUsed"
          :month-label="monthLabel"
        />
      </div>
      <div class="lg:col-span-7">
        <AllocationBucketsCard :buckets="DASHBOARD_BUCKETS" />
      </div>
    </section>

    <section>
      <RecentActivitiesTable
        :transactions="DASHBOARD_TRANSACTIONS"
        :wallets="DASHBOARD_WALLETS"
        :categories="DASHBOARD_CATEGORIES"
      />
    </section>
  </div>
</template>
