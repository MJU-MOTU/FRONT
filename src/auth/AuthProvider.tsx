import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthFailureHandler } from '../api/index.ts'
import { AuthContext, type AuthStatus, type AuthValue } from './AuthContext.ts'
import { authApi, type User } from './authApi.ts'
import { browserTokenStore } from './tokenStore.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Refresh 토큰이 없으면 확인할 것도 없이 비로그인이다
  const [status, setStatus] = useState<AuthStatus>(() => (browserTokenStore.getRefresh() ? 'loading' : 'anonymous'))
  const [user, setUser] = useState<User | null>(null)

  const becomeAnonymous = useCallback(() => {
    browserTokenStore.clear()
    setUser(null)
    setStatus('anonymous')
  }, [])

  // 앱을 열 때 Refresh 토큰이 있으면 내 정보를 불러 본다. Access 토큰이 없으니 401 → 재발급 → 재시도로 이어진다
  useEffect(() => {
    setAuthFailureHandler(becomeAnonymous)
    if (!browserTokenStore.getRefresh()) {
      return
    }
    let cancelled = false
    authApi.me()
      .then((me) => {
        if (!cancelled) {
          setUser(me)
          setStatus('authenticated')
        }
      })
      .catch(() => {
        if (!cancelled) {
          becomeAnonymous()
        }
      })
    return () => {
      cancelled = true
    }
  }, [becomeAnonymous])

  const login = useCallback(async (email: string, password: string) => {
    browserTokenStore.save(await authApi.login(email, password))
    setUser(await authApi.me())
    setStatus('authenticated')
  }, [])

  const signup = useCallback(async (email: string, password: string, nickname: string) => {
    await authApi.signup(email, password, nickname)
    await login(email, password)
  }, [login])

  // 서버에서 폐기하지 못해도(네트워크 오류 등) 이 기기에서는 로그아웃한다
  const logout = useCallback(async () => {
    const refreshToken = browserTokenStore.getRefresh()
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined)
    }
    becomeAnonymous()
  }, [becomeAnonymous])

  const value = useMemo<AuthValue>(
    () => ({ status, user, login, signup, logout }),
    [status, user, login, signup, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
