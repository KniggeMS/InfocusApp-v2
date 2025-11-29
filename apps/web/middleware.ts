import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './src/lib/i18n/locale';

const protectedRoutes = ['/watchlist', '/search', '/family', '/settings'];
const authRoutes = ['/login', '/register'];
const publicRoutes = ['/', '/login', '/register'];

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed'
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip locale middleware for API routes, static files, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Apply internationalization middleware first
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    return intlResponse;
  }

  // Extract locale from pathname
  const pathnameLocale = SUPPORTED_LOCALES.find(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Remove locale from pathname for route checking
  const pathnameWithoutLocale = pathnameLocale 
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathnameWithoutLocale === route);
  const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale);

  // Check for refresh token cookie (HTTP-only)
  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;

  // If trying to access protected route without refresh cookie, redirect to login
  // In development, we may not have the cookie set properly, so be more permissive
  const isDev = process.env.NODE_ENV === 'development';
  if (isProtectedRoute && !refreshTokenCookie && !isDev) {
    // Get the current locale for the redirect
    const locale = pathnameLocale || request.cookies.get('locale')?.value || DEFAULT_LOCALE;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // If accessing root without locale, redirect to preferred locale
  if (pathname === '/') {
    const preferredLocale = request.cookies.get('locale')?.value || 
      request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 
      DEFAULT_LOCALE;
    
    const finalLocale = SUPPORTED_LOCALES.includes(preferredLocale as any) 
      ? preferredLocale 
      : DEFAULT_LOCALE;
    
    return NextResponse.redirect(new URL(`/${finalLocale}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
