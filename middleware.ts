import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/admin'];
const authRoutes = ['/login', '/register'];

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;
    const isAuthenticated = !!session?.user;
    const userRole = (session?.user as any)?.role;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Redirect to login if accessing protected route without authentication
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages to their appropriate dashboard
    if (isAuthRoute && isAuthenticated) {
        const dashboardUrl = userRole === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }

    // Protect admin routes - only ADMIN or SUPER_ADMIN role can access
    if (pathname.startsWith('/admin')) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            // Redirect non-admin users to student dashboard
            return NextResponse.redirect(new URL('/student/dashboard', req.url));
        }
    }

    // Protect student routes - require authentication
    if (pathname.startsWith('/student')) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match only the routes that actually require authentication or protection.
         * This avoids running middleware on every single request and fixes the deprecation warning.
         */
        '/dashboard/:path*',
        '/profile/:path*',
        '/admin/:path*',
        '/student/:path*',
        '/login',
        '/register'
    ],
};
