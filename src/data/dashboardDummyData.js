/**
 * Dummy data realistis untuk halaman Dashboard.
 *
 * Semua nilai dalam IDR (Rupiah). Data dirancang konsisten antar section
 * (mis. total wallet ≈ total balance card, transaksi terbaru menjadi sumber
 * "Recent Activities", dst.).
 *
 * Catatan: data ini terisi statis di frontend supaya bisa langsung dipakai
 * untuk preview UI tanpa memanggil backend.
 */

/** ===== Wallets (Cash, BCA, BRI, DANA, GOPAY) ===== */
export const DASHBOARD_WALLETS = [
  {
    id: 'w-bri',
    name: 'BRI',
    type: 'bank',
    typeLabel: 'Rekening bank',
    icon: 'Building2',
    balance: 18_420_750,
    color: '#0EA5E9',
  },
  {
    id: 'w-dana',
    name: 'DANA',
    type: 'e-wallet',
    typeLabel: 'Dompet digital',
    icon: 'Smartphone',
    balance: 3_120_300,
    color: '#22C55E',
  },
  {
    id: 'w-gopay',
    name: 'GOPAY',
    type: 'e-wallet',
    typeLabel: 'Dompet digital',
    icon: 'WalletCards',
    balance: 945_800,
    color: '#A855F7',
  },
]

/** ===== Categories ===== */
export const DASHBOARD_CATEGORIES = [
  { id: 'c-salary', name: 'Gaji', type: 'income', icon: 'CircleDollarSign', color: '#22C55E' },
  { id: 'c-bonus', name: 'Bonus', type: 'income', icon: 'BadgeDollarSign', color: '#10B981' },
  { id: 'c-freelance', name: 'Freelance', type: 'income', icon: 'BriefcaseBusiness', color: '#06B6D4' },
  { id: 'c-food', name: 'Makanan', type: 'expense', icon: 'Utensils', color: '#F97316' },
  { id: 'c-transport', name: 'Transport', type: 'expense', icon: 'Bus', color: '#3B82F6' },
  { id: 'c-shopping', name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'c-bills', name: 'Tagihan', type: 'expense', icon: 'ReceiptText', color: '#A855F7' },
  { id: 'c-entertainment', name: 'Hiburan', type: 'expense', icon: 'Film', color: '#FACC15' },
  { id: 'c-health', name: 'Kesehatan', type: 'expense', icon: 'Stethoscope', color: '#EF4444' },
]

/** ===== Allocation Buckets ===== */
export const DASHBOARD_BUCKETS = [
  {
    id: 'b-emergency',
    name: 'Emergency Fund',
    icon: 'Shield',
    color: '#3B82F6',
    balance: 18_500_000,
    target: 30_000_000,
  },
  {
    id: 'b-saving',
    name: 'Saving',
    icon: 'PiggyBank',
    color: '#22C55E',
    balance: 19_750_000,
    target: 20_000_000,
  },
  {
    id: 'b-vacation',
    name: 'Vacation',
    icon: 'Plane',
    color: '#F97316',
    balance: 4_250_000,
    target: 15_000_000,
  },
  {
    id: 'b-investment',
    name: 'Investment',
    icon: 'TrendingUp',
    color: '#A855F7',
    balance: 22_000_000,
    target: 50_000_000,
  },
]

/** ===== Budget bulan ini ===== */
export const DASHBOARD_BUDGET = {
  totalBudget: 8_500_000,
  totalUsed: 5_320_000,
}

/**
 * ===== Transactions (60 hari terakhir) =====
 *
 * Dibuat deterministik agar tampilan stabil saat refresh. Setiap entry:
 *  - id, walletId, categoryId
 *  - type: 'income' | 'expense'
 *  - amount (number IDR)
 *  - description
 *  - date (YYYY-MM-DD, dipatch ke "today" supaya selalu relevan ke hari ini)
 *  - status: 'completed' | 'pending'
 *
 * Tanggal dibuat relatif terhadap "today" supaya filter periode konsisten.
 */
function pad(n) {
  return String(n).padStart(2, '0')
}

function toIsoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function daysAgo(n) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

/** Pseudo-random deterministik (mulberry32) supaya hasil stabil */
function createSeededRandom(seed) {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

function randomChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function buildTransactions() {
  const rng = createSeededRandom(20260512)
  const txs = []
  const incomeCats = DASHBOARD_CATEGORIES.filter((c) => c.type === 'income')
  const expenseCats = DASHBOARD_CATEGORIES.filter((c) => c.type === 'expense')

  const descByCategory = {
    'c-salary': ['Gaji bulanan', 'Gajian'],
    'c-bonus': ['Bonus kinerja', 'Bonus proyek'],
    'c-freelance': ['Project freelance', 'Honor proyek client'],
    'c-food': [
      'Makan siang di Warmindo',
      'Kopi pagi',
      'Gofood ayam geprek',
      'Bakmi malam',
      'Sarapan nasi uduk',
    ],
    'c-transport': ['Gojek ke kantor', 'Isi bensin Pertamax', 'Grab pulang', 'Tol Jakarta-Bandung'],
    'c-shopping': [
      'Belanja Shopee',
      'Beli sepatu Adidas',
      'Tokopedia case HP',
      'Indomaret',
      'Mall belanja bulanan',
    ],
    'c-bills': [
      'Tagihan listrik PLN',
      'Internet IndiHome',
      'Paket data Telkomsel',
      'Spotify Premium',
      'Netflix bulanan',
    ],
    'c-entertainment': ['Bioskop XXI', 'Konser tiket', 'Steam game baru'],
    'c-health': ['Konsultasi dokter', 'Apotek K24', 'Vitamin & obat'],
  }

  let nextId = 1

  for (let day = 0; day < 62; day += 1) {
    const date = daysAgo(day)
    const isoDate = toIsoDate(date)

    if (day === 0 || day === 30) {
      const cat = randomChoice(rng, incomeCats)
      txs.push({
        id: `t-${pad(nextId++)}-${isoDate}`,
        walletId: 'w-bca',
        categoryId: cat.id,
        type: 'income',
        amount: cat.id === 'c-salary' ? 12_500_000 : 2_500_000 + Math.floor(rng() * 1_500_000),
        description: randomChoice(rng, descByCategory[cat.id]),
        date: isoDate,
        status: 'completed',
      })
    }

    if (day % 14 === 7) {
      txs.push({
        id: `t-${pad(nextId++)}-${isoDate}`,
        walletId: 'w-bca',
        categoryId: 'c-freelance',
        type: 'income',
        amount: 1_800_000 + Math.floor(rng() * 1_200_000),
        description: randomChoice(rng, descByCategory['c-freelance']),
        date: isoDate,
        status: rng() > 0.85 ? 'pending' : 'completed',
      })
    }

    const expenseCount = day < 7 ? 2 + Math.floor(rng() * 3) : 1 + Math.floor(rng() * 3)
    for (let i = 0; i < expenseCount; i += 1) {
      const cat = randomChoice(rng, expenseCats)
      const wallet = randomChoice(rng, DASHBOARD_WALLETS)
      const baseAmount = {
        'c-food': 25_000 + rng() * 75_000,
        'c-transport': 15_000 + rng() * 60_000,
        'c-shopping': 80_000 + rng() * 420_000,
        'c-bills': 150_000 + rng() * 350_000,
        'c-entertainment': 50_000 + rng() * 180_000,
        'c-health': 90_000 + rng() * 260_000,
      }[cat.id]

      txs.push({
        id: `t-${pad(nextId++)}-${isoDate}-${i}`,
        walletId: wallet.id,
        categoryId: cat.id,
        type: 'expense',
        amount: Math.round((baseAmount ?? 50_000) / 500) * 500,
        description: randomChoice(rng, descByCategory[cat.id]),
        date: isoDate,
        status: rng() > 0.92 ? 'pending' : 'completed',
      })
    }
  }

  return txs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export const DASHBOARD_TRANSACTIONS = buildTransactions()

/** Daily allocation/saving contributions selama 60 hari terakhir (dummy) */
function buildDailySavingContributions() {
  const rng = createSeededRandom(424242)
  const out = []
  for (let day = 0; day < 62; day += 1) {
    const date = daysAgo(day)
    const isoDate = toIsoDate(date)
    const hasContribution = rng() > 0.55
    out.push({
      date: isoDate,
      amount: hasContribution
        ? Math.round((150_000 + rng() * 600_000) / 5_000) * 5_000
        : 0,
    })
  }
  return out
}

export const DASHBOARD_SAVING_CONTRIBUTIONS = buildDailySavingContributions()

/** ===== Helpers untuk filter periode ===== */
export const PERIOD_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'custom', label: 'Custom Date' },
]

/**
 * @param {'today'|'yesterday'|'last7'|'thisMonth'|'lastMonth'|'custom'} period
 * @param {{ fromDate?: string, toDate?: string }} [customRange]
 * @returns {{ start: Date, end: Date, fromIso: string, toIso: string, label: string }}
 */
export function resolvePeriodRange(period, customRange = {}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  switch (period) {
    case 'today':
      return {
        start: today,
        end: endOfToday,
        fromIso: toIsoDate(today),
        toIso: toIsoDate(today),
        label: 'Today',
      }
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(today.getDate() - 1)
      const yEnd = new Date(y)
      yEnd.setHours(23, 59, 59, 999)
      return {
        start: y,
        end: yEnd,
        fromIso: toIsoDate(y),
        toIso: toIsoDate(y),
        label: 'Yesterday',
      }
    }
    case 'last7': {
      const start = new Date(today)
      start.setDate(today.getDate() - 6)
      return {
        start,
        end: endOfToday,
        fromIso: toIsoDate(start),
        toIso: toIsoDate(today),
        label: 'Last 7 Days',
      }
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      return {
        start,
        end,
        fromIso: toIsoDate(start),
        toIso: toIsoDate(end),
        label: 'This Month',
      }
    }
    case 'lastMonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      end.setHours(23, 59, 59, 999)
      return {
        start,
        end,
        fromIso: toIsoDate(start),
        toIso: toIsoDate(end),
        label: 'Last Month',
      }
    }
    case 'custom': {
      const fromIso = customRange.fromDate || toIsoDate(today)
      const toIso = customRange.toDate || toIsoDate(today)
      const start = parseIsoDateLocal(fromIso)
      const end = parseIsoDateLocal(toIso)
      end.setHours(23, 59, 59, 999)
      return {
        start,
        end,
        fromIso,
        toIso,
        label: `${fromIso} → ${toIso}`,
      }
    }
    default:
      return {
        start: today,
        end: endOfToday,
        fromIso: toIsoDate(today),
        toIso: toIsoDate(today),
        label: 'Today',
      }
  }
}

/**
 * Hitung previous-period range yang sebanding (dipakai untuk persentase
 * perubahan summary cards).
 */
export function resolvePreviousPeriodRange(currentRange) {
  const days =
    Math.floor((currentRange.end.getTime() - currentRange.start.getTime()) / 86_400_000) + 1
  const end = new Date(currentRange.start)
  end.setDate(end.getDate() - 1)
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function parseIsoDateLocal(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Filter transaksi berdasarkan rentang waktu (inclusive). */
export function filterTransactionsByRange(transactions, range) {
  const startTime = range.start.getTime()
  const endTime = range.end.getTime()
  return transactions.filter((t) => {
    const d = parseIsoDateLocal(t.date).getTime()
    return d >= startTime && d <= endTime
  })
}

/** Saving contributions dalam range (inclusive). */
export function filterSavingByRange(contributions, range) {
  const startTime = range.start.getTime()
  const endTime = range.end.getTime()
  return contributions.filter((c) => {
    const d = parseIsoDateLocal(c.date).getTime()
    return d >= startTime && d <= endTime
  })
}

/** Hitung total income & expense dari array transaksi */
export function sumIncomeExpense(transactions) {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else if (t.type === 'expense') expense += t.amount
  }
  return { income, expense, net: income - expense }
}

/** Build series harian (income & expense) untuk chart */
export function buildDailySeries(transactions, range) {
  const start = new Date(range.start)
  const end = new Date(range.end)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const points = []
  const cursor = new Date(start)
  const byDate = new Map()
  for (const t of transactions) {
    const k = t.date
    if (!byDate.has(k)) byDate.set(k, { income: 0, expense: 0 })
    const bucket = byDate.get(k)
    if (t.type === 'income') bucket.income += t.amount
    else if (t.type === 'expense') bucket.expense += t.amount
  }

  while (cursor.getTime() <= end.getTime()) {
    const iso = toIsoDate(cursor)
    const bucket = byDate.get(iso) || { income: 0, expense: 0 }
    points.push({
      date: iso,
      income: bucket.income,
      expense: bucket.expense,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return points
}

export const DASHBOARD_USER = {
  name: 'Sajibur Rahman',
  email: 'sajibur.rahman@g-finance.id',
  initials: 'SR',
  greetingSubtitle: 'Pantau cashflow, anggaran, dan tabungan kamu dalam satu tempat.',
}
