import { Endpoint } from 'payload'
import { getPostHogData } from '@/plugins/analytics/lib/posthog'
import { TimePeriod } from '@/plugins/analytics/lib/posthog.types'

export const analyticsDataEndpoint: Endpoint = {
  path: '/analytics/data',
  method: 'get',
  handler: async (req) => {
    try {
      const period = req.query.period || '7d'
      const data = await getPostHogData(period as TimePeriod)

      if (!data) {
        return Response.json(
          { error: 'Failed to fetch analytics data' },
          { status: 500 },
        )
      }

      return Response.json(data)
    } catch (e) {
      console.error('Analytics data endpoint error:', e)
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
}
