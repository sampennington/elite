# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Payload CMS website template** with internationalization (i18n) support. It's a monolithic Next.js App Router application that serves both the CMS admin panel and the public-facing website in a single deployment.

**Tech Stack:**
- **CMS**: Payload CMS 3.60.0
- **Frontend**: Next.js 15.4.4 (App Router)
- **Database**: PostgreSQL (via `@payloadcms/db-postgres`)
- **Styling**: TailwindCSS with shadcn/ui components
- **Rich Text**: Lexical editor
- **Analytics**: PostHog (with reverse proxy to bypass ad blockers)
- **Package Manager**: pnpm (required)

**Node Requirements:** Node ^18.20.2 || >=20.9.0, pnpm ^9 || ^10

## Essential Commands

### Development
```bash
pnpm dev                    # Start dev server on localhost:3000
pnpm build                  # Production build (creates .next directory)
pnpm start                  # Start production server
pnpm dev:prod               # Clean build + start production locally
```

### Code Quality
```bash
pnpm lint                   # Run ESLint
pnpm lint:fix               # Auto-fix linting issues
pnpm generate:types         # Generate Payload TypeScript types (creates payload-types.ts)
pnpm generate:importmap     # Generate Payload import map
```

### Testing
```bash
pnpm test                   # Run all tests (integration + E2E)
pnpm test:int               # Run integration tests (Vitest)
pnpm test:e2e               # Run E2E tests (Playwright)
```

### Database
```bash
pnpm payload migrate:create  # Create new database migration (Postgres only)
pnpm payload migrate         # Run pending migrations
```

### Other
```bash
pnpm reinstall              # Clean reinstall dependencies
```

## Architecture

### Monolithic Structure

The application is a **monolith** where Payload CMS and the Next.js frontend coexist:
- **Admin Panel**: `/admin` → Payload admin UI
- **Frontend**: Everything else → Public website
- **GraphQL Playground**: `/api/graphql-playground`
- **API Routes**: `/api/*` → Custom API endpoints (e.g., `/api/analytics/*`)

### Directory Structure

```
src/
├── payload.config.ts              # Payload CMS configuration (collections, plugins, localization)
├── middleware.ts                  # Next.js middleware (locale detection & routing)
├── i18n/config.ts                 # Locale configuration (en, es, fr, de)
│
├── collections/                   # Payload collections (data models)
│   ├── Pages/                     # Page collection with layout builder
│   ├── Posts/                     # Blog posts with Lexical editor
│   ├── Media/                     # File uploads
│   ├── Categories/                # Nested category taxonomy
│   └── Users/                     # Auth-enabled users
│
├── blocks/                        # Reusable layout building blocks
│   ├── Content/                   # Rich text content block
│   ├── CallToAction/              # CTA block
│   ├── MediaBlock/                # Image/video block
│   ├── ArchiveBlock/              # Post archive block
│   ├── Form/                      # Form builder block
│   ├── Banner/                    # Inline banner (for Posts)
│   └── Code/                      # Code snippet block (for Posts)
│
├── heros/                         # Hero section variants
│   ├── HighImpact/
│   ├── MediumImpact/
│   ├── LowImpact/
│   └── PostHero/
│
├── app/                           # Next.js App Router
│   ├── (frontend)/                # Public website routes
│   │   ├── [locale]/              # Locale-prefixed routes (e.g., /en, /es)
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── [slug]/page.tsx    # Dynamic pages
│   │   │   ├── posts/[slug]/page.tsx  # Blog post detail
│   │   │   └── search/page.tsx    # Search page
│   │   └── next/                  # Preview/seed routes
│   ├── (payload)/admin/           # Payload admin panel routes
│   └── api/                       # Custom API routes
│       └── analytics/             # PostHog analytics endpoints
│
├── components/                    # Shared React components
│   ├── LanguageSwitcher/          # Locale switcher dropdown
│   ├── Link/                      # Locale-aware Link component
│   ├── PostHogView/               # Analytics dashboard
│   ├── RichText/                  # Lexical renderer
│   └── ...
│
├── providers/                     # React Context providers
│   ├── Theme/                     # Dark mode
│   └── HeaderTheme/               # Header theming
│
├── access/                        # Payload access control policies
├── hooks/                         # Payload hooks (revalidation, etc.)
├── utilities/                     # Shared utilities
├── plugins/                       # Payload plugin configuration
├── endpoints/                     # Payload REST endpoints
└── migrations/                    # Database migrations
```

### Payload Collections

**Content Collections:**
- `pages`: Layout builder pages with hero sections + blocks (CTA, Content, Media, Archive, Form)
- `posts`: Blog posts with Lexical rich text editor (supports inline Banner, Code, MediaBlock)
- `media`: File uploads with image resizing & focal point
- `categories`: Nested category taxonomy (using nested-docs plugin)

**Auth Collection:**
- `users`: Admin users with access to CMS panel

**Localized Fields:**
- `title` (Pages, Posts)
- `content` (Posts - Lexical rich text)
- `richText` fields in blocks (Content, CallToAction)
- `hero.richText` (Pages)

**Non-localized Fields:**
- `slug`, `publishedAt`, `categories`, block structure, media

### Internationalization (i18n)

**Supported Locales:** `en` (default), `es`, `fr`, `de`

**Key Concepts:**
1. **Locale detection**: Middleware checks cookies → Accept-Language header → defaults to `en`
2. **URL structure**: All routes are prefixed with locale: `/en/about`, `/es/about`
3. **Block structure sharing**: Adding/removing blocks in one locale affects all locales
4. **Content localization**: Text fields are localized per language
5. **Auto-translation hook**: Optional hook at `collections/Pages/hooks/autoTranslate.ts` (commented out by default)

**Important Files:**
- `src/i18n/config.ts` - Locale configuration
- `src/middleware.ts` - Locale detection and routing
- `src/components/LanguageSwitcher/` - UI for switching languages
- `src/components/Link/index.tsx` - Locale-aware link component
- `INTERNATIONALIZATION.md` - Detailed i18n documentation

### Data Flow Patterns

**Draft Preview & Live Preview:**
- Collections use Payload's draft system (`versions.drafts: true`)
- Preview paths generated via `generatePreviewPath()` utility
- Preview URLs include locale: `/{locale}/posts/{slug}?preview=...`
- Live preview breakpoints configured: mobile (375px), tablet (768px), desktop (1440px)

**On-Demand Revalidation:**
- `afterChange` hooks trigger Next.js revalidation when content is published
- See `collections/Pages/hooks/revalidatePage.ts` and `collections/Posts/hooks/revalidatePost.ts`
- Redirects are revalidated via `hooks/revalidateRedirects.ts`

**Access Control:**
- Authenticated users can access unpublished content
- Public can only see `_status: 'published'` content
- See `access/authenticated.ts` and `access/authenticatedOrPublished.ts`

### Plugins

Configured in `src/plugins/index.ts`:
- **SEO Plugin**: Meta tags, OpenGraph, Twitter cards
- **Redirects Plugin**: Manage redirects from admin panel
- **Search Plugin**: Index `posts` collection for full-text search
- **Form Builder Plugin**: Embeddable forms via blocks
- **Nested Docs Plugin**: Hierarchical category structure
- **Payload Cloud Plugin**: Deployment optimization

### PostHog Analytics

- **Reverse proxy** configured in `next.config.js` to bypass ad blockers
  - `/ingest/*` → `https://us.i.posthog.com/*`
  - `/ingest/static/*` → `https://us-assets.i.posthog.com/static/*`
- **Client-side**: `posthog-js` for frontend tracking
- **Server-side**: `posthog-node` for backend events
- **Custom dashboard**: `/admin` → Analytics view (`components/PostHogView`)

### TypeScript Paths

Configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@payload-config` → `./src/payload.config.ts`

### Environment Variables

Required vars (see `.env.example`):
- `DATABASE_URI` - Postgres connection string
- `PAYLOAD_SECRET` - JWT encryption secret
- `NEXT_PUBLIC_SERVER_URL` - Public URL (no trailing slash)
- `CRON_SECRET` - Validate cron jobs
- `PREVIEW_SECRET` - Validate draft preview requests

## Development Workflow

### Making Schema Changes

1. **Modify collection config** in `src/collections/*`
2. **Run `pnpm generate:types`** to update `payload-types.ts`
3. **For Postgres:** Run `pnpm payload migrate:create` then commit migration files
4. **Rebuild:** Run `pnpm build` to catch type errors

### Adding a New Locale

1. Edit `src/i18n/config.ts` - add to `locales` array
2. Edit `src/payload.config.ts` - add to `localization.locales`
3. Update `src/middleware.ts` if needed (handles detection)
4. Add translation to `localeNames` and `localeFlags` in `i18n/config.ts`

### Adding a New Block

1. Create block config in `src/blocks/YourBlock/config.ts`
2. Add to `Pages` or `Posts` collection's `blocks` array
3. Create frontend component in `src/blocks/YourBlock/Component.tsx`
4. Add to `RenderBlocks.tsx` switch statement
5. Mark text fields as `localized: true` if they should be translated

### Working with Migrations (Postgres)

- Development: `push: true` in Postgres adapter config (auto-applies schema changes)
- Production: `push: false`, create migrations with `migrate:create`, run with `payload migrate`
- **IMPORTANT:** Migrations can cause data loss - review generated SQL before deploying

## Common Gotchas

1. **Localized vs Non-localized**:
   - Block arrays (`layout`) should NOT be localized
   - Only text fields within blocks should be `localized: true`

2. **Type Generation**:
   - Always run `pnpm generate:types` after changing collection schemas
   - The generated `payload-types.ts` is committed to the repo

3. **Revalidation**:
   - Changes only propagate to frontend after publishing (not drafts)
   - Images require republishing the containing document to bust Next.js image cache

4. **Preview Paths**:
   - Homepage slug is empty string (`''`), not `'home'`
   - Preview URLs include locale prefix automatically

5. **Payload vs Next.js Routes**:
   - Payload admin lives at `/admin`
   - All other routes are Next.js frontend routes in `app/(frontend)`

6. **Import Maps**:
   - Payload 3.x uses import maps for admin components
   - Run `pnpm generate:importmap` if you add custom admin components

## Testing Notes

- **Integration tests** use Vitest and are located in files matching `*.test.ts`
- **E2E tests** use Playwright and are in `*.spec.ts` files
- **Test DB**: Use separate database for tests to avoid data loss
- `NODE_OPTIONS=--no-deprecation` is set globally to suppress warnings

## Deployment

- **Build command**: `pnpm build` (also generates sitemap via `postbuild`)
- **Start command**: `pnpm start`
- **Database migrations**: Run `pnpm payload migrate` before starting in production
- **Cron jobs**: Scheduled publish requires cron setup (see `jobs` config in `payload.config.ts`)
- **Vercel**: May be limited to daily cron on lower tiers


## Rules to follow when writing code
- Code should be self documenting, without any need for comments. Do not give explanations in comments of what the following line is doing. 
E.g.
 // fetch data
 const fetchedData = fetch('/api')