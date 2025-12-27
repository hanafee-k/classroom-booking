'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ใช้สำหรับเปลี่ยนหน้า
import { supabase } from '@/utils/supabase'; // เรียกใช้ Supabase
import Link from 'next/link'; // ใช้สำหรับลิงก์
import './dashboard.css';

export default function Dashboard() {
  const router = useRouter();
  
  // --- State สำหรับข้อมูลจริง ---
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // --- State สำหรับ UI ---
  const [darkMode, setDarkMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  // 1. โหลดข้อมูลเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    const initData = async () => {
      // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);

      // เช็ค User ที่ล็อกอิน
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }

      // โหลดข้อมูลห้องและตารางจอง
      await fetchData();
      setLoading(false);
    };

    initData();
  }, []);

  // ฟังก์ชันดึงข้อมูลจาก Supabase
  const fetchData = async () => {
    const { data: rooms } = await supabase.from('classrooms').select('*').order('id');
    const { data: allBookings } = await supabase.from('bookings').select('*');
    
    if (rooms) setClassrooms(rooms);
    if (allBookings) setBookings(allBookings);
  };

  // 2. Logic เช็คว่าห้องว่างไหม (ทำงานกับข้อมูลจริง)
  const isRoomBusy = (roomId: number) => {
    if (!selectedDate || !startTime || !endTime) return false;

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);

    // กรองเอาเฉพาะการจองของห้องนี้
    const roomBookings = bookings.filter(b => b.room_id === roomId);

    for (const booking of roomBookings) {
      const existingStart = new Date(booking.start_time);
      const existingEnd = new Date(booking.end_time);

      // สูตรเช็คเวลาชนกัน (Overlap)
      if (start < existingEnd && end > existingStart) {
        return true; // ชน!
      }
    }
    return false; // ว่าง
  };

  // 3. Logic การกดจอง (บันทึกลง DB)
  const handleBooking = async (room: any) => {
    // เช็คว่าล็อกอินหรือยัง
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

    // เช็คจองย้อนหลัง
    const startDateTime = new Date(`${selectedDate}T${startTime}`);
    const now = new Date();
    if (startDateTime < now) {
      alert('❌ ไม่สามารถจองย้อนหลังได้ครับ (เวลาที่เลือกผ่านมาแล้ว)');
      return;
    }

    // เช็คห้องว่างอีกรอบ (Double Check)
    if (isRoomBusy(room.id)) {
      alert('❌ ห้องนี้ไม่ว่างในช่วงเวลาที่คุณเลือกครับ มีคนจองตัดหน้าไปแล้ว!');
      return;
    }

    // แปลงวันที่เป็นไทยสวยๆ
    const thaiDate = new Date(selectedDate).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    if (!confirm(`ยืนยันการจองห้อง ${room.name}\nวันที่: ${thaiDate}\nเวลา: ${startTime} - ${endTime} น.`)) {
      return;
    }

    try {
      // ดึงชื่อผู้ใช้
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const userName = profile?.full_name || user.email;

      // บันทึกลง Supabase
      const { error } = await supabase.from('bookings').insert([{
        room_id: room.id,
        user_id: user.id,
        student_name: userName,
        start_time: startDateTime.toISOString(),
        end_time: new Date(`${selectedDate}T${endTime}`).toISOString()
      }]);

      if (error) throw error;

      alert('✅ จองห้องสำเร็จเรียบร้อย!');
      fetchData(); // โหลดข้อมูลใหม่ทันที (เพื่อให้สถานะปุ่มเปลี่ยน)

    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              <h1 className="text-xl font-bold text-blue-600">RMUTSV Booking</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* ปุ่ม Dark Mode */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                )}
              </button>
              
              {/* Profile Icon */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user ? user.email[0].toUpperCase() : '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 pb-24 px-4 max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              ตารางจองห้องเรียน
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">เลือกวันและเวลาที่ต้องการใช้งาน เพื่อตรวจสอบสถานะ</p>
          </div>

          {/* Date & Time Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg mb-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  วันที่ต้องการ
                </label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 px-4 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    ตั้งแต่
                  </label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 px-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    ถึงเวลา
                  </label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 px-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">รายการห้องเรียน</h3>
          </div>

          {/* Room Cards Loop */}
          <div className="space-y-6">
            {classrooms.map((room) => {
              // คำนวณสถานะสดๆ จากข้อมูลใน DB
              const isBusy = isRoomBusy(room.id);
              
              return (
                <div 
                  key={room.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
                >
                  {/* Room Image */}
                  <div className="h-44 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 relative flex items-center justify-center overflow-hidden">
                    {room.image_url ? (
                      <>
                        <img 
                          src={room.image_url} 
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <span className="text-5xl font-bold text-white/20 select-none z-0">
                          {room.name.charAt(0)}
                        </span>
                      </>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 z-20 ${isBusy ? 'bg-red-500' : 'bg-green-500'} text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm`}>
                      {isBusy ? (
                        <>
                          ไม่ว่าง
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                          </svg>
                        </>
                      ) : (
                        <>
                          ว่าง
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white leading-tight mb-1">
                          {room.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {room.location || '-'}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">
                        <svg className="w-4 h-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                        </svg>
                        {room.capacity} คน
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button 
                        onClick={() => handleBooking(room)}
                        disabled={isBusy}
                        className={`w-full py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                          isBusy 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.98]'
                        }`}
                      >
                        <span>{isBusy ? 'ช่วงเวลานี้ถูกจองแล้ว' : 'จองห้องนี้'}</span>
                        {!isBusy && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
          <div className="flex justify-between items-center max-w-md mx-auto h-16">
            <Link href="/" className="flex flex-col items-center gap-1 text-blue-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span className="text-[10px] font-medium">หน้าแรก</span>
            </Link>
            
            {/* แก้ลิงก์ให้ไปหน้า History */}
            <Link href="/history" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <span className="text-[10px] font-medium">ประวัติ</span>
            </Link>
          </div>
        </nav>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Kanit', sans-serif;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
        }
        
        .dark input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.8);
        }
      `}</style>
    </div>
  );
}