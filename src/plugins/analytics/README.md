# PostHog Analytics Plugin for Payload CMS

A comprehensive analytics dashboard plugin for Payload CMS with PostHog integration. This plugin adds a beautiful analytics view to your Payload admin panel, showing visitor stats, page views, traffic sources, and custom events.

## Features

- **Analytics Dashboard**: Beautiful admin view with charts and tables
- **PostHog Integration**: Fetch data from PostHog API
- **Reverse Proxy Support**: Bypass ad blockers by proxying PostHog requests
- **Time Period Selection**: View data for last 24 hours, 7 days, 30 days, or 12 months
- **Metrics Tracking**:
  - Unique visitors (Daily Active Users)
  - Page views
  - Top pages
  - Traffic sources
  - Custom events
- **Visual Charts**: Line charts showing visitor trends over time
- **Data Tables**: Sortable tables for pages, sources, and events

## Installation

### 1. Install Dependencies

This plugin requires PostHog client libraries:

```bash
pnpm add posthog-js posthog-node recharts
```

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```env
POSTHOG_PROJECT_ID=your_project_id
POSTHOG_API_KEY=your_personal_api_key
POSTHOG_API_HOST=https://app.posthog.com  # Optional, defaults to this value
```

**Note:** You need a PostHog **Personal API Key** (not the public token) to fetch analytics data. Get it from PostHog Settings → Personal API Keys.

### 3. Add Plugin to Payload Config

In your `src/plugins/index.ts`:

```typescript
import { analyticsPlugin } from './analytics'

export const plugins: Plugin[] = [
  // ... other plugins
  analyticsPlugin({
    adminView: {
      path: '/analytics',
      label: 'Analytics',
    },
  }),
]
```

### 4. Configure Next.js Rewrites

In your `next.config.js`:

```javascript
import { getAnalyticsRewrites } from './src/plugins/analytics/index.ts'

const nextConfig = {
  async rewrites() {
    return getAnalyticsRewrites()
  },
}
```

This sets up a reverse proxy to bypass ad blockers.

### 5. Generate Import Map

After adding the plugin, regenerate your Payload import map:

```bash
pnpm generate:importmap
```

## Usage

Once configured, navigate to `/admin/analytics` in your Payload admin panel to view your analytics dashboard.

## Plugin Options

```typescript
interface AnalyticsPluginOptions {
  enabled?: boolean // Enable/disable plugin (default: true)

  posthog?: {
    projectId?: string
    apiKey?: string
    apiHost?: string // Default: https://app.posthog.com
  }

  adminView?: {
    path?: string        // Default: /analytics
    label?: string       // Default: Analytics
    requireAuth?: boolean // Default: true
  }

  reverseProxy?: {
    enabled?: boolean     // Default: true
    ingestPath?: string   // Default: /ingest
  }
}
```

## API Endpoint

The plugin automatically adds a Payload REST endpoint:

```
GET /api/analytics/data?period=7d
```

**Query Parameters:**
- `period`: `day` | `7d` | `30d` | `12mo`

**Response:**
```json
{
  "stats": {
    "visitors": { "value": 1234, "change": null },
    "pageviews": { "value": 5678, "change": null },
    "bounce_rate": { "value": 0, "change": null },
    "visit_duration": { "value": 0, "change": null }
  },
  "timeseries": [
    { "date": "2024-10-21T00:00:00Z", "visitors": 123 }
  ],
  "pages": [
    { "page": "/home", "visitors": 100, "pageviews": 150, "bounce_rate": 0, "visit_duration": 0 }
  ],
  "sources": [
    { "source": "google.com", "visitors": 50, "bounce_rate": 0, "visit_duration": 0 }
  ],
  "events": [
    { "event": "button_click", "count": 25, "unique_users": 20 }
  ]
}
```

## Exporting as npm Package

To share this plugin across multiple projects:

1. Move the `src/plugins/analytics` folder to a new package
2. Create a `package.json`:

```json
{
  "name": "@your-org/payload-posthog-analytics",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "payload": "^3.0.0",
    "posthog-js": "^1.0.0",
    "posthog-node": "^4.0.0",
    "recharts": "^2.0.0"
  }
}
```

3. Publish to npm
4. Install in other projects:

```bash
npm install @your-org/payload-posthog-analytics
```

## Directory Structure

```
src/plugins/analytics/
├── index.ts                    # Plugin entry point
├── types.ts                    # TypeScript types
├── README.md                   # Documentation
├── lib/
│   ├── posthog-api-client.ts  # PostHog API client
│   ├── posthog.ts             # Data fetching logic
│   ├── posthog.types.ts       # API types
│   ├── utils.ts               # Utility functions
│   └── use-analytics.ts       # React hook
├── components/
│   ├── AnalyticsView.tsx      # Admin view wrapper
│   ├── AnalyticsDashboard.tsx # Dashboard UI
│   └── utils.ts               # Component utils
└── endpoints/
    └── data.ts                # Payload endpoint
```

## License

This plugin is part of your Payload CMS project and follows the same license.
