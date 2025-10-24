import { NextRequest, NextResponse } from 'next/server'
import { getPostHogData } from '@/lib/posthog'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get('period') || '7d'
    const data = await getPostHogData(period)

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 },
      )
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error('Analytics detailed error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
