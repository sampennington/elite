import { TimePeriod, DateRange } from "./posthog.types"

export function getDateRange(period: TimePeriod): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let dateFrom: Date

  switch (period) {
    case 'day':
      dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '12mo':
      dateFrom = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
      break
    default:
      dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  return {
    date_from: dateFrom.toISOString(),
    date_to: now.toISOString(),
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatChange(change: number | null): { text: string; isPositive: boolean } {
  if (change === null || change === 0) {
    return { text: '0%', isPositive: false }
  }

  const isPositive = change > 0
  const text = `${isPositive ? '+' : ''}${Math.round(change)}%`
  return { text, isPositive }
}
