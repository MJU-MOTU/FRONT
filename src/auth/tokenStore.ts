import type { TokenStore, Tokens } from '../api/client.ts'

const REFRESH_TOKEN_KEY = 'motu.refreshToken'

// Access 토큰은 메모리에만 둔다(새로고침하면 사라지고 Refresh로 다시 받는다).
// Refresh 토큰은 새로고침해도 로그인이 유지되도록 localStorage에 둔다
let accessToken: string | null = null

export const browserTokenStore: TokenStore = {
  getAccess: () => accessToken,
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  save(tokens: Tokens) {
    accessToken = tokens.accessToken
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },
  clear() {
    accessToken = null
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
