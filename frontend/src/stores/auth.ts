import { computed, ref } from 'vue'
import type { AuthUser } from '../services/auth'

const TOKEN_KEY = '4m_token'
const USER_KEY = '4m_user'

const token = ref<string | null>(null)
const user = ref<AuthUser | null>(null)
const initialized = ref(false)

function readStorage() {
  token.value = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  const rawUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  if (rawUser) {
    try {
      user.value = JSON.parse(rawUser) as AuthUser
    } catch {
      user.value = null
    }
  }
}

function writeStorage(remember: boolean) {
  const store = remember ? localStorage : sessionStorage
  if (token.value) {
    store.setItem(TOKEN_KEY, token.value)
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    store.setItem(TOKEN_KEY, token.value)
  }
  if (user.value) {
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
    store.setItem(USER_KEY, JSON.stringify(user.value))
  }
}

export function initAuth() {
  if (initialized.value) return
  readStorage()
  initialized.value = true
}

export function setSession(nextToken: string, nextUser: AuthUser, remember: boolean) {
  token.value = nextToken
  user.value = nextUser
  writeStorage(remember)
}

export function clearSession() {
  token.value = null
  user.value = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export const isAuthenticated = computed(() => Boolean(token.value && user.value))
export const authToken = token
export const authUser = user