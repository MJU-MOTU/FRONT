import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError } from '../api/ApiError.ts'
import { useApiQuery } from '../api/useApiQuery.ts'
import { changeClass, formatDateTime, formatPrice, formatRate, formatSigned } from '../market/format.ts'
import { stockApi } from '../market/stockApi.ts'

// 차트 라이브러리는 크기가 커서 상세 화면에 들어올 때만 내려받는다
const CandleChart = lazy(() => import('../components/CandleChart.tsx').then((m) => ({ default: m.CandleChart })))

export function StockDetailPage() {
  const { code = '' } = useParams()
  const detail = useApiQuery(() => stockApi.detail(code), [code])
  const candles = useApiQuery(() => stockApi.candles(code), [code])

  if (detail.loading) return <p className="muted">불러오는 중…</p>
  if (detail.error instanceof ApiError && detail.error.code === 'STOCK_NOT_FOUND') {
    return <p className="error" role="alert">없는 종목입니다. <Link to="/stocks">종목 목록으로</Link></p>
  }
  if (!detail.data) return <p className="error" role="alert">종목을 불러오지 못했습니다</p>

  const { name, market, quote } = detail.data

  return (
    <section>
      <p><Link to="/stocks">← 종목</Link></p>
      <h1>{name} <span className="muted code">{code} · {market === 'KOSPI' ? '코스피' : '코스닥'}</span></h1>

      {quote ? (
        <div className="quote">
          <strong className="price">{formatPrice(quote.price)}</strong>
          <span className={changeClass(quote.changeAmount)}>
            {formatSigned(quote.changeAmount)} ({formatRate(quote.changeRate)})
          </span>
          <span className="muted">
            {quote.source === 'LIVE' ? '현재가' : `마지막으로 받은 가격 · ${formatDateTime(quote.asOf)}`}
          </span>
        </div>
      ) : (
        <p className="muted" role="status">지금은 시세를 가져올 수 없습니다</p>
      )}

      <h2>일봉 (최근 3개월)</h2>
      {candles.loading && <p className="muted">차트를 불러오는 중…</p>}
      {candles.error != null && <p className="muted" role="status">차트를 불러올 수 없습니다</p>}
      {candles.data && candles.data.candles.length > 0 && (
        <Suspense fallback={<p className="muted">차트를 불러오는 중…</p>}>
          <CandleChart candles={candles.data.candles} />
        </Suspense>
      )}
      {candles.data && candles.data.candles.length === 0 && <p className="muted">표시할 거래일이 없습니다</p>}
    </section>
  )
}
