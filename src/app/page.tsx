import Link from 'next/link';
import './home.css'; // เดี๋ยวสร้างไฟล์นี้

export default function Home() {
  return (
    <main className="home-container">
      
      {/* ส่วน Hero (แบนเนอร์หลัก) */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            ระบบจองห้องเรียน <br />
            <span className="highlight">RMUTSV Songkhla</span>
          </h1>
          <p className="hero-subtitle">
            สะดวก รวดเร็ว เช็คสถานะห้องว่างได้ทันที <br />
            จองห้องเรียนและห้องประชุมออนไลน์ได้ตลอด 24 ชม.
          </p>
          
          <div className="hero-buttons">
            <Link href="/dashboard" className="btn-primary">
              🔍 ค้นหาห้องว่าง
            </Link>
            <Link href="/auth/login" className="btn-secondary">
              เข้าสู่ระบบอาจารย์
            </Link>
          </div>
        </div>
      </section>

      {/* ส่วนฟีเจอร์ (จุดเด่น) */}
      <section className="features-section">
        <div className="feature-item">
          <div className="icon">📅</div>
          <h3>จองล่วงหน้า</h3>
          <p>วางแผนการสอนได้ง่ายๆ ด้วยระบบจองล่วงหน้า</p>
        </div>
        <div className="feature-item">
          <div className="icon">📱</div>
          <h3>ใช้งานง่าย</h3>
          <p>รองรับทั้งมือถือและคอมพิวเตอร์ ดีไซน์ทันสมัย</p>
        </div>
        <div className="feature-item">
          <div className="icon">⚡</div>
          <h3>อนุมัติไว</h3>
          <p>ระบบแจ้งเตือนสถานะการจองทันทีผ่านระบบ</p>
        </div>
      </section>
    </main>
  );
}