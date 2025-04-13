// middleware.ts
import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// This example protects all routes including api/trpc routes
export default withClerkMiddleware((req) => {
    const publicPaths = [
        '/',
        '/jobs',
        '/jobs/(.*)',
        '/auth/login',
        '/auth/register',
        '/api/webhook/clerk',
        '/api/webhook/supabase',
    ];

    const isPublic = publicPaths.find(path =>
        req.nextUrl.pathname === path ||
        req.nextUrl.pathname.match(new RegExp(`^${path}$`))
    );

    if (isPublic) {
        return NextResponse.next();
    }

    // If the user is not signed in and trying to access a private route,
    // redirect them to the sign in page
    const { userId } = req.auth;

    if (!userId) {
        const signInUrl = new URL('/auth/login', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};