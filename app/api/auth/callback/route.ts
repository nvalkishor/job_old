// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const redirectUrl = searchParams.get('redirect_url') || '/';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
}