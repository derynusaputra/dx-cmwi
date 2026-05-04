import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const refreshToken = req.cookies.get('refresh_token')?.value;
  const activeRole = req.cookies.get('active_role')?.value; // diset setelah login berhasil

  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isAppPage = pathname.startsWith('/app');
  
  const isPublicFile =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico');

  // Skip middleware untuk backend proxy route handlers
  const isApiRoute = 
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/user/') ||
    pathname.startsWith('/painting-inspections') ||
    pathname.startsWith('/qcr') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/files');

  // Skip middleware untuk assets statik dan API route handlers
  if (isPublicFile || isApiRoute) return NextResponse.next();

  // --- KASUS 1: Belum login sama sekali ---
  if (!refreshToken) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    return NextResponse.next();
  }

  // --- KASUS 2: Ada refresh_token tapi active_role belum di-set ---
  // Ini terjadi jika: cookie active_role expired tapi refresh_token masih ada,
  // atau jika user baru selesai login tapi belum memilih role.
  // Kirim ke /signin agar user pilih role lagi (safe fallback).
  if (!activeRole) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    return NextResponse.next();
  }

  // --- KASUS 3: Sudah login dan sudah punya active_role ---
  
  // Jika sudah login penuh, redirect dari halaman auth ke halaman yang sesuai
  if (isAuthPage) {
    if (activeRole === 'operator') {
      return NextResponse.redirect(new URL('/app/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Proteksi silang: Operator tidak boleh di luar /app, Admin tidak boleh di /app
  if (isAppPage && activeRole !== 'operator') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (!isAppPage && activeRole === 'operator') {
    return NextResponse.redirect(new URL('/app/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
