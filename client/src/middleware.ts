import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const protectedPaths = ['/dashboard', '/profile', '/my-products', '/admin'];
const authPaths = ['/login', '/register'];

function isTokenValid(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
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

    // If the locale is not valid (e.g. public files), likely handled by next-intl or is a public asset
    // But next-intl middleware handles redirecting / to /ka, so we usually have a locale here if it matched.
    // However, if we are at /login, next-intl might redirect to /ka/login.

    // Let's normalize the path to check against protected paths
    // Remove the locale part if it exists in our routing locales
    let pathWithoutLocale = pathname;
    if (routing.locales.includes(locale as any)) {
        pathWithoutLocale = '/' + segments.slice(2).join('/');
    }

    // Handle root path or paths that need i18n redirection first
    // If response is a redirect (307/308) from next-intl, return it immediately
    if (response.headers.get('location')) {
        return response;
    }

    const token = request.cookies.get('accessToken')?.value;
    const hasValidToken = !!token && isTokenValid(token);

    const isProtectedPath = protectedPaths.some((path) =>
        pathWithoutLocale.startsWith(path)
    );

    if (isProtectedPath && !hasValidToken) {
        // Redirect to login with current locale
        // If we don't have a locale yet (unlikely if next-intl didn't redirect), use default
        const currentLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;

        const loginUrl = new URL(`/${currentLocale}/login`, request.url);
        loginUrl.searchParams.set('from', pathWithoutLocale);

        const redirectResponse = NextResponse.redirect(loginUrl);
        if (token) {
            redirectResponse.cookies.delete('accessToken');
        }
        return redirectResponse;
    }

    const isAuthPath = authPaths.some((path) => pathWithoutLocale.startsWith(path));
    if (isAuthPath && hasValidToken) {
        const currentLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;
        return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url));
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
