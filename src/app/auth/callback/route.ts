import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    // แลก Code เป็น Session เพื่อล็อกอินจริง
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ล็อกอินเสร็จ ให้เด้งไปหน้า Dashboard (หรือหน้าอื่นตามต้องการ)
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}