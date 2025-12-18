'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import './dashboard.css';

interface Classroom {
  id: number;
  name: string;
  capacity: number;
  status: string;
  image_url: string;
  booked_by: string | null; // เพิ่มตัวแปรมารับชื่อคนจอง
}

export default function DashboardPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) setClassrooms(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // --- จองห้อง ---
  const handleBooking = async (room: Classroom) => {
    const userName = window.prompt(`คุณต้องการจองห้อง "${room.name}"\nกรุณากรอกชื่อของคุณ:`);
    if (!userName) return;

    try {
      // 1. บันทึกประวัติ (History)
      await supabase.from('bookings').insert([{ room_id: room.id, student_name: userName }]);

      // 2. อัปเดตสถานะห้อง + ใส่ชื่อคนจอง (booked_by)
      const { error } = await supabase
        .from('classrooms')
        .update({ 
          status: 'busy',
          booked_by: userName // <-- บันทึกชื่อคนจองตรงนี้
        })
        .eq('id', room.id);

      if (error) throw error;

      alert('✅ จองห้องสำเร็จเรียบร้อย!');
      fetchClassrooms();

    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  // --- คืนห้อง ---
  const handleCancel = async (room: Classroom) => {
    if (!confirm(`ต้องการคืนห้อง ${room.name} ใช่ไหม?`)) return;

    try {
      // เคลียร์สถานะเป็นว่าง และลบชื่อคนจองออก (booked_by = null)
      const { error } = await supabase
        .from('classrooms')
        .update({ 
          status: 'available',
          booked_by: null 
        })
        .eq('id', room.id);

      if (error) throw error;

      alert('👌 คืนห้องเรียบร้อย!');
      fetchClassrooms();

    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <main>
      <div className="container dashboard-container">
        <header className="dashboard-header">
          <h1>🏫 รายการห้องเรียน</h1>
          <p>ระบบจองห้องเรียนแบบ Real-time</p>
        </header>

        {loading ? (
          <p className="loading-text">⏳ กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="room-grid">
            {classrooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-image">
                  <img src={room.image_url || 'https://placehold.co/600x400?text=No+Image'} alt={room.name} />
                  <span className={`status-badge ${room.status}`}>
                    {room.status === 'available' ? 'ว่าง' : 'ไม่ว่าง'}
                  </span>
                </div>
                
                <div className="room-info">
                  <h3>{room.name}</h3>
                  <p>👥 รองรับ: {room.capacity} คน</p>
                  
                  {/* ถ้าห้องไม่ว่าง ให้โชว์ชื่อคนจองด้วย */}
                  {room.status === 'busy' && room.booked_by && (
                    <div className="booker-info">
                      🔒 จองโดย: <strong>{room.booked_by}</strong>
                    </div>
                  )}

                  {room.status === 'available' ? (
                    <button className="btn-book" onClick={() => handleBooking(room)}>
                      จองห้องนี้ ✅
                    </button>
                  ) : (
                    <button className="btn-cancel" onClick={() => handleCancel(room)}>
                      ยกเลิกการจอง ❌
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}