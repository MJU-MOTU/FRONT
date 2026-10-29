import { browserTokenStore } from '../auth/tokenStore.ts'
import { createApiClient } from './client.ts'

let authFailureHandler: () => void = () => {}

export function setAuthFailureHandler(handler: () => void) {
  authFailureHandler = handler
}

// 개발 중에는 비워 두고 Vite 프록시를 쓴다. 배포하면 VITE_API_BASE_URL에 백엔드 주소를 넣는다
export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  tokens: browserTokenStore,
  onAuthFailure: () => authFailureHandler(),
})
