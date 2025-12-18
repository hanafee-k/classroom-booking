'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // สำหรับเปลี่ยนหน้า
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import '../auth.css'; // เราจะใช้ CSS ร่วมกับหน้า Login

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ฟังก์ชันจัดการการพิมพ์ในช่องต่างๆ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันเมื่อกดปุ่มสมัครสมาชิก
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. ตรวจสอบความถูกต้องเบื้องต้น
    if (formData.password !== formData.confirmPassword) {
      alert('❌ รหัสผ่านไม่ตรงกันครับ');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      alert('❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ');
      setLoading(false);
      return;
    }

    try {
      // 2. ส่งข้อมูลไปสมัครกับ Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 3. ถ้าสมัครผ่าน ให้บันทึกชื่อเต็มลงตาราง profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, // ใช้ ID เดียวกับ Auth
              full_name: formData.fullName 
            }
          ]);
        
        if (profileError) {
            // ถ้าบันทึกโปรไฟล์ไม่ผ่าน อาจจะแจ้งเตือน (แต่ user ถูกสร้างแล้วใน auth)
            console.error('Profile creation failed:', profileError);
        }
      }

      alert('✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      router.push('/auth/login'); // เด้งไปหน้า Login

    } catch (error: any) {
      alert(`❌ สมัครไม่ผ่าน: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="auth-container">
        <div className="auth-card">
          <h1>🚀 สมัครสมาชิกใหม่</h1>
          <p>สร้างบัญชีเพื่อเริ่มใช้งานระบบจองห้องเรียน</p>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                name="fullName" 
                placeholder="สมชาย ใจดี"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>อีเมล</label>
              <input 
                type="email" 
                name="email" 
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>รหัสผ่าน (6 ตัวขึ้นไป)</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>ยืนยันรหัสผ่าน</label>
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? '⏳ กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="auth-footer">
            มีบัญชีอยู่แล้ว? <Link href="/auth/login">เข้าสู่ระบบที่นี่</Link>
          </div>
        </div>
      </div>
    </main>
  );
}