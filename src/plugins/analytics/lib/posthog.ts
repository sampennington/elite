import { createPostHogAPIClient } from '@/plugins/analytics/lib/posthog-api-client'
import type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
  PostHogTrendResult,
  PostHogEvent,
} from '@/plugins/analytics/lib/posthog.types'
import { getDateRange } from '@/plugins/analytics/lib/utils'

export type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
}


export async function getPostHogData(period: TimePeriod = '7d'): Promise<PostHogData | null> {
  const client = createPostHogAPIClient()
  const { date_from, date_to } = getDateRange(period)

  if (!client) {
    return null
  }

  try {
    const interval = period === 'day' ? 'hour' : period === '12mo' ? 'month' : 'day'
    const dateRange = { date_from, date_to }

    const [visitorsData, pageviewsData, topPagesData, sourcesData, eventsData] =
      await Promise.all([
        client.getVisitorsTrend(dateRange, interval),
        client.getPageviewsTotal(dateRange),
        client.getTopPages(dateRange),
        client.getTrafficSources(dateRange),
        client.getEvents(),
      ])

    const timeseries: TimePeriodData[] =
      visitorsData?.result?.[0]?.data?.map((value: number, index: number) => ({
        date: visitorsData.result[0].labels[index],
        visitors: value,
      })) || []

    const totalVisitors = timeseries.reduce((sum, item) => sum + item.visitors, 0)
    const totalPageviews =
      pageviewsData?.result?.[0]?.aggregated_value || pageviewsData?.result?.[0]?.count || 0

    const stats: StatsData = {
      visitors: { value: totalVisitors, change: null },
      pageviews: { value: totalPageviews, change: null },
      bounce_rate: { value: 0, change: null },
      visit_duration: { value: 0, change: null },
    }

    const pages: PageData[] =
      topPagesData?.result?.slice(0, 10).map((item: PostHogTrendResult) => ({
        page: item.breakdown_value || 'Unknown',
        visitors: item.count || 0,
        pageviews: item.count || 0,
        bounce_rate: 0,
        visit_duration: 0,
      })) || []

    const sources: SourceData[] =
      sourcesData?.result?.slice(0, 10).map((item: PostHogTrendResult) => ({
        source: item.breakdown_value || 'Direct',
        visitors: item.count || 0,
        bounce_rate: 0,
        visit_duration: 0,
      })) || []

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
    }
  } catch (e) {
    console.error('Error fetching PostHog data:', e)
    return null
  }
}
