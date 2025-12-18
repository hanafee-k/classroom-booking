import Link from 'next/link';
import './Navbar.css'; // เดี๋ยวเราสร้างไฟล์นี้ต่อ

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="logo">
          📚 จองห้องเรียน
        </Link>
        <div className="menu">
          <Link href="/" className="menu-item">หน้าแรก</Link>
          <Link href="/dashboard" className="menu-item">Dashboard</Link>
          <Link href="/history" className="nav-link">ประวัติการจอง</Link>
          <Link href="/auth/login" className="btn-login">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </nav>
  );
}