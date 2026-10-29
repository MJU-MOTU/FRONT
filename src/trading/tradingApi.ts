import { api } from '../api/index.ts'

export type Side = 'BUY' | 'SELL'

export type ExecutionView = {
  price: number
  quantity: number
  amount: number
  priceSource: 'LIVE' | 'STORED'
  realizedPnl: number | null
  executedAt: string
}

export type OrderResult = {
  orderId: number
  status: 'FILLED' | 'REJECTED'
  stockCode: string
  side: Side
  quantity: number
  execution: ExecutionView
  cashAfter: number
  createdAt: string
  replayed: boolean
}

export type OrderSummary = {
  orderId: number
  stockCode: string
  stockName: string | null
  side: Side
  quantity: number
  status: 'FILLED' | 'REJECTED'
  rejectReason: string | null
  execution: ExecutionView | null
  createdAt: string
}

export type Page<T> = { items: T[]; page: number; size: number; totalElements: number; totalPages: number }

export type Wallet = { cash: number; updatedAt: string }

export type HoldingView = {
  stockCode: string
  name: string | null
  quantity: number
  averagePrice: number
  totalCost: number
  currentPrice: number | null
  priceSource: 'LIVE' | 'STORED' | null
  evaluationAmount: number | null
  unrealizedPnl: number | null
  unrealizedPnlRate: number | null
}

export type Portfolio = {
  cash: number
  holdings: HoldingView[]
  totalCost: number
  totalEvaluation: number
  totalAsset: number
  totalUnrealizedPnl: number
  totalUnrealizedPnlRate: number
  partial: boolean
}

export const tradingApi = {
  placeOrder: (order: { stockCode: string; side: Side; quantity: number }, idempotencyKey: string) =>
    api.post<OrderResult>('/api/v1/orders', order, { headers: { 'Idempotency-Key': idempotencyKey } }),
  orders: (page = 0) => api.get<Page<OrderSummary>>(`/api/v1/orders?page=${page}&size=20`),
  wallet: () => api.get<Wallet>('/api/v1/wallet'),
  portfolio: () => api.get<Portfolio>('/api/v1/portfolio'),
}
