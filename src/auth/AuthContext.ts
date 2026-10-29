import { createContext, useContext } from 'react'
import type { User } from './authApi.ts'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthValue = {
  status: AuthStatus
  user: User | null
  login(email: string, password: string): Promise<void>
  signup(email: string, password: string, nickname: string): Promise<void>
  logout(): Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있습니다')
  }
  return value
}
