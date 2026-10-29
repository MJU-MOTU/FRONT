import { Link } from 'react-router'
import { useApiQuery } from '../api/useApiQuery.ts'
import { changeClass, formatPrice, formatRate } from '../market/format.ts'
import { tradingApi } from '../trading/tradingApi.ts'

const won = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })

export function PortfolioPage() {
  const { loading, data, error } = useApiQuery(() => tradingApi.portfolio(), [])

  if (loading) return <p className="muted">불러오는 중…</p>
  if (error != null || !data) return <p className="error" role="alert">포트폴리오를 불러오지 못했습니다</p>

  return (
    <section>
      <h1>포트폴리오</h1>
      <div className="summary">
        <div><span className="muted">총자산</span><strong>{formatPrice(data.totalAsset)}</strong></div>
        <div><span className="muted">현금</span><strong>{formatPrice(data.cash)}</strong></div>
        <div><span className="muted">평가금액</span><strong>{formatPrice(data.totalEvaluation)}</strong></div>
        <div>
          <span className="muted">평가손익</span>
          <strong className={changeClass(data.totalUnrealizedPnl)}>
            {formatPrice(data.totalUnrealizedPnl)} ({formatRate(data.totalUnrealizedPnlRate)})
          </strong>
        </div>
      </div>
      {data.partial && <p className="muted">일부 종목은 시세가 없어 매입금액으로 계산했습니다</p>}

      {data.holdings.length === 0 ? (
        <p className="muted">보유한 종목이 없습니다. <Link to="/stocks">종목 둘러보기 →</Link></p>
      ) : (
        <table className="stocks">
          <thead>
            <tr>
              <th>종목</th>
              <th className="num">수량</th>
              <th className="num">평균단가</th>
              <th className="num">현재가</th>
              <th className="num">평가금액</th>
              <th className="num">손익</th>
            </tr>
          </thead>
          <tbody>
            {data.holdings.map((h) => (
              <tr key={h.stockCode}>
                <td><Link to={`/stocks/${h.stockCode}`}>{h.name ?? h.stockCode}</Link></td>
                <td className="num">{h.quantity}주</td>
                <td className="num">{won.format(h.averagePrice)}원</td>
                <td className="num">{formatPrice(h.currentPrice)}</td>
                <td className="num">{formatPrice(h.evaluationAmount)}</td>
                <td className={`num ${changeClass(h.unrealizedPnl)}`}>
                  {h.unrealizedPnl == null ? '—' : `${formatPrice(h.unrealizedPnl)} (${formatRate(h.unrealizedPnlRate)})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
