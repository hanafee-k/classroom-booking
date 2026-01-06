import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // ถ้ามี URL ปลายทางที่อยากให้เด้งไป (เผื่อใช้ในอนาคต)
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ถ้าล็อกอินสำเร็จ ส่งไปหน้า Dashboard
      const forwardedHost = request.headers.get('x-forwarded-host') // เผื่อกรณี Deploy Vercel
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // ถ้าอยู่ในเครื่องตัวเอง
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // ถ้าอยู่บน Vercel (ใช้ HTTPS)
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // ถ้า Error ให้เด้งกลับไปหน้า Login พร้อมแจ้งเตือน
  return NextResponse.redirect(`${origin}/auth/error`)
}