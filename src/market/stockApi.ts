import { api } from '../api/index.ts'

export type Market = 'KOSPI' | 'KOSDAQ'

export type StockSummary = {
  code: string
  name: string
  market: Market
  price: number | null
  changeRate: number | null
  priceAsOf: string | null
}

export type StockPage = {
  items: StockSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// LIVE: 방금 받은 시세, STORED: KIS를 못 불러 보여 주는 마지막 가격
export type Quote = {
  code: string
  price: number
  changeAmount: number
  changeRate: number
  asOf: string
  source: 'LIVE' | 'STORED'
}

export type StockDetail = { code: string; name: string; market: Market; quote: Quote | null }

export type Candle = { date: string; open: number; high: number; low: number; close: number; volume: number }

export type CandleResponse = { code: string; from: string; to: string; candles: Candle[] }

export function stockSearchPath(params: { query?: string; market?: Market | null; page?: number; size?: number }): string {
  const search = new URLSearchParams()
  if (params.query?.trim()) search.set('query', params.query.trim())
  if (params.market) search.set('market', params.market)
  search.set('page', String(params.page ?? 0))
  search.set('size', String(params.size ?? 20))
  return `/api/v1/stocks?${search}`
}

export const stockApi = {
  search: (params: Parameters<typeof stockSearchPath>[0]) => api.get<StockPage>(stockSearchPath(params)),
  detail: (code: string) => api.get<StockDetail>(`/api/v1/stocks/${encodeURIComponent(code)}`),
  candles: (code: string) => api.get<CandleResponse>(`/api/v1/stocks/${encodeURIComponent(code)}/candles`),
}
