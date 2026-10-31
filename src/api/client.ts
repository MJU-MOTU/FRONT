import { toApiError } from './ApiError.ts'

export type Tokens = { accessToken: string; refreshToken: string }

export interface TokenStore {
  getAccess(): string | null
  getRefresh(): string | null
  save(tokens: Tokens): void
  clear(): void
}

type ClientOptions = {
  baseUrl?: string
  fetch?: typeof fetch
  tokens: TokenStore
  onAuthFailure?: () => void
}

type RequestOptions = { auth?: boolean; headers?: Record<string, string> }

export function createApiClient({ baseUrl: rawBaseUrl = '', fetch: fetchFn = fetch, tokens, onAuthFailure }: ClientOptions) {
  // Lambda Function URL은 끝에 /가 붙어 나온다. 그대로 이으면 //api/...가 되어 서버가 거절한다
  const baseUrl = rawBaseUrl.replace(/\/+$/, '')
  let refreshing: Promise<boolean> | null = null

  async function refresh(): Promise<boolean> {
    const refreshToken = tokens.getRefresh()
    if (!refreshToken) {
      return false
    }
    const response = await fetchFn(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) {
      tokens.clear()
      return false
    }
    tokens.save(await response.json())
    return true
  }

  // 여러 요청이 동시에 401을 받아도 재발급은 한 번만 한다.
  // Refresh 토큰은 한 번 쓰면 폐기되므로, 같은 토큰을 두 번 보내면 서버가 탈취로 보고 전부 막는다
  function refreshOnce(): Promise<boolean> {
    refreshing ??= refresh().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  async function request<T>(method: string, path: string, body: unknown, options: RequestOptions, retried = false): Promise<T> {
    const { auth = true } = options
    const headers: Record<string, string> = { ...options.headers }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }
    const accessToken = tokens.getAccess()
    if (auth && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetchFn(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (response.status === 401 && auth && !retried) {
      if (await refreshOnce()) {
        return request<T>(method, path, body, options, true)
      }
      onAuthFailure?.()
    }
    if (!response.ok) {
      throw await toApiError(response)
    }
    if (response.status === 204) {
      return undefined as T
    }
    return (await response.json()) as T
  }

  return {
    get: <T>(path: string, options: RequestOptions = {}) => request<T>('GET', path, undefined, options),
    post: <T>(path: string, body?: unknown, options: RequestOptions = {}) => request<T>('POST', path, body, options),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
