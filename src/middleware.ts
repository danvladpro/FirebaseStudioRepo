import { NextRequest, NextResponse } from 'next/server';

// Pages that do NOT require authentication
const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify', '/certificate', '/auth-action', '/verify-email', '/checkout', '/opengraph-image'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths through unconditionally
    if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        return NextResponse.next();
    }

    // Allow Next.js internals, static files, and API routes through
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const authCookie = req.cookies.get('auth-present');

    if (!authCookie?.value) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
