'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import './Navbar.css';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>(''); // เก็บชื่อที่จะโชว์
  const [isOpen, setIsOpen] = useState(false); // สำหรับเมนูมือถือ

  useEffect(() => {
    const getUser = async () => {
      // 1. เช็คว่าล็อกอินอยู่ไหม
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // 2. ถ้าล็อกอิน ให้ไปดึง "ชื่อจริง" จากตาราง profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        // ถ้ามีชื่อใน profiles ให้ใช้ชื่อนั้น ถ้าไม่มีให้ใช้อีเมลหน้า @ ไปพลางๆ
        if (profile && profile.full_name) {
          setUserName(profile.full_name);
        } else {
          setUserName(session.user.email?.split('@')[0] || 'User');
        }
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* โลโก้เว็บไซต์ */}
        <Link href="/" className="nav-logo">
          🏫 RMUTSV Booking
        </Link>

        {/* ปุ่ม Hamburger (มือถือ) */}
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </div>

        {/* เมนูรายการ */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link href="/" className="nav-link">หน้าแรก</Link>
          </li>
          <li className="nav-item">
            <Link href="/dashboard" className="nav-link">จองห้องเรียน</Link>
          </li>
          <li className="nav-item">
            <Link href="/history" className="nav-link">ประวัติการจอง</Link>
          </li>

          {/* ส่วนแสดงสถานะล็อกอิน */}
          {user ? (
            <li className="nav-item user-section">
              <span className="user-name">👤 {userName}</span>
              <button onClick={handleLogout} className="btn-logout-nav">
                ออกจากระบบ
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <Link href="/auth/login" className="btn-login-nav">
                เข้าสู่ระบบ
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}