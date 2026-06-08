import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardTrends({ setup, admin }) {
  const [trends] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / Trends"
      description="เทรนด์จากข้อมูลจำลองเพื่อความปลอดภัย"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={trends.length === 0 ? 'ยังไม่มีข้อมูลเทรนด์ (empty state)' : ''}
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
