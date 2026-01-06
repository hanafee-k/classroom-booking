'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import './history.css';

export default function History() {
  // 🟢 เพิ่มบรรทัดนี้: สร้างตัวแปร supabase เพื่อใช้ใน component นี้
  const supabase = createClient();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // ดึงข้อมูลการจอง + ข้อมูลห้อง (Join table)
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        classrooms (name, image_url)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }); // ใหม่สุดขึ้นก่อน

    if (data) setBookings(data);
    setLoading(false);
  };

  // --- 🕒 ฟังก์ชันแปลงเวลาเป็นแบบไทย ---
  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' น.';
  };

  // ฟังก์ชันยกเลิกการจอง
  const handleCancel = async (bookingId: number) => {
    if (!confirm('ต้องการยกเลิกการจองนี้ใช่ไหม?')) return;

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (!error) {
      alert('ยกเลิกเรียบร้อย');
      fetchHistory(); // โหลดข้อมูลใหม่
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop: '50px'}}>กำลังโหลดประวัติ...</div>;
  return (
    <main>
      <div className="history-container">
        <h1>📜 ประวัติการจองของฉัน</h1>
        <p>ตรวจสอบรายการจองห้องเรียนทั้งหมดของคุณ</p>

        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>ห้องเรียน</th>
                <th>วันที่และเวลา (เริ่ม - จบ)</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="room-cell">
                      {booking.classrooms?.image_url && (
                        <img src={booking.classrooms.image_url} alt="Room" className="mini-thumb" />
                      )}
                      <span>{booking.classrooms?.name || 'ไม่ระบุห้อง'}</span>
                    </div>
                  </td>
                  <td>
                    {/* เรียกใช้ฟังก์ชันแปลงเวลาไทยตรงนี้ */}
                    <div className="timestamp">
                      เริ่ม: {formatThaiDate(booking.start_time)} <br/>
                      ถึง: {formatThaiDate(booking.end_time)}
                    </div>
                  </td>
                  <td>
                    <button className="btn-cancel-booking" onClick={() => handleCancel(booking.id)}>
                      ยกเลิกจอง ❌
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={3} className="empty-state">ไม่มีประวัติการจอง</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}