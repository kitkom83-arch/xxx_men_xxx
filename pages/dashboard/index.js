import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardHome({ setup, admin }) {
  return (
    <ProtectedLayout
      title="Dashboard"
      titleTh="แดชบอร์ด"
      titleEn="Dashboard"
      description="ภาพรวมระบบในโหมดปลอดภัย (read-only + dry-run)"
      descriptionTh="ดูสถานะระบบ โหมดการทำงาน การใช้งาน API และความปลอดภัยโดยรวม"
      descriptionEn="View system status, operation mode, API usage, and overall safety state"
      admin={admin}
      mode={setup?.mode || 'mock'}
      featureStatus="demo"
    >
      <h2>Dashboard Overview</h2>
      <p>หน้านี้พร้อมใช้งานแล้ว และไม่เรียก write action จริง</p>
      <ul className="checklist">
        <li>Mock/demo mode เป็นค่าเริ่มต้น</li>
        <li>Protected route ต้อง login ก่อนเข้าใช้งาน</li>
        <li>ไม่มีการแสดง secret แบบเต็ม</li>
      </ul>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
