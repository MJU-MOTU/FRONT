import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/ApiError.ts'
import { useApiQuery } from '../api/useApiQuery.ts'
import { formatPrice } from '../market/format.ts'
import { newIdempotencyKey, shouldReuseKey } from './idempotency.ts'
import { tradingApi, type OrderResult, type Side } from './tradingApi.ts'

type Props = { stockCode: string; price: number | null; onFilled: () => void }

export function OrderForm({ stockCode, price, onFilled }: Props) {
  const [side, setSide] = useState<Side>('BUY')
  const [quantity, setQuantity] = useState(1)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<OrderResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const portfolio = useApiQuery(() => tradingApi.portfolio(), [stockCode, version], { keepPrevious: true })
  const cash = portfolio.data?.cash
  const held = portfolio.data?.holdings.find((h) => h.stockCode === stockCode)?.quantity ?? 0
  const estimate = price != null ? price * quantity : null

  // 주문 내용이 바뀌면 다른 주문이므로 키를 새로 만든다(같은 키에 다른 내용이면 서버가 409로 막는다)
  function change(next: { side?: Side; quantity?: number }) {
    if (next.side) setSide(next.side)
    if (next.quantity != null) setQuantity(next.quantity)
    setPendingKey(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const key = pendingKey ?? newIdempotencyKey()
    setPendingKey(key)
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const filled = await tradingApi.placeOrder({ stockCode, side, quantity }, key)
      setResult(filled)
      setPendingKey(null)
      setVersion((v) => v + 1)
      onFilled()
    } catch (e) {
      if (!shouldReuseKey(e)) setPendingKey(null)
      setError(e instanceof ApiError ? e.message : '주문 결과를 확인하지 못했습니다. 다시 누르면 같은 주문으로 확인합니다')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="order" onSubmit={handleSubmit} aria-label="주문">
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={side === 'BUY'} className={side === 'BUY' ? 'tab active buy' : 'tab'} onClick={() => change({ side: 'BUY' })}>매수</button>
        <button type="button" role="tab" aria-selected={side === 'SELL'} className={side === 'SELL' ? 'tab active sell' : 'tab'} onClick={() => change({ side: 'SELL' })}>매도</button>
      </div>
      <label>
        수량
        <input type="number" min={1} max={1000000} step={1} required value={quantity} onChange={(e) => change({ quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)) })} />
      </label>
      <dl className="order-info">
        <dt>예상 금액</dt>
        <dd>{formatPrice(estimate)}</dd>
        <dt>{side === 'BUY' ? '주문 가능 현금' : '보유 수량'}</dt>
        <dd>{side === 'BUY' ? formatPrice(cash) : `${held}주`}</dd>
      </dl>
      <button type="submit" className={side === 'BUY' ? 'buy' : 'sell'} disabled={submitting || price == null}>
        {submitting ? '주문 중…' : side === 'BUY' ? '시장가 매수' : '시장가 매도'}
      </button>
      {price == null && <p className="muted">시세가 없어 지금은 주문할 수 없습니다</p>}
      {result && (
        <p className="success" role="status">
          체결: {result.execution.quantity}주 × {formatPrice(result.execution.price)} = {formatPrice(result.execution.amount)}
          {result.execution.priceSource === 'STORED' && ' (마지막으로 받은 가격)'}
          {result.execution.realizedPnl != null && ` · 실현손익 ${formatPrice(result.execution.realizedPnl)}`}
        </p>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  )
}
