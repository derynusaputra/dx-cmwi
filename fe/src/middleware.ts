import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const refreshToken = req.cookies.get('refresh_token')?.value;
  const activeRole = req.cookies.get('active_role')?.value; // diset di /login
  const intendedRole = req.cookies.get('intended_role')?.value; // diset di /signin

  const isAuthPage = pathname.startsWith('/signin');
  const isAppPage = pathname.startsWith('/app');
  
  const isPublicFile = pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/favicon.ico');

  // Skip middleware untuk backend proxy route handlers
  const isApiRoute = 
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/user/') ||
    pathname.startsWith('/painting-inspections') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/files');

  // Skip middleware untuk assets statik dan API route handlers
  if (isPublicFile || isApiRoute) return NextResponse.next();

  // Redirect ke /signin jika user sama sekali belum login dan belum masuk ke page auth
  if (!refreshToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  // Jika sudah login, redirect /signin ke rute tujuannya masing-masing
  if (refreshToken && isAuthPage) {
     if (activeRole === 'operator') {
        return NextResponse.redirect(new URL('/app/dashboard', req.url));
     } else {
        return NextResponse.redirect(new URL('/', req.url));
     }
  }

  // Proteksi Rute: Jika ia mengakses /app (Operator Route) tapi dia bukan operator 
  // Atau sebaliknya (admin route protection khusus di luar /app dan /xyz)
  if (refreshToken) {
     if (isAppPage && activeRole !== 'operator') {
       return NextResponse.redirect(new URL('/', req.url)); // Admin kembali ke Home admin
     }
     
     if (!isAppPage && activeRole === 'operator') {
       return NextResponse.redirect(new URL('/app/dashboard', req.url)); // Operator paksa main di /app
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Match semuanya kecuali static dan API
};
