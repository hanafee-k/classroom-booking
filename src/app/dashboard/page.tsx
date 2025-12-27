'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import './dashboard.css';

export default function Dashboard() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // State สำหรับเวลาที่เลือกจอง
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  useEffect(() => {
    const initData = async () => {
      // 1. เช็ค User
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
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

      if (start < existingEnd && end > existingStart) {
        return true; // ชน! ไม่ว่าง
      }
    }
    return false; // ว่าง
  };

  // ฟังก์ชันกดจอง (ฉบับอัปเกรด: ห้ามจองย้อนหลัง + แจ้งเตือนไทย)
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

    // --- 🕒 ส่วนที่เพิ่มใหม่: เช็คว่าจองย้อนหลังไหม? ---
    const startDateTime = new Date(`${selectedDate}T${startTime}`);
    const now = new Date(); // เวลาปัจจุบัน

    // ถ้าเวลาที่เลือก น้อยกว่า เวลาปัจจุบัน (แปลว่าผ่านมาแล้ว)
    if (startDateTime < now) {
      alert('❌ ไม่สามารถจองย้อนหลังได้ครับ (เวลาที่เลือกผ่านมาแล้ว)');
      return;
    }
    // ----------------------------------------------------

    if (isRoomBusy(room.id)) {
      alert('❌ ห้องนี้ไม่ว่างในช่วงเวลาที่คุณเลือกครับ มีคนจองตัดหน้าไปแล้ว!');
      return;
    }

    // แปลงวันที่เป็นไทย
    const thaiDate = new Date(selectedDate).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    if (!confirm(`ยืนยันการจองห้อง ${room.name}\nวันที่: ${thaiDate}\nเวลา: ${startTime} - ${endTime} น.`)) {
      return;
    }

    try {
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
      fetchData(); 

    } catch (error: any) {
      alert(`จองไม่สำเร็จ: ${error.message}`);
    }
  };

  if (loading) return <div className="loading-text">กำลังโหลดข้อมูลห้องเรียน...</div>;

  return (
    <main>
      <div className="dashboard-container">
        
        <header className="dashboard-header">
          <h1>📅 ตารางจองห้องเรียน</h1>
          <p>เลือกวันและเวลาที่ต้องการใช้งาน เพื่อตรวจสอบสถานะห้องว่าง</p>
          
          {/* --- ส่วนเลือกวันเวลา --- */}
          <div className="time-selector-box">
            <div className="time-input-group">
              <label>วันที่ต้องการ:</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>
            <div className="time-input-group">
              <label>ตั้งแต่:</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="time-input-group">
              <label>ถึงเวลา:</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </header>

        {/* --- แสดงรายการห้อง --- */}
        <div className="room-grid">
          {classrooms.map((room) => {
            const isBusy = isRoomBusy(room.id); 

            return (
              <div key={room.id} className={`room-card ${isBusy ? 'unavailable' : ''}`}>
                <div className="room-image">
                  {room.image_url ? (
                    <img src={room.image_url} alt={room.name} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                  <span className={`status-badge ${isBusy ? 'busy' : 'available'}`}>
                    {isBusy ? 'ไม่ว่าง ⛔' : 'ว่าง ✅'}
                  </span>
                </div>

                <div className="room-info">
                  <h3>{room.name}</h3>
                  <p>👥 รองรับ: {room.capacity} คน</p>
                  
                  {isBusy ? (
                    <button className="btn-cancel" disabled style={{opacity: 0.6, cursor: 'not-allowed'}}>
                      ช่วงเวลานี้ถูกจองแล้ว
                    </button>
                  ) : (
                    <button className="btn-book" onClick={() => handleBooking(room)}>
                      จองห้องนี้
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}