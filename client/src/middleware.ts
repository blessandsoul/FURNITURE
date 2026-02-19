import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

type AppLocale = typeof routing.locales[number];

const protectedPaths = [
    '/profile',
    '/my-products',
    '/admin',
    '/configurator',
    '/my-designs',
    '/credits',
    '/my-quotes',
];
const authPaths = ['/login', '/register'];

function isAppLocale(value: string | undefined): value is AppLocale {
    return routing.locales.includes(value as AppLocale);
}

function isTokenValid(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: unknown };
        return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function middleware(request: NextRequest): NextResponse {
    const handleI18nRouting = createMiddleware(routing);
    const response = handleI18nRouting(request);

    const { pathname } = request.nextUrl;

    // Extract locale from pathname (e.g., /en/dashboard -> en)
    const segments = pathname.split('/');
    const locale = segments[1];

    // Normalize the path: remove the locale prefix if present
    let pathWithoutLocale = pathname;
    if (isAppLocale(locale)) {
        pathWithoutLocale = '/' + segments.slice(2).join('/');
    }

    // If response is a redirect (307/308) from next-intl, return it immediately
    if (response.headers.get('location')) {
        return response;
    }

    const token = request.cookies.get('accessToken')?.value;
    const hasValidToken = !!token && isTokenValid(token);
    const hasRefreshToken = !!request.cookies.get('refreshToken')?.value;

    const isProtectedPath = protectedPaths.some((path) =>
        pathWithoutLocale.startsWith(path)
    );

    // Only redirect to login if BOTH the access token is invalid AND there is
    // no refresh token. When a refresh token exists, the client-side Axios
    // interceptor will transparently refresh the access token on the first 401.
    if (isProtectedPath && !hasValidToken && !hasRefreshToken) {
        const currentLocale = isAppLocale(locale) ? locale : routing.defaultLocale;

        const loginUrl = new URL(`/${currentLocale}/login`, request.url);
        loginUrl.searchParams.set('from', pathWithoutLocale);

        return NextResponse.redirect(loginUrl);
    }

    const isAuthPath = authPaths.some((path) => pathWithoutLocale.startsWith(path));
    if (isAuthPath && hasValidToken) {
        const currentLocale = isAppLocale(locale) ? locale : routing.defaultLocale;
        return NextResponse.redirect(new URL(`/${currentLocale}/my-designs`, request.url));
    }

    return response;
}

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',

        // Set a cookie to remember the previous locale for
        // all requests that have a locale prefix
        '/(ka|en|ru)/:path*',

        // Enable redirects that add missing locales
        // (e.g. `/pathnames` -> `/en/pathnames`)
        '/((?!_next|_vercel|.*\\..*).*)'
    ]
};
