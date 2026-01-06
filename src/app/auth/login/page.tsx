'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import '../login/Login.css';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ตอนนี้เรียกใช้ supabase ได้แล้ว
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      router.push('/dashboard');
      router.refresh();

    } catch (error: any) {
      alert(`❌ เข้าสู่ระบบไม่ผ่าน: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับ Social Login
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // ใช้ window.location.origin เพื่อให้รองรับทั้ง localhost และเว็บจริง
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

    } catch (error: any) {
      alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
      setLoading(false);
    }
  };

  // ...
  return (
    <>
      <div className="login-container">

        {/* ส่วนซ้าย: Banner */}
        <div className="banner-side">
          <div className="decorative-circle-1"></div>
          <div className="decorative-circle-2"></div>

          <div className="banner-content">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <span className="logo-text">RUTS</span>
              </div>
            </div>

            <h1 className="uni-name">
              มหาวิทยาลัยเทคโนโลยี<br />ราชมงคลศรีวิชัย
            </h1>
            <div className="divider-line"></div>
            <p className="sys-name">ระบบจองห้องเรียนออนไลน์</p>

            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <p className="feature-text">จองห้องง่าย</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <p className="feature-text">รวดเร็ว</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <p className="feature-text">ปลอดภัย</p>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนขวา: Form */}
        <div className="form-side">
          <div className="form-wrapper">

            {/* Mobile Logo */}
            <div className="mobile-logo">
              <div className="mobile-logo-circle">
                <span className="mobile-logo-text">RUTS</span>
              </div>
              <h2 className="mobile-uni-name">มทร.ศรีวิชัย</h2>
            </div>

            {/* Form Header */}
            <div className="form-header">
              <h1 className="welcome-text">ยินดีต้อนรับกลับ!</h1>
              <p className="sub-text">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
            </div>

            {/* Login Form */}
            <div className="login-form">
              <div className="form-group">
                <label className="form-label">อีเมลนักศึกษา / อาจารย์</label>
                <input
                  type="email"
                  placeholder="name@rmutsv.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <div className="password-label-group">
                  <label className="form-label">รหัสผ่าน</label>
                  <Link href="/auth/forgot-password" className="forgot-link">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <button
                onClick={handleLogin}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <> เข้าสู่ระบบ</>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="form-footer">
              <p className="footer-text">
                ยังไม่มีบัญชี?{' '}
                <Link href="/auth/register" className="register-link">
                  ลงทะเบียนที่นี่
                </Link>
              </p>
              <Link href="/" className="back-home">
                ← กลับหน้าหลัก
              </Link>
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line-left"></div>
              <span className="divider-text">หรือเข้าสู่ระบบด้วย</span>
              <div className="divider-line-right"></div>
            </div>

            {/* Social Login */}
            <div className="social-buttons">
              {/* ปุ่ม Google */}
              <button
                type="button"  // สำคัญ: ต้องใส่ ไม่งั้นมันจะไป Submit ฟอร์ม Login แทน
                className="social-btn"
                onClick={() => handleSocialLogin('google')} // สั่งให้ทำงานฟังก์ชันด้านบน
              >
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>

              {/* ปุ่ม Facebook */}
              <button
                type="button" // สำคัญ: ต้องใส่
                className="social-btn"
                onClick={() => handleSocialLogin('facebook')} // สั่งให้ทำงานฟังก์ชันด้านบน
              >
                <svg className="social-icon" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}