import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useApiQuery } from '../api/useApiQuery.ts'
import { changeClass, formatPrice, formatRate } from '../market/format.ts'
import { stockApi, type Market } from '../market/stockApi.ts'

const MARKETS: { label: string; value: Market | null }[] = [
  { label: '전체', value: null },
  { label: '코스피', value: 'KOSPI' },
  { label: '코스닥', value: 'KOSDAQ' },
]

// 검색어·시장·페이지는 주소에 두어 새로고침하거나 링크를 공유해도 같은 목록이 나온다
export function StocksPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('query') ?? ''
  const market = (params.get('market') as Market | null) ?? null
  const page = Number(params.get('page') ?? 0)
  const [input, setInput] = useState(query)

  const { loading, data, error } = useApiQuery(() => stockApi.search({ query, market, page }), [query, market, page])

  function update(next: { query?: string; market?: Market | null; page?: number }) {
    const merged = { query, market, page: 0, ...next }
    const search = new URLSearchParams()
    if (merged.query) search.set('query', merged.query)
    if (merged.market) search.set('market', merged.market)
    if (merged.page) search.set('page', String(merged.page))
    setParams(search)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    update({ query: input.trim() })
  }

  return (
    <section>
      <h1>종목</h1>
      <form className="search" onSubmit={handleSubmit} role="search">
        <input aria-label="종목 검색" placeholder="종목명 또는 코드" value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">검색</button>
      </form>
      <div className="tabs" role="tablist">
        {MARKETS.map((m) => (
          <button
            key={m.label}
            type="button"
            role="tab"
            aria-selected={market === m.value}
            className={market === m.value ? 'tab active' : 'tab'}
            onClick={() => update({ market: m.value })}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && <p className="muted">불러오는 중…</p>}
      {error != null && <p className="error" role="alert">종목을 불러오지 못했습니다</p>}
      {data && data.items.length === 0 && <p className="muted">검색 결과가 없습니다</p>}
      {data && data.items.length > 0 && (
        <>
          <table className="stocks">
            <thead>
              <tr>
                <th>종목</th>
                <th className="num">현재가</th>
                <th className="num">등락률</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((s) => (
                <tr key={s.code}>
                  <td>
                    <Link to={`/stocks/${s.code}`}>{s.name}</Link>
                    <span className="muted code">{s.code} · {s.market === 'KOSPI' ? '코스피' : '코스닥'}</span>
                  </td>
                  <td className="num">{formatPrice(s.price)}</td>
                  <td className={`num ${changeClass(s.changeRate)}`}>{formatRate(s.changeRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pager">
            <button type="button" disabled={page <= 0} onClick={() => update({ page: page - 1 })}>이전</button>
            <span className="muted">{data.page + 1} / {Math.max(data.totalPages, 1)}</span>
            <button type="button" disabled={page + 1 >= data.totalPages} onClick={() => update({ page: page + 1 })}>다음</button>
          </div>
          <p className="muted">목록의 가격은 마지막으로 받은 가격입니다. 종목을 누르면 현재가를 다시 불러옵니다.</p>
        </>
      )}
    </section>
  )
}
