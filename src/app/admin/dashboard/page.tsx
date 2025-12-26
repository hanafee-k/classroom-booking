'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import './admin.css'; // อย่าลืมสร้างไฟล์ CSS นี้นะครับ

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // สถานะโหลดหน้าเว็บ
  const [classrooms, setClassrooms] = useState<any[]>([]);
  
  // State สำหรับฟอร์ม (ใช้ทั้งเพิ่มและแก้ไข)
  const [formData, setFormData] = useState({
    id: null as number | null, // ถ้ามี ID แปลว่ากำลังแก้ไข
    name: '',
    capacity: '',
    image_url: ''
  });

  // 1. เช็คสิทธิ์ Admin ก่อนเริ่ม (Security Check)
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert('⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้!');
        router.push('/');
        return;
      }

      // ถ้าผ่านด่าน ให้โหลดข้อมูลห้อง
      fetchClassrooms();
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  // ฟังก์ชันโหลดห้อง
  const fetchClassrooms = async () => {
    const { data } = await supabase.from('classrooms').select('*').order('id', { ascending: true });
    if (data) setClassrooms(data);
  };

  // ฟังก์ชันจัดการฟอร์ม
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันบันทึก (รองรับทั้ง เพิ่มใหม่ และ แก้ไข)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity) {
      alert('กรุณากรอกชื่อห้องและความจุครับ');
      return;
    }

    try {
      if (formData.id) {
        // --- กรณีแก้ไข (Update) ---
        const { error } = await supabase
          .from('classrooms')
          .update({
            name: formData.name,
            capacity: parseInt(formData.capacity),
            image_url: formData.image_url || null
          })
          .eq('id', formData.id);
        if (error) throw error;
        alert('✅ แก้ไขข้อมูลห้องสำเร็จ!');
      } else {
        // --- กรณีเพิ่มใหม่ (Insert) ---
        const { error } = await supabase
          .from('classrooms')
          .insert([{
            name: formData.name,
            capacity: parseInt(formData.capacity),
            image_url: formData.image_url || null,
            status: 'available'
          }]);
        if (error) throw error;
        alert('✅ เพิ่มห้องใหม่สำเร็จ!');
      }

      // รีเซ็ตฟอร์มและโหลดตารางใหม่
      setFormData({ id: null, name: '', capacity: '', image_url: '' });
      fetchClassrooms();

    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  // ฟังก์ชันเตรียมข้อมูลใส่ฟอร์มเพื่อแก้ไข
  const handleEdit = (room: any) => {
    setFormData({
      id: room.id,
      name: room.name,
      capacity: room.capacity.toString(),
      image_url: room.image_url || ''
    });
    // เลื่อนหน้าจอกลับไปที่ฟอร์มด้านบน
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ฟังก์ชันยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setFormData({ id: null, name: '', capacity: '', image_url: '' });
  };

  // ฟังก์ชันลบห้อง
  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ ยืนยันการลบห้องนี้? ประวัติการจองทั้งหมดของห้องนี้จะหายไปทันที!')) return;

    try {
      // 1. ลบ Booking ของห้องนี้ก่อน
      await supabase.from('bookings').delete().eq('room_id', id);
      // 2. ลบตัวห้อง
      const { error } = await supabase.from('classrooms').delete().eq('id', id);

      if (error) throw error;
      alert('ลบห้องเรียบร้อยแล้วครับ 👋');
      fetchClassrooms();
    } catch (error: any) {
      alert(`ลบไม่ได้: ${error.message}`);
    }
  };

  if (loading) return <div className="loading-screen">⏳ กำลังตรวจสอบสิทธิ์ Admin...</div>;

  return (
    <main>
      <div className="container admin-container">
        <h1 className="page-title">🛠️ แผงควบคุมผู้ดูแลระบบ</h1>
        
        {/* --- ฟอร์ม (เพิ่ม/แก้ไข) --- */}
        <section className="admin-card form-section">
          <div className="card-header">
            <h3>{formData.id ? '✏️ แก้ไขข้อมูลห้อง' : '➕ เพิ่มห้องเรียนใหม่'}</h3>
            {formData.id && (
              <button type="button" onClick={handleCancelEdit} className="btn-cancel-edit">
                ยกเลิกแก้ไข
              </button>
            )}
          </div>
          
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อห้องเรียน</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="เช่น ห้อง 4201" />
              </div>
              <div className="form-group">
                <label>ความจุ (คน)</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="เช่น 50" />
              </div>
              <div className="form-group full-width">
                <label>รูปภาพ (URL)</label>
                <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
              </div>
            </div>
            
            <button type="submit" className={`btn-submit ${formData.id ? 'btn-update' : ''}`}>
              {formData.id ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มห้อง'}
            </button>
          </form>
        </section>

        {/* --- ตารางรายการห้อง --- */}
        <section className="admin-card list-section">
          <h3>📋 รายชื่อห้องทั้งหมด ({classrooms.length})</h3>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>รูป</th>
                  <th>ชื่อห้อง</th>
                  <th>ความจุ</th>
                  <th>สถานะ</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      {room.image_url ? (
                        <img src={room.image_url} alt="Room" className="table-thumb" />
                      ) : (
                        <span className="no-img">ไม่มีรูป</span>
                      )}
                    </td>
                    <td><strong>{room.name}</strong></td>
                    <td>{room.capacity} คน</td>
                    <td>
                      <span className={`status-pill ${room.status === 'busy' ? 'busy' : 'free'}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn-icon edit" onClick={() => handleEdit(room)} title="แก้ไข">
                        ✏️
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(room.id)} title="ลบ">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {classrooms.length === 0 && (
                  <tr><td colSpan={5} className="empty-row">ยังไม่มีข้อมูลห้องเรียน</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}