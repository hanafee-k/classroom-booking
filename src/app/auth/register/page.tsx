'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ✅ นำเข้า createClient
import { createClient } from '@/utils/supabase/client';
// ✅ นำเข้า CSS (ใช้ตัวเดียวกับหน้า Login หรือ Register ก็ได้)
import '../login/Login.css'; 

export default function RegisterPage() {
  const router = useRouter();
  // ✅ สร้างตัวแปร supabase (สำคัญมาก! ต้องมีบรรทัดนี้)
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('❌ รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (!acceptTerms) {
      alert('❌ กรุณายอมรับเงื่อนไขการใช้งาน');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName,
            student_id: studentId,
          }
        }
      });

      if (error) throw error;

      alert('✅ ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี');
      router.push('/auth/login');

    } catch (error: any) {
      alert(`❌ ลงทะเบียนไม่สำเร็จ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .register-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Sarabun', sans-serif;
          background-color: #F9FAFB;
        }

        /* ===== ส่วนซ้าย: Banner ===== */
        .banner-side {
          width: 50%;
          position: relative;
          background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23FACC15' fill-opacity='0.1' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: bottom;
          background-size: cover;
        }

        .banner-side::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .banner-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 2rem;
          color: white;
        }

        .logo-wrapper {
          animation: float 6s ease-in-out infinite;
          margin-bottom: 2rem;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .logo-circle {
          width: 128px;
          height: 128px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 0 30px rgba(250, 204, 21, 0.3);
        }

        .logo-text {
          font-size: 3rem;
          font-weight: bold;
          color: #071f58;
        }

        .uni-name {
          font-size: 3rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          color: #1a1b1d;
        }

        .divider-line {
          width: 96px;
          height: 4px;
          background: #FACC15;
          margin: 1.5rem auto;
          border-radius: 2px;
        }

        .sys-name {
          font-size: 1.5rem;
          color: #1a0fdf;
          font-weight: 300;
        }

        .feature-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          max-width: 42rem;
          margin: 3rem auto 0;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .feature-text {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .decorative-circle-1 {
          position: absolute;
          top: 2.5rem;
          left: 2.5rem;
          width: 5rem;
          height: 5rem;
          background: #FACC15;
          border-radius: 50%;
          opacity: 0.2;
          filter: blur(2rem);
        }

        .decorative-circle-2 {
          position: absolute;
          bottom: 5rem;
          right: 5rem;
          width: 8rem;
          height: 8rem;
          background: #FACC15;
          border-radius: 50%;
          opacity: 0.2;
          filter: blur(3rem);
        }

        /* ===== ส่วนขวา: Form ===== */
        .form-side {
          width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: white;
          overflow-y: auto;
        }

        .form-wrapper {
          width: 100%;
          max-width: 28rem;
        }

        .mobile-logo {
          display: none;
          text-align: center;
          margin-bottom: 2rem;
        }

        .mobile-logo-circle {
          width: 5rem;
          height: 5rem;
          background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .mobile-logo-text {
          font-size: 2rem;
          font-weight: bold;
          color: white;
        }

        .mobile-uni-name {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1E3A8A;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .welcome-text {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .sub-text {
          color: #6B7280;
          font-size: 0.95rem;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #D1D5DB;
          border-radius: 0.75rem;
          font-size: 1rem;
          background: white;
          transition: all 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: #FACC15;
          box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.15);
        }

        .terms-group {
          display: flex;
          align-items: start;
          gap: 0.5rem;
        }

        .terms-checkbox {
          margin-top: 0.25rem;
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .terms-label {
          font-size: 0.875rem;
          color: #6B7280;
          line-height: 1.5;
        }

        .terms-link {
          color: #1E3A8A;
          text-decoration: none;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        .btn-primary {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #FACC15 0%, #EAB308 100%);
          color: #1E3A8A;
          font-weight: bold;
          font-size: 1.125rem;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(250, 204, 21, 0.3);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
          width: 1.25rem;
          height: 1.25rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .form-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .footer-text {
          font-size: 0.875rem;
          color: #6B7280;
          margin-bottom: 0.75rem;
        }

        .login-link {
          color: #1E3A8A;
          font-weight: 600;
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        .back-home {
          display: block;
          font-size: 0.875rem;
          color: #9CA3AF;
          text-decoration: none;
          margin-top: 0.75rem;
        }

        .back-home:hover {
          color: #6B7280;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 2rem 0 1.5rem;
        }

        .divider-line-left,
        .divider-line-right {
          flex: 1;
          height: 1px;
          background: #E5E7EB;
        }

        .divider-text {
          padding: 0 1rem;
          font-size: 0.75rem;
          color: #9CA3AF;
        }

        .social-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1rem;
          border: 2px solid #E5E7EB;
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .social-btn:hover {
          border-color: #1E3A8A;
          background: #F9FAFB;
        }

        .social-icon {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
        }

        /* ===== Responsive ===== */
        @media (max-width: 1024px) {
          .banner-side {
            display: none;
          }

          .form-side {
            width: 100%;
          }

          .mobile-logo {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .form-side {
            padding: 2rem 1.5rem;
          }

          .welcome-text {
            font-size: 1.75rem;
          }

          .social-buttons {
            grid-template-columns: 1fr;
          }
        }

        /* Tablet & iPad (จอเล็กกว่า 1024px) */
@media (max-width: 1024px) {
  .banner-side {
    display: none; /* ซ่อนแบนเนอร์ */
  }

  .form-side {
    width: 100%;
    /* จัดให้เริ่มจากข้างบน เพื่อไม่ให้คีย์บอร์ดบังตอนพิมพ์ */
    align-items: flex-start; 
    padding-top: 4rem;
  }
  
  .form-wrapper {
      max-width: 400px;
      margin: 0 auto; /* จัดกึ่งกลางแนวนอน */
  }

  .mobile-logo {
    display: block;
  }
}

/* Mobile Standard (จอเล็กกว่า 640px) */
@media (max-width: 640px) {
  .form-side {
    padding: 2rem 1.5rem;
    padding-bottom: calc(2rem + env(safe-area-inset-bottom));
  }

  .welcome-text {
    font-size: 1.75rem;
    text-align: center;
  }
  
  .sub-text {
      text-align: center;
  }
  
  .form-header {
      text-align: center;
  }

  /* ให้ปุ่ม Social เรียงแนวตั้งในมือถือ เพื่อให้กดยง่ายขึ้น */
  .social-buttons {
    grid-template-columns: 1fr; 
  }
}

/* iPhone SE / Mini / Android จอเล็ก (จอเล็กกว่า 380px) */
@media (max-width: 380px) {
  .welcome-text {
    font-size: 1.5rem; /* ลดขนาดฟอนต์ลงอีกนิด */
  }

  .mobile-logo-circle {
    width: 4rem;
    height: 4rem;
  }

  .mobile-logo-text {
    font-size: 1.5rem;
  }

  .input-field {
    font-size: 0.9rem; /* ลดขนาดตัวหนังสือในช่องกรอก */
  }
  
  .btn-primary {
      font-size: 1rem;
  }
}
      `}</style>

      <div className="register-container">

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
              <h1 className="welcome-text">สร้างบัญชีใหม่</h1>
              <p className="sub-text">กรอกข้อมูลเพื่อเริ่มใช้งานระบบ</p>
            </div>

            {/* Register Form */}
            <div className="register-form">

              <div className="form-group">
                <label className="form-label">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  placeholder="นายสมชาย นานา"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">รหัสนักศึกษา / รหัสอาจารย์</label>
                <input
                  type="text"
                  placeholder="167xxxxxx"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">อีเมลมหาวิทยาลัย</label>
                <input
                  type="email"
                  placeholder="yourname@rmutsv.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">รหัสผ่าน</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="terms-group">
                <input
                  type="checkbox"
                  className="terms-checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <label className="terms-label">
                  ฉันยอมรับ{' '}
                  <a href="#" className="terms-link">เงื่อนไขการใช้งาน</a>
                  {' '}และ{' '}
                  <a href="#" className="terms-link">นโยบายความเป็นส่วนตัว</a>
                </label>
              </div>

              <button
                onClick={handleRegister}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>✨ สร้างบัญชี</>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="form-footer">
              <p className="footer-text">
                มีบัญชีอยู่แล้ว?{' '}
                <Link href="/auth/login" className="login-link">
                  เข้าสู่ระบบ
                </Link>
              </p>
              <Link href="/" className="back-home">
                ← กลับหน้าหลัก
              </Link>
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line-left"></div>
              <span className="divider-text">หรือลงทะเบียนด้วย</span>
              <div className="divider-line-right"></div>
            </div>

            {/* Social Login */}
            <div className="social-buttons">
              <button className="social-btn">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button className="social-btn">
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