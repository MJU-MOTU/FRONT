import { api } from '../api/index.ts'
import type { Tokens } from '../api/client.ts'

export type User = { id: number; email: string; nickname: string; createdAt: string }

export const authApi = {
  signup: (email: string, password: string, nickname: string) =>
    api.post<{ userId: number }>('/api/v1/auth/signup', { email, password, nickname }, { auth: false }),
  login: (email: string, password: string) =>
    api.post<Tokens>('/api/v1/auth/login', { email, password }, { auth: false }),
  logout: (refreshToken: string) =>
    api.post<void>('/api/v1/auth/logout', { refreshToken }, { auth: false }),
  me: () => api.get<User>('/api/v1/me'),
}
