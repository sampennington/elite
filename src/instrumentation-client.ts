import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

  if (key) {
    console.log('Initializing PostHog with key:', key)
    posthog.init(key, {
      api_host: '/ingest', // Use reverse proxy to bypass ad blockers
      ui_host: 'https://us.i.posthog.com', // PostHog UI host for surveys, etc.
      defaults: '2025-05-24',
      capture_pageview: true,
      capture_pageleave: true, // Also capture when users leave pages
    })
  } else {
    console.warn('NEXT_PUBLIC_POSTHOG_KEY not found. PostHog will not be initialized.')
  }
}
