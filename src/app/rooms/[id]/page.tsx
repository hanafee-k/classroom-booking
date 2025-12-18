export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>รายละเอียดห้อง {params.id}</h1>
      <p>หน้านี้ยังไม่เปิดใช้งานครับ</p>
    </div>
  );
}