import { CandlestickSeries, createChart } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import type { Candle } from '../market/stockApi.ts'

export function CandleChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      autoSize: true,
      layout: { background: { color: '#fff' }, textColor: '#333' },
      grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
      timeScale: { borderColor: '#ddd' },
      rightPriceScale: { borderColor: '#ddd' },
    })
    // 국내 증시 관례에 맞춰 상승 빨강, 하락 파랑
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#d32f2f',
      borderUpColor: '#d32f2f',
      wickUpColor: '#d32f2f',
      downColor: '#1565c0',
      borderDownColor: '#1565c0',
      wickDownColor: '#1565c0',
      // 국내 주가는 원 단위 정수다
      priceFormat: { type: 'price', precision: 0, minMove: 1 },
    })
    series.setData(candles.map((c) => ({ time: c.date, open: c.open, high: c.high, low: c.low, close: c.close })))
    chart.timeScale().fitContent()

    return () => chart.remove()
  }, [candles])

  return <div ref={containerRef} className="chart" data-testid="candle-chart" />
}
