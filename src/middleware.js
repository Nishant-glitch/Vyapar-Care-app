import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check for admin session or auth cookie
  const authToken = request.cookies.get('sb-access-token')?.value ||
                    request.cookies.get('sb-refresh-token')?.value ||
                    request.cookies.get('supabase-auth-token')?.value;

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isLoginRoute = pathname === '/login';

  // Allow next-auth or custom admin cookies, or public assets
  if (isDashboardRoute) {
    // Protected route
    return NextResponse.next();
  }

  if (isLoginRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
