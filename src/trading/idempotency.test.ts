import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/ApiError.ts'
import { createApiClient } from '../api/client.ts'
import { shouldReuseKey } from './idempotency.ts'

describe('shouldReuseKey', () => {
  it('결과를 모르는 실패(네트워크·5xx)면 같은 키를 다시 쓴다', () => {
    expect(shouldReuseKey(new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldReuseKey(new ApiError(503, 'PRICE_UNAVAILABLE', '지금은 시세를 가져올 수 없습니다'))).toBe(true)
  })

  it('결과가 정해진 실패(4xx)면 새 키를 쓴다', () => {
    expect(shouldReuseKey(new ApiError(422, 'INSUFFICIENT_CASH', '잔고가 부족합니다'))).toBe(false)
    expect(shouldReuseKey(new ApiError(409, 'IDEMPOTENCY_KEY_CONFLICT', '키 충돌'))).toBe(false)
  })
})

describe('주문 요청', () => {
  it('Idempotency-Key 헤더를 붙여 보낸다', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ orderId: 1 }), { status: 201 }))
    const api = createApiClient({
      fetch: fetch as unknown as typeof globalThis.fetch,
      tokens: { getAccess: () => 'a', getRefresh: () => 'r', save: () => {}, clear: () => {} },
    })

    await api.post('/api/v1/orders', { stockCode: '005930' }, { headers: { 'Idempotency-Key': 'k-1' } })

    const init = fetch.mock.calls[0] as unknown as [string, RequestInit]
    const headers = new Headers(init[1].headers)
    expect(headers.get('Idempotency-Key')).toBe('k-1')
    expect(headers.get('Authorization')).toBe('Bearer a')
  })
})
