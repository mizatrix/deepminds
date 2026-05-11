import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';

const protectedRoutes = ['/profile', '/admin'];
const authRoutes = ['/sign-in'];
const legacyAuthRoutes = ['/login', '/register'];

export default auth((req) => {
    const { pathname, search } = req.nextUrl;
    const session = req.auth;
    const isAuthenticated = !!session?.user;
    const userRole = (session?.user as any)?.role;

    // Legacy /login and /register → /sign-in (preserve query string)
    if (legacyAuthRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        const target = new URL(`/sign-in${search}`, req.url);
        return NextResponse.redirect(target);
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    if (isAuthRoute && isAuthenticated) {
        const dashboardUrl = userRole === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }

    if (pathname.startsWith('/admin')) {
        if (!isAuthenticated) {
            const signInUrl = new URL('/sign-in', req.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/student/dashboard', req.url));
        }
    }

    if (pathname.startsWith('/student')) {
        if (!isAuthenticated) {
            const signInUrl = new URL('/sign-in', req.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/profile/:path*',
        '/admin/:path*',
        '/student/:path*',
        '/sign-in',
        '/login',
        '/register',
    ],
};
