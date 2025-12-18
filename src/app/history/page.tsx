'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import './history.css';
import Navbar from '@/components/common/Navbar';

export default function HistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      // ดึงข้อมูลจากตาราง bookings และเชื่อมไปหาตาราง classrooms เพื่อเอาชื่อห้องมาด้วย
      // สังเกตตรง select: เราสั่ง classrooms(name) ได้เลยเพราะมี Foreign Key เชื่อมกันอยู่
      const { data, error } = await supabase
        .from('bookings')
        .select('*, classrooms(name, image_url)')
        .order('id', { ascending: false }); // เรียงจากล่าสุดไปเก่าสุด

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      // alert(error.message); // ปิดไว้ก่อนเผื่อรำคาญ
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ฟังก์ชันแปลงวันที่ให้เป็นภาษาไทยอ่านง่ายๆ
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <main>
      <div className="container history-container">
        <h1>📜 ประวัติการจองทั้งหมด</h1>
        <p>บันทึกการใช้งานระบบ (เรียงจากล่าสุด)</p>

        {loading ? (
          <p>⏳ กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ห้องเรียน</th>
                  <th>ผู้จอง</th>
                  <th>เวลาที่ทำรายการ</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((item, index) => (
                  <tr key={item.id}>
                    <td>{bookings.length - index}</td>
                    <td>
                      <div className="room-cell">
                        {/* เช็คก่อนว่ามีข้อมูล classrooms ไหม (เผื่อห้องโดนลบ) */}
                        {item.classrooms?.image_url && (
                          <img src={item.classrooms.image_url} alt="room" className="mini-thumb" />
                        )}
                        <span>{item.classrooms?.name || 'ไม่ทราบชื่อห้อง'}</span>
                      </div>
                    </td>
                    <td className="student-name">{item.student_name}</td>
                    <td className="timestamp">{formatDate(item.booking_time || item.created_at)}</td>
                  </tr>
                ))}
                
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{textAlign: 'center', padding: '20px'}}>
                      ยังไม่มีประวัติการจองครับ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}