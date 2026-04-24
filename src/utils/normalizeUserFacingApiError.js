/**
 * Menghindari menampilkan pesan validasi mentah (TypeBox, schema, path, dsb.)
 * kepada pengguna.
 *
 * @param {unknown} error — biasanya error dari Axios
 * @param {string} fallbackMessage
 * @returns {string}
 */
export function normalizeUserFacingApiError(error, fallbackMessage) {
  const status = error?.response?.status
  const responseData = error?.response?.data

  if (status === 422) {
    return messageForUnprocessableEntity(responseData) ?? fallbackMessage
  }

  const plainMessage = extractPlainStringMessage(responseData)
  if (plainMessage && !looksLikeStructuredValidationPayload(plainMessage)) {
    return plainMessage
  }

  if (typeof responseData === 'string' && responseData.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(responseData)
      if (parsed && typeof parsed === 'object' && parsed.type === 'validation') {
        return (
          messageForUnprocessableEntity(parsed) ??
          'Data tidak dapat diproses. Silakan periksa kembali isian Anda.'
        )
      }
    } catch {
      // abaikan
    }
  }

  return fallbackMessage
}

function extractPlainStringMessage(responseData) {
  if (typeof responseData === 'string') {
    return responseData.trim() || null
  }
  if (
    responseData &&
    typeof responseData === 'object' &&
    typeof responseData.message === 'string'
  ) {
    const message = responseData.message.trim()
    return message || null
  }
  return null
}

function looksLikeStructuredValidationPayload(text) {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{')) return false
  return (
    trimmed.includes('"type"') &&
    (trimmed.includes('"validation"') || trimmed.includes('Expected '))
  )
}

function messageForUnprocessableEntity(responseData) {
  if (!responseData || typeof responseData !== 'object') {
    return 'Data tidak dapat diproses. Silakan periksa kembali isian Anda.'
  }

  const firstNestedError = Array.isArray(responseData.errors)
    ? responseData.errors[0]
    : null

  const pathHint =
    (typeof firstNestedError?.path === 'string' && firstNestedError.path) ||
    (typeof responseData.property === 'string' && responseData.property) ||
    ''

  const normalizedPath = pathHint.toLowerCase()

  if (normalizedPath.includes('balance')) {
    return 'Saldo tidak valid. Pastikan nilai saldo sesuai ketentuan.'
  }
  if (normalizedPath.includes('name')) {
    return 'Nama tidak valid. Periksa kembali nama wallet.'
  }
  if (normalizedPath.includes('icon')) {
    return 'Ikon tidak valid. Pilih ikon dari daftar yang tersedia.'
  }
  if (normalizedPath.includes('type')) {
    return 'Tipe wallet tidak valid.'
  }
  if (normalizedPath.includes('isactive') || normalizedPath.includes('is_active')) {
    return 'Status aktif tidak valid.'
  }

  return 'Data tidak dapat diproses. Silakan periksa kembali isian formulir.'
}
