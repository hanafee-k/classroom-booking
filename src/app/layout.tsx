import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/common/Navbar' // Import เข้ามา

export const metadata: Metadata = {
  title: 'ระบบจองห้องเรียน',
  description: 'RMUTSV Classroom Booking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>
        <Navbar /> {/* แปะ Navbar ไว้ส่วนบนสุด */}
        <main style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
          {children} {/* เนื้อหาของแต่ละหน้าจะมาโผล่ตรงนี้ */}
        </main>
      </body>
    </html>
  )
}