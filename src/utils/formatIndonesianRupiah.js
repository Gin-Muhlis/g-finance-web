const indonesianRupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatIndonesianRupiah(amount) {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount)) {
    return indonesianRupiahFormatter.format(0)
  }
  return indonesianRupiahFormatter.format(numericAmount)
}
