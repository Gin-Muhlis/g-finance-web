import { onUnmounted, ref, unref, watch } from 'vue'

export function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3
}

function resolveSource(source) {
  return typeof source === 'function' ? source() : unref(source)
}

function resolveEnabled(enabledSource) {
  return typeof enabledSource === 'function'
    ? enabledSource()
    : unref(enabledSource)
}

export function useCountUp(source, options = {}) {
  const duration = options.duration ?? 900
  const delay = options.delay ?? 0
  const enabledSource = options.enabled ?? true

  const displayValue = ref(0)
  let rafId = null
  let delayTimer = null

  function cancel() {
    if (rafId != null) cancelAnimationFrame(rafId)
    if (delayTimer != null) clearTimeout(delayTimer)
    rafId = null
    delayTimer = null
  }

  function runTo(target) {
    cancel()

    const safeTarget = Number.isFinite(target) ? target : 0
    const isEnabled = resolveEnabled(enabledSource)

    if (!isEnabled) {
      displayValue.value = safeTarget
      return
    }

    const start = displayValue.value
    const startTime = performance.now()

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration)
      displayValue.value = start + (safeTarget - start) * easeOutCubic(progress)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        displayValue.value = safeTarget
        rafId = null
      }
    }

    const startAnimation = () => {
      rafId = requestAnimationFrame(tick)
    }

    if (delay > 0) {
      delayTimer = setTimeout(startAnimation, delay)
    } else {
      startAnimation()
    }
  }

  watch(
    () => resolveSource(source),
    (value) => runTo(Number(value)),
    { immediate: true },
  )

  watch(
    () => resolveEnabled(enabledSource),
    (isEnabled) => {
      if (isEnabled) runTo(Number(resolveSource(source)))
    },
  )

  onUnmounted(cancel)

  return { displayValue, cancel }
}
