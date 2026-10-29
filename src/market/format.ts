const won = new Intl.NumberFormat('ko-KR')

export function formatPrice(price: number | null | undefined): string {
  return price == null ? '—' : `${won.format(price)}원`
}

export function formatSigned(value: number): string {
  return value > 0 ? `+${won.format(value)}` : won.format(value)
}

export function formatRate(rate: number | null | undefined): string {
  if (rate == null) return '—'
  const fixed = Math.abs(rate).toFixed(2)
  return rate > 0 ? `+${fixed}%` : rate < 0 ? `-${fixed}%` : `${fixed}%`
}

// 국내 증시 관례: 상승은 빨강, 하락은 파랑
export function changeClass(value: number | null | undefined): string {
  if (value == null || value === 0) return 'flat'
  return value > 0 ? 'up' : 'down'
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
