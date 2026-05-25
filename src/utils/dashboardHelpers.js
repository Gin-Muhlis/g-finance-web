
export const PERIOD_OPTIONS = [
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'custom', label: 'Custom Date' },
]

function pad(n) {
  return String(n).padStart(2, '0')
}

function toIsoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseIsoDateLocal(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function resolvePeriodRange(period, customRange = {}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  switch (period) {
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
}

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

export function filterSavingByRange(contributions, range) {
  const startTime = range.start.getTime()
  const endTime = range.end.getTime()
  return contributions.filter((c) => {
    const d = parseIsoDateLocal(c.date).getTime()
    return d >= startTime && d <= endTime
  })
}

export function sumIncomeExpense(transactions) {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else if (t.type === 'expense') expense += t.amount
  }
  return { income, expense, net: income - expense }
}


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
