'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // เพิ่มตัวช่วยเปลี่ยนหน้า
import Link from 'next/link';
import { supabase } from '@/utils/supabase'; // เรียกใช้ Supabase
import '../auth.css'; // ใช้ CSS ตัวเดียวกับหน้า Register (จะได้สวยเหมือนกัน)

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // สถานะกำลังโหลด

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. ส่งข้อมูลไปเช็คกับ Supabase
      // ใส่ .trim() ที่อีเมลด้วย กันเหนียวเรื่องเว้นวรรค
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      // 2. ถ้าล็อกอินผ่าน
      // alert('✅ เข้าสู่ระบบสำเร็จ!'); // (ปิดไว้ก็ได้ ถ้าอยากให้เด้งไปเลย)
      
      // 3. ย้ายไปหน้า Dashboard และรีเฟรชระบบ 1 ทีเพื่อให้ Navbar รู้ว่าล็อกอินแล้ว
      router.push('/dashboard');
      router.refresh(); 

    } catch (error: any) {
      alert(`❌ เข้าสู่ระบบไม่ผ่าน: ${error.message}`);
      // ทริค: ถ้า Error ขึ้นว่า "Invalid login credentials" แปลว่า รหัสผิด หรือ อีเมลผิด
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* ใช้คลาส auth-container จาก auth.css เพื่อความสวยงามเหมือนหน้าสมัคร */}
      <div className="auth-container">
        <div className="auth-card">
          <h1>ยินดีต้อนรับ</h1>
          <p className="subtitle">เข้าสู่ระบบจองห้องเรียน</p>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>อีเมล</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="auth-footer">
            <p>ยังไม่มีบัญชี? <Link href="/auth/register">ลงทะเบียนที่นี่</Link></p>
            <div style={{ marginTop: '10px' }}>
              <Link href="/" className="back-link">← กลับหน้าหลัก</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}