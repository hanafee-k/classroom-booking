'use client';

import { useEffect, useState } from 'react'; // เพิ่ม useEffect
import { supabase } from '@/utils/supabase';
import './admin.css';

export default function AdminPage() {
  // --- ส่วนฟอร์มเพิ่มห้อง ---
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    image_url: ''
  });

  // --- ส่วนรายการห้อง (สำหรับลบ) ---
  const [classrooms, setClassrooms] = useState<any[]>([]);

  // ฟังก์ชันโหลดข้อมูลห้อง (เอามาโชว์ในตารางด้านล่าง)
  const fetchClassrooms = async () => {
    const { data } = await supabase
      .from('classrooms')
      .select('*')
      .order('id', { ascending: true });
    
    if (data) setClassrooms(data);
  };

  // โหลดข้อมูลทันทีที่เปิดหน้า
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชัน 1: เพิ่มห้องใหม่
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity) {
      alert('กรุณากรอกชื่อห้องและความจุครับ');
      return;
    }

    try {
      const { error } = await supabase
        .from('classrooms')
        .insert([{
          name: formData.name,
          capacity: parseInt(formData.capacity),
          image_url: formData.image_url || null,
          status: 'available'
        }]);

      if (error) throw error;

      alert('✅ เพิ่มห้องสำเร็จ!');
      setFormData({ name: '', capacity: '', image_url: '' }); // เคลียร์ฟอร์ม
      fetchClassrooms(); // โหลดตารางใหม่

    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // ฟังก์ชัน 2: ลบห้อง (New!)
  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันที่จะลบห้องนี้? (ประวัติการจองจะหายไปด้วยนะ)')) return;

    try {
      // ต้องลบประวัติการจองของห้องนี้ก่อน (Foreign Key constraint)
      await supabase.from('bookings').delete().eq('room_id', id);

      // แล้วค่อยลบห้อง
      const { error } = await supabase.from('classrooms').delete().eq('id', id);

      if (error) throw error;

      alert('ลบห้องเรียบร้อยครับ 👋');
      fetchClassrooms(); // โหลดตารางใหม่

    } catch (error: any) {
      alert(`ลบไม่ได้: ${error.message}`);
    }
  };

  return (
    <main>
      <div className="container admin-container">
        <h1>🛠️ จัดการห้องเรียน (Admin)</h1>
        
        {/* --- ส่วนที่ 1: ฟอร์มเพิ่มห้อง --- */}
        <section className="admin-section">
          <h3>➕ เพิ่มห้องใหม่</h3>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ชื่อห้องเรียน</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="ชื่อห้อง..." />
            </div>
            <div className="form-group">
              <label>ความจุ</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="จำนวนคน..." />
            </div>
            <div className="form-group">
              <label>รูปภาพ (URL)</label>
              <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
            </div>
            <button type="submit" className="btn-submit">บันทึกข้อมูล</button>
          </form>
        </section>

        <hr className="divider" />

        {/* --- ส่วนที่ 2: ตารางรายการห้องที่มีอยู่ --- */}
        <section className="admin-section">
          <h3>📋 รายชื่อห้องทั้งหมด ({classrooms.length})</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ชื่อห้อง</th>
                  <th>ความจุ</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.id}</td>
                    <td>{room.name}</td>
                    <td>{room.capacity}</td>
                    <td>
                      <span className={room.status === 'busy' ? 'text-red' : 'text-green'}>
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(room.id)}>
                        ลบ 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}