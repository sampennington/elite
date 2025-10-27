import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, isValidLocale, type Locale } from './i18n/config'

function getLocaleFromRequest(request: NextRequest): Locale {
  // Check if there's a locale cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && isValidLocale(localeCookie)) {
    return localeCookie
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
    const languages = acceptLanguage.split(',').map((lang) => {
      const [code, priority] = lang.split(';q=')
      return {
        code: code.trim().split('-')[0],
        priority: priority ? parseFloat(priority) : 1.0,
      }
    })

    // Sort by priority and find first matching locale
    languages.sort((a, b) => b.priority - a.priority)
    for (const lang of languages) {
      if (isValidLocale(lang.code)) {
        return lang.code
      }
    }
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files, and admin routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/next/') ||
    pathname.startsWith('/ingest/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  // If pathname has a valid locale, continue
  if (potentialLocale && isValidLocale(potentialLocale)) {
    const response = NextResponse.next()
    // Set cookie to remember user's locale preference
    response.cookies.set('NEXT_LOCALE', potentialLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
    return response
  }

  // Detect user's preferred locale
  const detectedLocale = getLocaleFromRequest(request)

  // Redirect to locale-prefixed URL (all locales get a prefix now)
  const url = request.nextUrl.clone()
  url.pathname = `/${detectedLocale}${pathname}`

  const response = NextResponse.redirect(url)
  response.cookies.set('NEXT_LOCALE', detectedLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api|admin).*)',
  ],
}
