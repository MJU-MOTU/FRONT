import { useState } from 'react'
import { Link } from 'react-router'
import { useApiQuery } from '../api/useApiQuery.ts'
import { changeClass, formatDateTime, formatPrice } from '../market/format.ts'
import { tradingApi } from '../trading/tradingApi.ts'

const REJECT_REASONS: Record<string, string> = {
  INSUFFICIENT_CASH: '잔고 부족',
  INSUFFICIENT_QUANTITY: '보유 수량 부족',
}

export function OrdersPage() {
  const [page, setPage] = useState(0)
  const { loading, data, error } = useApiQuery(() => tradingApi.orders(page), [page])

  return (
    <section>
      <h1>주문 내역</h1>
      {loading && <p className="muted">불러오는 중…</p>}
      {error != null && <p className="error" role="alert">주문 내역을 불러오지 못했습니다</p>}
      {data && data.items.length === 0 && <p className="muted">아직 주문이 없습니다</p>}
      {data && data.items.length > 0 && (
        <>
          <table className="stocks">
            <thead>
              <tr>
                <th>시각</th>
                <th>종목</th>
                <th>구분</th>
                <th className="num">수량</th>
                <th className="num">체결가</th>
                <th className="num">금액</th>
                <th className="num">실현손익</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.orderId} className={o.status === 'REJECTED' ? 'rejected' : undefined}>
                  <td className="muted">{formatDateTime(o.createdAt)}</td>
                  <td><Link to={`/stocks/${o.stockCode}`}>{o.stockName ?? o.stockCode}</Link></td>
                  <td className={o.side === 'BUY' ? 'up' : 'down'}>
                    {o.side === 'BUY' ? '매수' : '매도'}
                    {o.status === 'REJECTED' && <span className="muted"> · 거절({REJECT_REASONS[o.rejectReason ?? ''] ?? o.rejectReason})</span>}
                  </td>
                  <td className="num">{o.quantity}주</td>
                  <td className="num">{formatPrice(o.execution?.price)}</td>
                  <td className="num">{formatPrice(o.execution?.amount)}</td>
                  <td className={`num ${changeClass(o.execution?.realizedPnl)}`}>{formatPrice(o.execution?.realizedPnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pager">
            <button type="button" disabled={page <= 0} onClick={() => setPage(page - 1)}>이전</button>
            <span className="muted">{data.page + 1} / {Math.max(data.totalPages, 1)}</span>
            <button type="button" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>다음</button>
          </div>
        </>
      )}
    </section>
  )
}
