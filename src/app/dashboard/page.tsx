'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import './dashboard.css';

export default function Dashboard() {
  const router = useRouter();
  // ✅ เพิ่มบรรทัดนี้: สร้างตัวแปร supabase
  const supabase = createClient();

  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // State สำหรับเวลาที่เลือกจอง
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  // State สำหรับประเภทห้องและการค้นหา
  const [roomType, setRoomType] = useState<'all' | 'classroom' | 'lab'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initData = async () => {
      // 1. เช็ค User
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
         // ถ้าไม่ได้ล็อกอิน อาจจะเด้งไปหน้า login หรือปล่อยให้ดูห้องเฉยๆ ก็ได้
         // router.push('/auth/login'); 
      }

      // 2. ตั้งค่าวันที่เริ่มต้นเป็น "วันนี้"
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);

      await fetchData();
      setLoading(false);
    };

    initData();
  }, []);

  // โหลดข้อมูลห้อง + ข้อมูลการจอง
  const fetchData = async () => {
    const { data: rooms } = await supabase.from('classrooms').select('*').order('id');
    const { data: allBookings } = await supabase.from('bookings').select('*');

    if (rooms) setClassrooms(rooms);
    if (allBookings) setBookings(allBookings);
  };

  // ฟังก์ชันเช็คว่าห้องว่างไหม ในช่วงเวลาที่เลือก
  const isRoomBusy = (roomId: number) => {
    if (!selectedDate || !startTime || !endTime) return false;

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);

    const roomBookings = bookings.filter(b => b.room_id === roomId);

    for (const booking of roomBookings) {
      const existingStart = new Date(booking.start_time);
      const existingEnd = new Date(booking.end_time);

      // สูตรเช็คเวลาชนกัน (Overlap)
      if (start < existingEnd && end > existingStart) {
        return true;
      }
    }
    return false;
  };

  // ฟังก์ชันกรองห้อง
  const getFilteredRooms = () => {
    let filtered = classrooms;

    // กรองตามประเภท
    if (roomType === 'classroom') {
      filtered = filtered.filter(room => room.name.includes('ห้องเรียน'));
    } else if (roomType === 'lab') {
      filtered = filtered.filter(room => room.name.includes('Lab') || room.name.includes('ปฏิบัติการ'));
    }

    // กรองตามคำค้นหา
    if (searchQuery.trim()) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // ฟังก์ชันกดจอง
  const handleBooking = async (room: any) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนจองห้องครับ');
      router.push('/auth/login');
      return;
    }

    if (!selectedDate || !startTime || !endTime) {
      alert('กรุณาเลือกวันและเวลาที่ต้องการจองให้ครบถ้วน');
      return;
    }

    if (startTime >= endTime) {
      alert('เวลาเริ่มต้องมาก่อนเวลาสิ้นสุดครับ');
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${startTime}`);
    const now = new Date();

    if (startDateTime < now) {
      alert('❌ ไม่สามารถจองย้อนหลังได้ครับ (เวลาที่เลือกผ่านมาแล้ว)');
      return;
    }

    if (isRoomBusy(room.id)) {
      alert('❌ ห้องนี้ไม่ว่างในช่วงเวลาที่คุณเลือกครับ มีคนจองตัดหน้าไปแล้ว!');
      return;
    }

    const thaiDate = new Date(selectedDate).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    if (!confirm(`ยืนยันการจองห้อง ${room.name}\nวันที่: ${thaiDate}\nเวลา: ${startTime} - ${endTime} น.`)) {
      return;
    }

    try {
      // ดึงชื่อจริงจาก Profiles (ถ้ามี) หรือใช้ Email
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const userName = profile?.full_name || user.email;

      const { error } = await supabase.from('bookings').insert([{
        room_id: room.id,
        user_id: user.id,
        student_name: userName,
        start_time: startDateTime.toISOString(),
        end_time: new Date(`${selectedDate}T${endTime}`).toISOString()
      }]);

      if (error) throw error;

      alert('✅ จองห้องสำเร็จเรียบร้อย!');
      fetchData(); // โหลดข้อมูลใหม่

    } catch (error: any) {
      alert(`จองไม่สำเร็จ: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>กำลังโหลดข้อมูลห้องเรียน...</p>
      </div>
    );
  }

  const filteredRooms = getFilteredRooms();

  return (
    <main className="main-wrapper">
      <div className="dashboard-container">

        <header className="dashboard-header">
          <div className="header-contenttt">
            <div style={{ marginBottom: '20px', paddingLeft: '10px' }}>
              <h1>ระบบจองห้องเรียน</h1>
              <p>เลือกวันและเวลาที่ต้องการใช้งาน เพื่อตรวจสอบสถานะห้องว่าง</p>
            </div>
          </div>

          <div className="header-content">
            <h1>วันที่ต้องการ</h1>
          </div>

          {/* --- วันที่ --- */}
          <div className="date-selector">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* --- เวลา --- */}
          <div className="time-row">
            <div className="time-col">
              <label>ตั้งแต่</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="time-col">
              <label>ถึงเวลา</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* --- ประเภทห้อง --- */}
          <div className="room-type-section">
            <h2>ประเภทห้อง</h2>
            <div className="room-type-buttons">
              <button
                className={`type-btn ${roomType === 'all' ? 'active' : ''}`}
                onClick={() => setRoomType('all')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                ทั้งหมด
              </button>
              <button
                className={`type-btn ${roomType === 'classroom' ? 'active' : ''}`}
                onClick={() => setRoomType('classroom')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                ห้องเรียน
              </button>
              <button
                className={`type-btn ${roomType === 'lab' ? 'active' : ''}`}
                onClick={() => setRoomType('lab')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Lab
              </button>
            </div>
          </div>

          {/* --- ช่องค้นหา --- */}
          <div className="search-section">
            <button className="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              ค้นหาห้องว่าง
            </button>
            <input
              type="text"
              placeholder="ค้นหาชื่อห้อง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        {/* --- แสดงรายการห้อง --- */}
        <div className="room-grid">
          {filteredRooms.length === 0 ? (
            <div className="no-results">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <p>ไม่พบห้องที่ตรงกับเงื่อนไขที่เลือก</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isBusy = isRoomBusy(room.id);

              return (
                <div key={room.id} className={`room-card ${isBusy ? 'unavailable' : ''}`}>
                  <div className="room-image">
                    {room.image_url ? (
                      <img src={room.image_url} alt={room.name} />
                    ) : (
                      <div className="no-image-placeholder">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                    <div className={`status-badge ${isBusy ? 'busy' : 'available'}`}>
                      {isBusy ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                          ไม่ว่าง
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          ว่าง
                        </>
                      )}
                    </div>
                  </div>

                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <div className="room-capacity">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>รองรับ {room.capacity} คน</span>
                    </div>

                    {isBusy ? (
                      <button className="btn-unavailable" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                        </svg>
                        ช่วงเวลานี้ถูกจองแล้ว
                      </button>
                    ) : (
                      <button className="btn-book" onClick={() => handleBooking(room)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        จองห้องนี้
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </main>
  );
}

