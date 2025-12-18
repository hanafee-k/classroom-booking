import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>สมัครสมาชิก</h1>
      <p>ระบบสมัครสมาชิกยังไม่เปิดใช้งานครับ</p>
      <Link href="/auth/login" style={{ color: 'blue', textDecoration: 'underline' }}>
        กลับไปหน้าเข้าสู่ระบบ
      </Link>
    </div>
  );
}