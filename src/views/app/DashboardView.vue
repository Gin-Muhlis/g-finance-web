<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import AllocationBucketsCard from '@/components/dashboard/AllocationBucketsCard.vue';
import BudgetUsageCard from '@/components/dashboard/BudgetUsageCard.vue';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart.vue';
import PeriodFilter from '@/components/dashboard/PeriodFilter.vue';
import RecentActivitiesTable from '@/components/dashboard/RecentActivitiesTable.vue';
import SummaryCard from '@/components/dashboard/SummaryCard.vue';
import TotalBalanceCard from '@/components/dashboard/TotalBalanceCard.vue';
import {
  buildDailySeries,
  filterSavingByRange,
  resolvePeriodRange,
  resolvePreviousPeriodRange,
  sumIncomeExpense,
} from '@/utils/dashboardHelpers';
import {
  getDashboardBaseData,
  getDashboardRecentTransactions,
  getDashboardTransactions,
} from '@/services/dashboard';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

const periodId = ref('last7');
const customFromDate = ref('');
const customToDate = ref('');
const isLoading = ref(true);
const isCashflowLoading = ref(false);
const isRecentLoading = ref(false);
const errorMessage = ref('');
const wallets = ref([]);
const categories = ref([]);
const budget = ref({ totalBudget: 0, totalUsed: 0 });
const buckets = ref([]);
const allocations = ref([]);
const recentTransactions = ref([]);
const currentTransactions = ref([]);
const previousTransactions = ref([]);
const recentTransactionFilters = ref({});

const currentRange = computed(() =>
  resolvePeriodRange(periodId.value, {
    fromDate: customFromDate.value,
    toDate: customToDate.value,
  }),
);

const previousRange = computed(() =>
  resolvePreviousPeriodRange(currentRange.value),
);

const currentTotals = computed(() =>
  sumIncomeExpense(currentTransactions.value),
);
const previousTotals = computed(() =>
  sumIncomeExpense(previousTransactions.value),
);

const currentSavingTotal = computed(() =>
  filterSavingByRange(
    allocations.value.filter((item) => !item.isAllocationWithdraw),
    currentRange.value,
  ).reduce((acc, item) => acc + item.amount, 0),
);
const previousSavingTotal = computed(() =>
  filterSavingByRange(
    allocations.value.filter((item) => !item.isAllocationWithdraw),
    previousRange.value,
  ).reduce((acc, item) => acc + item.amount, 0),
);

const chartSeries = computed(() =>
  buildDailySeries(currentTransactions.value, currentRange.value),
);

const greetingHour = new Date().getHours();
const greetingLabel = computed(() => {
  if (greetingHour < 11) return 'Good morning';
  if (greetingHour < 15) return 'Good afternoon';
  if (greetingHour < 19) return 'Good evening';
  return 'Good night';
});

const displayName = computed(() => {
  const fromAuth = auth.user?.name?.split(/\s+/)[0];
  return fromAuth || 'G-Finance';
});

const monthLabel = computed(() => {
  const d = new Date();
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
});

const previousTotalBalance = computed(() => {
  const totalNow = wallets.value.reduce(
    (acc, w) => acc + Number(w.balance || 0),
    0,
  );
  return totalNow - (currentTotals.value.net - previousTotals.value.net);
});

async function loadCashflowData() {
  isCashflowLoading.value = true;
  try {
    const [currentRows, previousRows] = await Promise.all([
      getDashboardTransactions(currentRange.value),
      getDashboardTransactions(previousRange.value),
    ]);
    currentTransactions.value = currentRows;
    previousTransactions.value = previousRows;
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || 'Gagal memuat data cashflow dashboard.';
  } finally {
    isCashflowLoading.value = false;
  }
}

async function loadRecentTransactions(filters = recentTransactionFilters.value) {
  isRecentLoading.value = true;
  try {
    recentTransactionFilters.value = filters;
    recentTransactions.value = await getDashboardRecentTransactions(filters);
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || 'Gagal memuat transaksi terbaru dashboard.';
  } finally {
    isRecentLoading.value = false;
  }
}

async function loadDashboard() {
  isLoading.value = true;
  isRecentLoading.value = true;
  errorMessage.value = '';
  try {
    const [baseData, recentRows] = await Promise.all([
      getDashboardBaseData(),
      getDashboardRecentTransactions(),
    ]);
    wallets.value = baseData.wallets;
    categories.value = baseData.categories;
    budget.value = baseData.budget;
    buckets.value = baseData.buckets;
    allocations.value = baseData.allocations;
    recentTransactions.value = recentRows;
    await loadCashflowData();
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || 'Gagal memuat data dashboard.';
  } finally {
    isLoading.value = false;
    isRecentLoading.value = false;
  }
}

watch([periodId, customFromDate, customToDate], () => {
  if (!isLoading.value) loadCashflowData();
});

onMounted(() => {
  loadDashboard();
});
</script>

<template>
  <div class="space-y-6">
    <section
      v-motion-fade
      :duration="500"
      class="min-w-0"
    >
      <h2
        class="text-[24px] font-bold leading-tight tracking-[-0.015em] text-text-primary sm:text-[28px]"
      >
        {{ greetingLabel }}, {{ displayName }} 👋
      </h2>
      <p class="mt-1.5 text-[13px] text-text-secondary sm:text-[14px]">
        Pantau cashflow, anggaran, dan tabungan kamu dalam satu tempat.
      </p>
    </section>

    <section
      v-if="errorMessage"
      v-motion-fade
      :duration="400"
      class="rounded-[14px] border border-negative/25 bg-negative/10 px-4 py-3 text-[13px] text-negative"
    >
      {{ errorMessage }}
    </section>

    <!-- Row 1: Total balance | Budget usage -->
    <section class="grid gap-4 lg:grid-cols-2 lg:items-stretch">
      <TotalBalanceCard
        v-motion-fade
        :delay="80"
        :duration="550"
        :wallets="wallets"
        :previous-total-balance="previousTotalBalance"
        :loading="isLoading"
      />
      <BudgetUsageCard
        v-motion-fade
        :delay="140"
        :duration="550"
        :total-budget="budget.totalBudget"
        :total-used="budget.totalUsed"
        :month-label="monthLabel"
        :loading="isLoading"
      />
    </section>

    <!-- Row 2: Summary cards + Income vs Expense chart -->
    <section
      v-motion-fade
      :delay="200"
      :duration="550"
      class="overflow-hidden rounded-[18px] border border-white/[0.08] bg-ds-black-300/60 p-4 shadow-card-elevated backdrop-blur-md sm:p-5 md:p-6"
    >
      <header
        class="relative mb-5 border-b border-white/[0.06] pb-4 sm:pr-[200px]"
      >
        <div class="min-w-0">
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary"
          >
            Ringkasan keuangan
          </p>
          <h3
            class="mt-0.5 text-[17px] font-semibold text-text-primary sm:text-[18px]"
          >
            Cashflow & perbandingan periode
          </h3>
        </div>
        <div
          class="mt-3 flex justify-end sm:absolute sm:right-0 sm:top-0 sm:mt-0"
        >
          <PeriodFilter
            v-model="periodId"
            v-model:from-date="customFromDate"
            v-model:to-date="customToDate"
            size="sm"
          />
        </div>
      </header>

      <div class="grid gap-4 xl:grid-cols-12 xl:items-stretch">
        <div class="grid gap-3 sm:grid-cols-2 xl:col-span-5">
          <SummaryCard
            variant="income"
            title="Income"
            :amount="currentTotals.income"
            :previous-amount="previousTotals.income"
            :period-label="currentRange.label"
            :loading="isCashflowLoading || isLoading"
          />
          <SummaryCard
            variant="spending"
            title="Spending"
            :amount="currentTotals.expense"
            :previous-amount="previousTotals.expense"
            :period-label="currentRange.label"
            :loading="isCashflowLoading || isLoading"
          />
          <SummaryCard
            variant="cashflow"
            title="Net Cashflow"
            :amount="currentTotals.net"
            :previous-amount="previousTotals.net"
            :period-label="currentRange.label"
            signed-display
            :loading="isCashflowLoading || isLoading"
          />
          <SummaryCard
            variant="saving"
            title="Saving Contribution"
            :amount="currentSavingTotal"
            :previous-amount="previousSavingTotal"
            :period-label="currentRange.label"
            :loading="isCashflowLoading || isLoading"
          />
        </div>

        <div class="min-w-0 xl:col-span-7">
          <IncomeExpenseChart
            :series="chartSeries"
            :period-label="isCashflowLoading ? 'Loading...' : currentRange.label"
            embedded
            :loading="isCashflowLoading || isLoading"
          />
        </div>
      </div>
    </section>

    <!-- Row 3: Allocation buckets | Recent activities -->
    <div class="grid gap-4 xl:grid-cols-12 xl:items-stretch">
      <div class="xl:col-span-5">
        <AllocationBucketsCard
          v-motion-fade
          :delay="260"
          :duration="550"
          :buckets="buckets"
          :loading="isLoading"
        />
      </div>
      <div class="min-w-0 xl:col-span-7">
        <RecentActivitiesTable
          v-motion-fade
          :delay="320"
          :duration="550"
          :transactions="recentTransactions"
          :wallets="wallets"
          :categories="categories"
          :loading="isRecentLoading || isLoading"
          @filters-change="loadRecentTransactions"
        />
      </div>
    </div>
  </div>
</template>
