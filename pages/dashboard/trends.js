import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardTrends({ setup, admin }) {
  const [trends] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / Trends"
      titleTh="เทรนด์"
      titleEn="Trends"
      description="เทรนด์จากข้อมูลจำลองเพื่อความปลอดภัย"
      descriptionTh="ดูหัวข้อที่กำลังเป็นกระแสตามพื้นที่หรือข้อมูล mock"
      descriptionEn="View trending topics by location or mock trend data"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={trends.length === 0 ? 'ยังไม่มีข้อมูลเทรนด์ (empty state)' : ''}
      featureStatus="read-only"
    >
      <h2>Trends</h2>
      <p>รองรับ navigation และ auth guard แล้ว</p>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
