import { ApiError } from '../api/ApiError.ts'

// 주문 결과를 모르는 실패(네트워크 오류, 5xx)면 같은 키로 다시 보낸다. 서버가 이미 체결했다면 그 결과를 그대로 돌려준다.
// 결과가 정해진 실패(4xx: 잔고 부족, 키 충돌 등)면 다음 주문은 새 키로 보낸다
export function shouldReuseKey(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true
  return error.status >= 500
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID()
}
