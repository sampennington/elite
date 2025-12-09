import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

// Inline analytics rewrites to avoid importing from workspace before Next.js starts
const getAnalyticsRewrites = (options = {}) => {
  const ingestPath = options?.ingestPath || '/ingest'
  const posthogHost = options?.posthogHost || 'https://us.i.posthog.com'
  const posthogAssetsHost = options?.posthogAssetsHost || 'https://us-assets.i.posthog.com'

  return [
    {
      source: `${ingestPath}/static/:path*`,
      destination: `${posthogAssetsHost}/static/:path*`,
    },
    {
      source: `${ingestPath}/:path*`,
      destination: `${posthogHost}/:path*`,
    },
  ]
}

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  async rewrites() {
    return getAnalyticsRewrites()
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
