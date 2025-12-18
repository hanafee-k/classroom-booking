import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ฟังก์ชันนี้จะทำงานทุกครั้งที่มีการเปลี่ยนหน้า
export function middleware(request: NextRequest) {
  // ตอนนี้ให้ปล่อยผ่านไปก่อน (return next) ยังไม่ต้องเช็คอะไร
  return NextResponse.next()
}

// กำหนดว่า middleware นี้จะทำงานที่หน้าไหนบ้าง
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