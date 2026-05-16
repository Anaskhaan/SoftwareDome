import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // If not logged in, redirect to home page as requested
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      
      // Only ADMIN is allowed to access the dashboard
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/', request.url));
      // Optionally clear the invalid cookie
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*'],
};
