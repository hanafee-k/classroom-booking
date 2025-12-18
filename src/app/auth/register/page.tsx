'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import '../auth.css';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // --- ส่วนตรวจสอบ (Debug) ---
    // ตัดช่องว่างออกให้ชัวร์ๆ
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();

    // เช็คก่อนส่ง: ให้ Alert ออกมาดูเลยว่ามีช่องว่างแอบอยู่ไหม
    // ถ้าเห็นเป็น [ kalupae... ] (มีเว้นวรรคในวงเล็บ) แปลว่าช่องว่างยังอยู่
    if (!confirm(`กำลังจะสมัครด้วยอีเมล: [${cleanEmail}]\nยืนยันความถูกต้อง?`)) {
      setLoading(false);
      return;
    }

    if (cleanPassword !== formData.confirmPassword.trim()) {
      alert('❌ รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    try {
      // ส่งค่าที่ clean แล้วไปให้ Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id,
              full_name: formData.fullName 
            }
          ]);
      }

      alert('✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      router.push('/auth/login');

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
          <h1>🕵️‍♂️ สมัครสมาชิก (Debug Mode)</h1>
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>อีเมล</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ยืนยันรหัสผ่าน</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? '⏳...' : 'สมัครสมาชิก'}
            </button>
          </form>
          <div className="auth-footer">
            <Link href="/auth/login">กลับไปเข้าสู่ระบบ</Link>
          </div>
        </div>
      </div>
    </main>
  );
}