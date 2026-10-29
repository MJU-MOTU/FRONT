import { describe, expect, it } from 'vitest'
import { changeClass, formatPrice, formatRate, formatSigned } from './format.ts'
import { stockSearchPath } from './stockApi.ts'

describe('시세 표시', () => {
  it('가격은 원 단위로 천 단위 구분, 없으면 대시', () => {
    expect(formatPrice(71200)).toBe('71,200원')
    expect(formatPrice(null)).toBe('—')
  })

  it('등락은 부호를 붙이고 상승 빨강·하락 파랑 클래스', () => {
    expect(formatSigned(800)).toBe('+800')
    expect(formatSigned(-800)).toBe('-800')
    expect(formatRate(1.1)).toBe('+1.10%')
    expect(formatRate(-1.11)).toBe('-1.11%')
    expect(formatRate(0)).toBe('0.00%')
    expect(changeClass(1)).toBe('up')
    expect(changeClass(-1)).toBe('down')
    expect(changeClass(0)).toBe('flat')
  })
})

describe('stockSearchPath', () => {
  it('빈 검색어는 빼고 시장·페이지를 붙인다', () => {
    expect(stockSearchPath({ query: '  ', market: null })).toBe('/api/v1/stocks?page=0&size=20')
    expect(stockSearchPath({ query: ' 삼성 ', market: 'KOSPI', page: 1 })).toBe(
      '/api/v1/stocks?query=%EC%82%BC%EC%84%B1&market=KOSPI&page=1&size=20',
    )
  })
})
