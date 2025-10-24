import { createPostHogAPIClient } from './posthog-api-client'
import type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
  DateRange,
  PostHogTrendResult,
  PostHogEvent,
} from './posthog.types'

// Re-export types for convenience
export type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
}

// Helper function to calculate date ranges
function getDateRange(period: TimePeriod): DateRange {
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

// Main function to get all analytics data using PostHog Query API
export async function getPostHogData(period: TimePeriod = '7d'): Promise<PostHogData | null> {
  const client = createPostHogAPIClient()
  const { date_from, date_to } = getDateRange(period)

  if (!client) {
    return null
  }

  try {
    const interval = period === 'day' ? 'hour' : period === '12mo' ? 'month' : 'day'
    const dateRange = { date_from, date_to }

    // Fetch all data in parallel using our clean API client
    const [visitorsData, pageviewsData, topPagesData, sourcesData, eventsData] =
      await Promise.all([
        client.getVisitorsTrend(dateRange, interval),
        client.getPageviewsTotal(dateRange),
        client.getTopPages(dateRange),
        client.getTrafficSources(dateRange),
        client.getEvents(),
      ])

    // Log responses for debugging
    console.log('Visitors data:', JSON.stringify(visitorsData, null, 2))
    console.log('Pageviews data:', JSON.stringify(pageviewsData, null, 2))

    // Process visitors timeseries
    const timeseries: TimePeriodData[] =
      visitorsData?.result?.[0]?.data?.map((value: number, index: number) => ({
        date: visitorsData.result[0].labels[index],
        visitors: value,
      })) || []

    // Calculate stats (simplified)
    const totalVisitors = timeseries.reduce((sum, item) => sum + item.visitors, 0)
    const totalPageviews =
      pageviewsData?.result?.[0]?.aggregated_value || pageviewsData?.result?.[0]?.count || 0

    const stats: StatsData = {
      visitors: { value: totalVisitors, change: null },
      pageviews: { value: totalPageviews, change: null },
      bounce_rate: { value: 0, change: null },
      visit_duration: { value: 0, change: null },
    }

    // Process top pages
    const pages: PageData[] =
      topPagesData?.result?.slice(0, 10).map((item: PostHogTrendResult) => ({
        page: item.breakdown_value || 'Unknown',
        visitors: item.count || 0,
        pageviews: item.count || 0,
        bounce_rate: 0,
        visit_duration: 0,
      })) || []

    // Process sources
    const sources: SourceData[] =
      sourcesData?.result?.slice(0, 10).map((item: PostHogTrendResult) => ({
        source: item.breakdown_value || 'Direct',
        visitors: item.count || 0,
        bounce_rate: 0,
        visit_duration: 0,
      })) || []

    // Process events
    const events: EventData[] =
      eventsData?.results?.slice(0, 10).map((item: PostHogEvent) => ({
        event: item.event || 'Unknown',
        count: item.count || 0,
        unique_users: item.distinct_id_count || 0,
      })) || []

    return {
      stats,
      timeseries,
      pages,
      sources,
      events,
      realtime: { visitors: 0 }, // PostHog doesn't have native realtime API
    }
  } catch (e) {
    console.error('Error fetching PostHog data:', e)
    return null
  }
}

// Formatting utilities
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function formatChange(change: number | null): { text: string; isPositive: boolean } {
  if (change === null || change === 0) {
    return { text: '0%', isPositive: false }
  }

  const isPositive = change > 0
  const text = `${isPositive ? '+' : ''}${Math.round(change)}%`
  return { text, isPositive }
}
