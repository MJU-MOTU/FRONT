import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './ApiError.ts'
import { createApiClient, type TokenStore, type Tokens } from './client.ts'

function memoryTokens(initial: Partial<Tokens> = {}): TokenStore {
  let access = initial.accessToken ?? null
  let refresh = initial.refreshToken ?? null
  return {
    getAccess: () => access,
    getRefresh: () => refresh,
    save: (t) => {
      access = t.accessToken
      refresh = t.refreshToken
    },
    clear: () => {
      access = null
      refresh = null
    },
  }
}

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// /me는 'Bearer new-access'일 때만 200, 재발급은 'r1'일 때 한 번만 성공하는 가짜 서버
function fakeServer() {
  let refreshCalls = 0
  const fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url)
    if (path.endsWith('/api/v1/auth/refresh')) {
      refreshCalls++
      const { refreshToken } = JSON.parse(String(init?.body))
      return refreshToken === 'r1'
        ? json(200, { accessToken: 'new-access', refreshToken: 'r2' })
        : json(401, { code: 'INVALID_REFRESH_TOKEN', title: '다시 로그인해 주세요' })
    }
    const auth = new Headers(init?.headers).get('Authorization')
    return auth === 'Bearer new-access'
      ? json(200, { id: 1, nickname: '모투' })
      : json(401, { code: 'UNAUTHORIZED', title: '인증이 필요합니다' })
  })
  return { fetch: fetch as unknown as typeof globalThis.fetch, refreshCalls: () => refreshCalls }
}

describe('createApiClient', () => {
  it('Access 토큰이 만료되면 재발급하고 원래 요청을 다시 보낸다', async () => {
    const server = fakeServer()
    const tokens = memoryTokens({ accessToken: 'expired', refreshToken: 'r1' })
    const api = createApiClient({ fetch: server.fetch, tokens })

    await expect(api.get('/api/v1/me')).resolves.toEqual({ id: 1, nickname: '모투' })
    expect(tokens.getRefresh()).toBe('r2')
  })

  it('동시에 여러 요청이 401을 받아도 재발급은 한 번만 한다', async () => {
    const server = fakeServer()
    const api = createApiClient({ fetch: server.fetch, tokens: memoryTokens({ refreshToken: 'r1' }) })

    await Promise.all([api.get('/api/v1/me'), api.get('/api/v1/me'), api.get('/api/v1/me')])

    expect(server.refreshCalls()).toBe(1)
  })

  it('재발급도 실패하면 토큰을 지우고 로그아웃 처리한다', async () => {
    const server = fakeServer()
    const tokens = memoryTokens({ accessToken: 'expired', refreshToken: 'revoked' })
    const onAuthFailure = vi.fn()
    const api = createApiClient({ fetch: server.fetch, tokens, onAuthFailure })

    await expect(api.get('/api/v1/me')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
    expect(tokens.getRefresh()).toBeNull()
    expect(onAuthFailure).toHaveBeenCalledOnce()
  })

  it('auth: false 요청은 401이어도 재발급하지 않는다 (로그인 실패)', async () => {
    const fetch = vi.fn(async () => json(401, { code: 'INVALID_CREDENTIALS', title: '이메일 또는 비밀번호가 올바르지 않습니다' }))
    const api = createApiClient({ fetch: fetch as unknown as typeof globalThis.fetch, tokens: memoryTokens({ refreshToken: 'r1' }) })

    const error = await api.post('/api/v1/auth/login', {}, { auth: false }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('INVALID_CREDENTIALS')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('에러 본문의 code와 필드 에러를 ApiError로 넘긴다', async () => {
    const fetch = vi.fn(async () =>
      json(400, { code: 'VALIDATION_FAILED', title: '요청 값이 올바르지 않습니다', errors: [{ field: 'email', message: '이메일 형식' }] }),
    )
    const api = createApiClient({ fetch: fetch as unknown as typeof globalThis.fetch, tokens: memoryTokens() })

    await expect(api.post('/api/v1/auth/signup', {}, { auth: false })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
      errors: [{ field: 'email', message: '이메일 형식' }],
    })
  })
})

describe('baseUrl', () => {
  it('끝에 붙은 /를 떼고 경로를 잇는다', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => json(200, { id: 1 }))
    const client = createApiClient({
      baseUrl: 'https://abc.lambda-url.ap-northeast-2.on.aws/',
      fetch,
      tokens: memoryTokens({ accessToken: 'a' }),
      onAuthFailure: () => {},
    })

    await client.get('/api/v1/me')

    expect(String(fetch.mock.calls[0][0])).toBe('https://abc.lambda-url.ap-northeast-2.on.aws/api/v1/me')
  })
})
