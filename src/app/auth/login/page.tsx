'use client'; // ต้องมีบรรทัดนี้เพราะเรามีการกดปุ่ม (Interactivity)

import React, { useState } from 'react';
import Link from 'next/link';
import './Login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('กำลังล็อกอินด้วย:', email, password);
    alert('กดปุ่มล็อกอินแล้ว! (เดี๋ยวเราค่อยเชื่อมระบบจริงทีหลัง)');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ยินดีต้อนรับ</h1>
        <p className="subtitle">เข้าสู่ระบบจองห้องเรียน</p>
        
        <form onSubmit={handleLogin}>
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

          <button type="submit" className="btn-submit">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="login-footer">
          <p>ยังไม่มีบัญชี? <Link href="/auth/register">ลงทะเบียน</Link></p>
          <Link href="/" className="back-link">← กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}