// src/types/index.ts

// ข้อมูลห้องเรียน (ตรงกับ Database)
export interface Room {
  id: number;
  name: string;
  capacity: number;
  facilities: string[] | null;
  image_url: string | null;
  is_active: boolean;
}

// ข้อมูลการจอง
export interface Booking {
  id: number;
  room_id: number;
  user_id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}