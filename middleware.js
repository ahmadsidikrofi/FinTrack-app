import { NextResponse } from 'next/server'

export function middleware(request) {
  // Dapatkan path dari request
  const path = request.nextUrl.pathname
  
  // Daftar rute yang tidak perlu autentikasi
  const publicRoutes = ['/auth']
  
  // Periksa apakah rute saat ini adalah rute publik
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
  
  // Periksa token dari cookies
  const token = request.cookies.get('user_token')?.value
  
  // Jika user sudah login dan mencoba mengakses halaman auth, redirect ke dashboard
  if (isPublicRoute && token) {
    const dashboardUrl = new URL('/', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Jika rute publik dan tidak ada token, izinkan akses
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Jika tidak ada token dan bukan rute publik, redirect ke auth
  if (!token) {
    const authUrl = new URL('/auth', request.url)
    return NextResponse.redirect(authUrl)
  }
  
  // Jika ada token, izinkan akses
  return NextResponse.next()
}

// Konfigurasi path mana saja yang akan diproses middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 