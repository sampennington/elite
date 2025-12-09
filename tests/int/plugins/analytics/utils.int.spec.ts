import { describe, it, expect } from 'vitest'
import {
  getDateRange,
  getPreviousPeriodRange,
  calculateChange,
  formatNumber,
  formatChange,
  parseTimeseries,
  getTotalVisitors,
  extractAggregatedValue,
} from 'payload-posthog-analytics/lib/utils'
import type { PostHogTrendResponse, TimePeriodData } from 'payload-posthog-analytics/lib/posthog.types'

describe('getDateRange', () => {
  it('should return date range for last 24 hours', () => {
    const result = getDateRange('day')
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const fromDate = new Date(result.dateFrom).getDate()
    const toDate = new Date(result.dateTo).getDate()

    expect(fromDate).toBe(yesterday.getDate())
    expect(toDate).toBe(now.getDate())
  })

  it('should return date range for last 7 days', () => {
    const result = getDateRange('7d')
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const fromDate = new Date(result.dateFrom).getDate()

    expect(fromDate).toBe(sevenDaysAgo.getDate())
  })

  it('should return date range for last 30 days', () => {
    const result = getDateRange('30d')
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const fromDate = new Date(result.dateFrom).getDate()

    expect(fromDate).toBe(thirtyDaysAgo.getDate())
  })

  it('should return date range for last 12 months', () => {
    const result = getDateRange('12mo')
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    const fromYear = new Date(result.dateFrom).getFullYear()

    expect(fromYear).toBe(oneYearAgo.getFullYear())
  })
})

describe('getPreviousPeriodRange', () => {
  it('should return previous period range for day', () => {
    const result = getPreviousPeriodRange('day')
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const fromDate = new Date(result.dateFrom).getDate()
    const toDate = new Date(result.dateTo).getDate()

    expect(fromDate).toBe(twoDaysAgo.getDate())
    expect(toDate).toBe(oneDayAgo.getDate())
  })

  it('should return previous period range for 7d', () => {
    const result = getPreviousPeriodRange('7d')
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const fromDate = new Date(result.dateFrom).getDate()
    const toDate = new Date(result.dateTo).getDate()

    expect(fromDate).toBe(fourteenDaysAgo.getDate())
    expect(toDate).toBe(sevenDaysAgo.getDate())
  })
})

describe('calculateChange', () => {
  it('should calculate positive percentage change', () => {
    expect(calculateChange(150, 100)).toBe(50)
  })

  it('should calculate negative percentage change', () => {
    expect(calculateChange(75, 100)).toBe(-25)
  })

  it('should return null when previous is 0 and current is 0', () => {
    expect(calculateChange(0, 0)).toBe(null)
  })

  it('should return 100 when previous is 0 and current is positive', () => {
    expect(calculateChange(50, 0)).toBe(100)
  })

  it('should return 0 when both values are equal', () => {
    expect(calculateChange(100, 100)).toBe(0)
  })
})

describe('formatNumber', () => {
  it('should format numbers less than 1000 as-is', () => {
    expect(formatNumber(500)).toBe('500')
    expect(formatNumber(999)).toBe('999')
  })

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.5K')
    expect(formatNumber(25000)).toBe('25.0K')
    expect(formatNumber(999999)).toBe('1000.0K')
  })

  it('should format millions with M suffix', () => {
    expect(formatNumber(1500000)).toBe('1.5M')
    expect(formatNumber(3200000)).toBe('3.2M')
  })
})

describe('formatChange', () => {
  it('should format positive change with + prefix', () => {
    const result = formatChange(25.7)
    expect(result.text).toBe('+26%')
    expect(result.isPositive).toBe(true)
  })

  it('should format negative change without + prefix', () => {
    const result = formatChange(-12.3)
    expect(result.text).toBe('-12%')
    expect(result.isPositive).toBe(false)
  })

  it('should format zero change', () => {
    const result = formatChange(0)
    expect(result.text).toBe('0%')
    expect(result.isPositive).toBe(false)
  })

  it('should format null as zero', () => {
    const result = formatChange(null)
    expect(result.text).toBe('0%')
    expect(result.isPositive).toBe(false)
  })
})

describe('parseTimeseries', () => {
  it('should parse valid trend data into timeseries', () => {
    const mockData: PostHogTrendResponse = {
      result: [
        {
          label: 'Visitors',
          count: 300,
          data: [100, 150, 50],
          labels: ['2024-01-01', '2024-01-02', '2024-01-03'],
          days: ['2024-01-01', '2024-01-02', '2024-01-03'],
        },
      ],
    }

    const result = parseTimeseries(mockData)

    expect(result).toEqual([
      { date: '2024-01-01', visitors: 100 },
      { date: '2024-01-02', visitors: 150 },
      { date: '2024-01-03', visitors: 50 },
    ])
  })

  it('should return empty array for null data', () => {
    expect(parseTimeseries(null)).toEqual([])
  })

  it('should return empty array for missing result', () => {
    const mockData: PostHogTrendResponse = {
      result: [],
    }
    expect(parseTimeseries(mockData)).toEqual([])
  })
})

describe('getTotalVisitors', () => {
  it('should sum visitors from timeseries', () => {
    const timeseries: TimePeriodData[] = [
      { date: '2024-01-01', visitors: 100 },
      { date: '2024-01-02', visitors: 150 },
      { date: '2024-01-03', visitors: 50 },
    ]

    expect(getTotalVisitors(timeseries)).toBe(300)
  })

  it('should return 0 for empty timeseries', () => {
    expect(getTotalVisitors([])).toBe(0)
  })
})

describe('extractAggregatedValue', () => {
  it('should extract aggregated_value when present', () => {
    const mockData: PostHogTrendResponse = {
      result: [
        {
          label: 'Pageviews',
          count: 500,
          data: [],
          labels: [],
          days: [],
          aggregated_value: 1234,
        },
      ],
    }

    expect(extractAggregatedValue(mockData)).toBe(1234)
  })

  it('should fall back to count when aggregated_value is missing', () => {
    const mockData: PostHogTrendResponse = {
      result: [
        {
          label: 'Pageviews',
          count: 500,
          data: [],
          labels: [],
          days: [],
        },
      ],
    }

    expect(extractAggregatedValue(mockData)).toBe(500)
  })

  it('should return 0 for null data', () => {
    expect(extractAggregatedValue(null)).toBe(0)
  })

  it('should return 0 for missing result', () => {
    const mockData: PostHogTrendResponse = {
      result: [],
    }

    expect(extractAggregatedValue(mockData)).toBe(0)
  })
})
