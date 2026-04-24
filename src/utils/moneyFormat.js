/**
 * IDR & compact formatting — aligned with backend decimal strings and UI copy (e.g. "3,2 jt").
 */

export function parseMoneyString(value) {
  if (value == null || value === '') return 0
  const cleaned = String(value).replace(/[^\d.-]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function formatIdrId(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

/** Short label for progress lines: "3,2 jt" */
export function formatIdrShort(amount) {
  const n = Math.round(amount)
  const abs = Math.abs(n)
  if (abs >= 1_000_000) {
    const v = n / 1_000_000
    const s = Number.isInteger(v)
      ? String(v)
      : v.toFixed(1).replace(/\.0$/, '')
    return `${s} jt`
  }
  if (abs >= 1_000) {
    return `${Math.round(n / 1_000)} rb`
  }
  return formatIdrId(n)
}

/** API expects decimal strings, e.g. "150000.00" */
export function toApiMoneyString(amount) {
  const n = Math.max(0, parseMoneyString(String(amount)))
  return n.toFixed(2)
}
