export type FieldError = { field: string; message: string }

// 백엔드는 RFC 9457 Problem Details에 code를 더해 에러를 준다. 화면은 code로 분기한다
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly errors: FieldError[]

  constructor(status: number, code: string, title: string, errors: FieldError[] = []) {
    super(title)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = await response.json()
    return new ApiError(response.status, body.code ?? 'UNKNOWN', body.title ?? '요청에 실패했습니다', body.errors ?? [])
  } catch {
    return new ApiError(response.status, 'UNKNOWN', '요청에 실패했습니다')
  }
}
