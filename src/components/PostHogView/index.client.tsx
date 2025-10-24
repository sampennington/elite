'use client'

import React, { useEffect, useState } from 'react'
import {
  formatNumber,
  formatDuration,
  formatPercentage,
  type PostHogData,
} from '@/lib/posthog'
import { SelectInput } from '@payloadcms/ui'
import type { OptionObject } from 'payload'
import { AnalyticsCard } from '@/components/AnalyticsCard'
import { Table } from '@/components/Table'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

// Format dates for the x-axis based on the period
function formatAxisDate(
  dateStr: string,
  period: string,
  _index?: number,
  _total?: number,
): string {
  const date = new Date(dateStr)

  if (period === 'day') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  } else if (period === '12mo') {
    const month = date.getMonth()
    if (month === 0) {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short' })
  } else if (period === '30d') {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
  }
}

// Format dates for tooltips with details
function formatTooltipDate(dateStr: string, period: string): string {
  const date = new Date(dateStr)
  if (period === 'day') {
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    )
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

export const AnalyticsClient: React.FC = () => {
  const [data, setData] = useState<PostHogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/detailed?period=${period}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  if (loading) {
    return <div>Loading analytics...</div>
  }

  if (error || !data) {
    return <div>{error || 'Unable to load analytics data'}</div>
  }

  const { stats, timeseries, pages, sources, events, realtime } = data

  const options = [
    { value: 'day', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '12mo', label: 'Last 12 months' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__group" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        <SelectInput
          name={'time-select'}
          path={'time-select'}
          label={'Time Period:'}
          options={options}
          value={period}
          onChange={(period) => setPeriod((period as OptionObject).value)}
        />
      </div>
      <div className="dashboard__group">
        <h2 className="dashboard__label">Overview</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            fontSize: '1rem',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: realtime.visitors > 0 ? '#10b981' : '#666',
            }}
          />
          <span>
            {realtime.visitors} visitor{realtime.visitors !== 1 ? 's' : ''} online now
          </span>
        </div>
        <ul className="dashboard__card-list" style={{ marginBottom: '2rem' }}>
          <AnalyticsCard
            title={'Visitors'}
            value={stats.visitors.value}
            change={stats.visitors.change}
            formatter={formatNumber}
            positiveIsGood={true}
          />
          <AnalyticsCard
            title={'Page Views'}
            value={stats.pageviews.value}
            change={stats.pageviews.change}
            formatter={formatNumber}
            positiveIsGood={true}
          />
          <AnalyticsCard
            title={'Bounce Rate'}
            value={stats.bounce_rate.value}
            change={stats.bounce_rate.change}
            formatter={formatPercentage}
            positiveIsGood={false}
          />
          <AnalyticsCard
            title={'Visit Duration'}
            value={stats.visit_duration.value}
            change={stats.visit_duration.change}
            formatter={formatDuration}
            positiveIsGood={true}
          />
        </ul>
      </div>

      <div className="dashboard__group" style={{ margin: '0 0 2rem' }}>
        <h3 style={{ marginBottom: '2rem' }}>Visitors Over Time</h3>
        {timeseries.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeseries} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="var(--theme-elevation-200)" />
              <XAxis
                dataKey="date"
                tickFormatter={(value, index) =>
                  formatAxisDate(value, period, index, timeseries.length)
                }
                tick={{ fill: 'var(--theme-elevation-600)' }}
                stroke="var(--theme-elevation-500)"
                style={{ fontSize: '0.75rem' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--theme-elevation-500)"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: 'var(--theme-elevation-600)' }}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--theme-elevation-50)',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: '4px',
                  color: 'var(--theme-text-dark)',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{
                  color: 'var(--theme-text-light)',
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: 'var(--theme-text-dark)',
                }}
                labelFormatter={(value) => formatTooltipDate(value, period)}
                formatter={(value: number) => [`${formatNumber(value)} visitors`]}
                separator=""
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitors)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p>No data available for this period</p>
        )}
      </div>

      <div className="dashboard__group">
        {pages.length > 0 && (
          <Table
            title="Top Pages"
            columns={[
              { key: 'page', label: 'Page' },
              { key: 'visitors', label: 'Visitors', formatter: formatNumber },
              { key: 'pageviews', label: 'Pageviews', formatter: formatNumber },
              { key: 'bounce_rate', label: 'Bounce Rate', formatter: formatPercentage },
            ]}
            rows={pages}
          />
        )}
        {sources.length > 0 && (
          <Table
            title="Top Sources"
            columns={[
              { key: 'source', label: 'Source' },
              { key: 'visitors', label: 'Visitors', formatter: formatNumber },
              { key: 'bounce_rate', label: 'Bounce Rate', formatter: formatPercentage },
              { key: 'visit_duration', label: 'Visit Duration', formatter: formatDuration },
            ]}
            rows={sources}
          />
        )}
        {events && events.length > 0 && (
          <Table
            title="Custom Events"
            columns={[
              { key: 'event', label: 'Event' },
              { key: 'unique_users', label: 'Unique Users', formatter: formatNumber },
              { key: 'count', label: 'Total Events', formatter: formatNumber },
            ]}
            rows={events}
          />
        )}
      </div>
    </div>
  )
}
