import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/profile', '/my-tours', '/admin'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('accessToken')?.value;

    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    if (isProtectedPath && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

    if (isAuthPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/profile/:path*',
        '/my-tours/:path*',
        '/admin/:path*',
        '/login',
        '/register',
    ],
};
