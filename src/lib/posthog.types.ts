/**
 * PostHog API Types
 *
 * Type definitions for PostHog API requests and responses
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface PostHogTrendResponse {
  result: PostHogTrendResult[]
  next?: string
  timezone?: string
  is_cached?: boolean
}

export interface PostHogTrendResult {
  action?: {
    id: string
    name: string
    type: string
  }
  label: string
  count: number
  data: number[]
  labels: string[]
  days: string[]
  breakdown_value?: string
  aggregated_value?: number
}

export interface PostHogEventsResponse {
  results: PostHogEvent[]
  next?: string
}

export interface PostHogEvent {
  id: string
  distinct_id: string
  properties: Record<string, unknown>
  event: string
  timestamp: string
  person?: {
    id: string
    distinct_ids: string[]
    properties: Record<string, unknown>
  }
  elements?: PostHogElement[]
  count?: number
  distinct_id_count?: number
}

export interface PostHogElement {
  tag_name: string
  text?: string
  href?: string
  attr_class?: string[]
  attr_id?: string
  nth_child?: number
  nth_of_type?: number
  attributes: Record<string, string>
}

// ============================================================================
// Our Application Types
// ============================================================================

export interface TimePeriodData {
  date: string
  visitors: number
  pageviews?: number
  bounce_rate?: number
  visit_duration?: number
}

export interface PageData {
  page: string
  visitors: number
  pageviews: number
  bounce_rate: number
  visit_duration: number
}

export interface SourceData {
  source: string
  visitors: number
  bounce_rate: number
  visit_duration: number
}

export interface EventData {
  event: string
  count: number
  unique_users: number
}

export interface StatsData {
  visitors: { value: number; change: number | null }
  pageviews: { value: number; change: number | null }
  bounce_rate: { value: number; change: number | null }
  visit_duration: { value: number; change: number | null }
}

export interface PostHogData {
  stats: StatsData
  timeseries: TimePeriodData[]
  pages: PageData[]
  sources: SourceData[]
  events: EventData[]
  realtime: { visitors: number }
}

// ============================================================================
// API Request Types
// ============================================================================

export interface DateRange {
  date_from: string
  date_to: string
}

export interface TrendQuery {
  events: Array<{ id: string; math?: string }>
  date_from: string
  date_to: string
  interval?: 'hour' | 'day' | 'week' | 'month'
  breakdown?: string
}

export type TimePeriod = 'day' | '7d' | '30d' | '12mo'

// ============================================================================
// Configuration Types
// ============================================================================

export interface PostHogConfig {
  apiKey: string
  projectId: string
  apiHost: string
}
