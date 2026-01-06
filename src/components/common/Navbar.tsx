'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // 1. แก้ Import ให้ตรงกับไฟล์อื่น
import './Navbar.css';

export default function Navbar() {
  const supabase = createClient(); // 2. ประกาศตัวแปร supabase
  
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>(''); // เก็บ Role (student/admin)
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // ดึงทั้งชื่อ และ Role มาด้วย
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role') 
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || session.user.email?.split('@')[0] || 'User');
          setUserRole(profile.role); // เก็บ Role ไว้ใช้เช็ค
        }
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('');
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">🏫 RMUTSV Booking</Link>

        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>☰</div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item"><Link href="/" className="nav-link">หน้าแรก</Link></li>
          <li className="nav-item"><Link href="/dashboard" className="nav-link">จองห้องเรียน</Link></li>
          <li className="nav-item"><Link href="/history" className="nav-link">ประวัติการจอง</Link></li>

          {/* 👇 เมนู Admin: โชว์เฉพาะคนที่เป็น admin เท่านั้น 👇 */}
          {userRole === 'admin' && (
            <li className="nav-item">
              <Link href="/admin/dashboard" className="nav-link admin-link">
                🛠️ ผู้ดูแลระบบ
              </Link>
            </li>
          )}

          {user ? (
            <li className="nav-item user-section">
              <span className="user-name">👤 {userName}</span>
              <button onClick={handleLogout} className="btn-logout-nav">ออกจากระบบ</button>
            </li>
          ) : (
            <li className="nav-item">
              <Link href="/auth/login" className="btn-login-nav">เข้าสู่ระบบ</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}