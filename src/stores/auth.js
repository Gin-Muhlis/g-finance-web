import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as authApi from '@/services/auth'

const REFRESH_KEY = 'gfinance_refresh_token'

function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY)
}

function setRefreshToken(token, rememberMe) {
  sessionStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(REFRESH_KEY)
  if (rememberMe) {
    localStorage.setItem(REFRESH_KEY, token)
  } else {
    sessionStorage.setItem(REFRESH_KEY, token)
  }
}

function persistRotatedRefreshToken(newToken) {
  if (localStorage.getItem(REFRESH_KEY) != null) {
    localStorage.setItem(REFRESH_KEY, newToken)
  } else if (sessionStorage.getItem(REFRESH_KEY) != null) {
    sessionStorage.setItem(REFRESH_KEY, newToken)
  }
}

function clearRefreshToken() {
  sessionStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

let refreshInFlight = null

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const user = ref(null)
  const bootstrapped = ref(false)

  const isAuthenticated = computed(
    () => !!accessToken.value && !!user.value
  )

  function setSession(access, refresh, rememberMe) {
    accessToken.value = access
    setRefreshToken(refresh, rememberMe)
  }

  function clearSession() {
    accessToken.value = null
    user.value = null
    clearRefreshToken()
  }

  async function fetchMe() {
    const { data } = await authApi.getMe()
    user.value = data
  }

  async function tryRefreshAccessToken() {
    if (refreshInFlight) {
      return refreshInFlight
    }

    const rt = getRefreshToken()
    if (!rt) {
      clearSession()
      return Promise.resolve(false)
    }

    refreshInFlight = (async () => {
      try {
        const { data } = await authApi.refreshTokens(
          { refreshToken: rt },
          { _skipAuthRetry: true }
        )
        accessToken.value = data.accessToken
        persistRotatedRefreshToken(data.refreshToken)
        return true
      } catch {
        clearSession()
        return false
      } finally {
        refreshInFlight = null
      }
    })()

    return refreshInFlight
  }

  async function bootstrap() {
    if (bootstrapped.value) return

    const rt = getRefreshToken()
    if (!rt) {
      bootstrapped.value = true
      return
    }

    const ok = await tryRefreshAccessToken()
    if (ok) {
      try {
        await fetchMe()
      } catch {
        clearSession()
      }
    }

    bootstrapped.value = true
  }

  async function login({ email, password, rememberMe }) {
    const deviceInfo =
      typeof navigator !== 'undefined'
        ? String(navigator.userAgent).slice(0, 512)
        : undefined

    const { data } = await authApi.login({
      email,
      password,
      rememberMe,
      ...(deviceInfo ? { deviceInfo } : {}),
    })

    setSession(data.accessToken, data.refreshToken, rememberMe)
    await fetchMe()
  }

  async function register({ email, name, password }) {
    await authApi.register({ email, name, password })
  }

  async function logout() {
    const rt = getRefreshToken()
    try {
      if (rt) {
        await authApi.logout(
          { refreshToken: rt },
          { _skipAuthRetry: true }
        )
      }
    } catch {
      /* still clear client session */
    } finally {
      clearSession()
    }
  }

  return {
    accessToken,
    user,
    bootstrapped,
    isAuthenticated,
    bootstrap,
    login,
    register,
    logout,
    tryRefreshAccessToken,
    fetchMe,
  }
})
